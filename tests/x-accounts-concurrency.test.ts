import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findPostgresBin, startRealPg, type RealPg } from "./helpers/realpg";

/**
 * X account bindings and slot grants under TRUE concurrency: many simultaneous connections to a real
 * PostgreSQL server. Skipped automatically if no PostgreSQL server binaries are installed.
 */
const available = !!findPostgresBin();
let pg: RealPg;

beforeAll(async () => {
  if (available) pg = await startRealPg();
}, 120_000);
afterAll(async () => {
  if (pg) await pg.stop();
}, 60_000);

let n = 0;
const uuid = () => `00000000-0000-4000-9000-${String(++n).padStart(12, "0")}`;
const q = (text: string, values: unknown[] = []) => pg.pool.query(text, values);
type R = { status: string };
const register = async (user: string, name: string) => (await q("select public.register_x_account($1::uuid, $2) as r", [user, name])).rows[0].r as R;
const statuses = (rs: R[]) => rs.reduce<Record<string, number>>((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {});

async function users(count: number) {
  const ids = Array.from({ length: count }, uuid);
  await q("insert into auth.users (id, email) select x, x || '@x.com' from unnest($1::uuid[]) x", [ids]);
  return ids;
}

describe.skipIf(!available)("X account bindings under real concurrency (PostgreSQL)", () => {
  it("one account, 25 simultaneous registrations of different names: exactly 2 link (capacity holds)", async () => {
    const [u] = await users(1);
    const rs = await Promise.all(Array.from({ length: 25 }, (_, i) => register(u, `cap_name_${i}`)));
    expect(statuses(rs)).toEqual({ linked: 2, no_slot: 23 });
    expect((await q("select count(*)::int as c from public.x_account_bindings where user_id = $1 and status = 'active'", [u])).rows[0].c).toBe(2);
  });

  it("one account, 10 simultaneous registrations of the SAME name: one row, the rest already_linked", async () => {
    const [u] = await users(1);
    const rs = await Promise.all(Array.from({ length: 10 }, (_, i) => register(u, i % 2 ? "@SameName" : "samename")));
    expect(statuses(rs)).toEqual({ linked: 1, already_linked: 9 });
  });

  it("30 accounts racing for one username with case and @ variations: linked to exactly one account", async () => {
    const ids = await users(30);
    const variants = ["RaceName", "racename", "RACENAME", "@raceName", " @RaceNAME "];
    const rs = await Promise.all(ids.map((u, i) => register(u, variants[i % variants.length])));
    expect(statuses(rs)).toEqual({ linked: 1, taken: 29 });
    expect((await q("select count(*)::int as c from public.x_account_bindings where normalized_username = 'racename' and status = 'active'")).rows[0].c).toBe(1);
  });

  it("20 simultaneous duplicate deliveries of one verified slot payment grant exactly one slot", async () => {
    const [u] = await users(1);
    const o = (await q("select public.create_checkout_order($1,'nowpayments','X_ACCOUNT_SLOT',null,99,'USD',null,null,3600) as r", [u])).rows[0].r as { order_id: string };
    await q("select public.attach_order_ref($1, $2, null)", [o.order_id, `np_${o.order_id}`]);
    const effect = JSON.stringify({ kind: "payment", provider_payment_id: `np_${o.order_id}`, order_id: o.order_id, status: "succeeded", fulfill: true, product: "X_ACCOUNT_SLOT", amount_minor: 99, currency: "USD", asset: null, provider_status: "finished" });
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) =>
      q("select public.billing_apply('nowpayments',$1,'t',now(),$2::jsonb) as r", [`slot_evt_${o.order_id}_${i % 4}`, effect]).then((r) => (r.rows[0].r as { result: string }).result),
    ));
    expect(results.filter((r) => r === "applied")).toHaveLength(1);
    expect(results.every((r) => ["applied", "duplicate", "duplicate_fulfillment"].includes(r))).toBe(true);
    expect((await q("select count(*)::int as c from public.account_slot_grants where user_id = $1", [u])).rows[0].c).toBe(1);
    expect((await q("select public.x_account_allowed_slots($1) as n", [u])).rows[0].n).toBe(3);
  });

  it("concurrent duplicate support releases change the binding once; the name is then free for exactly one new account", async () => {
    const [owner, ...others] = await users(11);
    await register(owner, "SupportRace");
    const id = (await q("select id from public.x_account_bindings where normalized_username = 'supportrace' and status = 'active'")).rows[0].id;
    const rel = await Promise.all(Array.from({ length: 5 }, () => q("select public.support_change_x_account($1, 'release', 'support:dana', 'Ticket 99: verified unlink') as r", [id]).then((r) => r.rows[0].r as R)));
    expect(statuses(rel)).toEqual({ released: 1, not_active: 4 });
    expect((await q("select count(*)::int as c from public.x_account_binding_events where binding_id = $1 and action = 'released'", [id])).rows[0].c).toBe(1);
    const rs = await Promise.all(others.map((u) => register(u, "supportrace")));
    expect(statuses(rs)).toEqual({ linked: 1, taken: 9 });
  });

  it("a support replace racing a user registration of the same new name never double-links", async () => {
    const [a, b] = await users(2);
    await register(a, "OldTypo");
    const id = (await q("select id from public.x_account_bindings where normalized_username = 'oldtypo' and status = 'active'")).rows[0].id;
    const [s, r] = await Promise.all([
      q("select public.support_change_x_account($1, 'replace', 'support:eve', 'Ticket 5: spelling fix', 'Contested') as r", [id]).then((x) => x.rows[0].r as R, (e: Error) => ({ status: `error:${e.message}` })),
      register(b, "contested"),
    ]);
    expect((await q("select count(*)::int as c from public.x_account_bindings where normalized_username = 'contested' and status = 'active'")).rows[0].c).toBe(1);
    // whichever lost changed nothing: if the support replace failed, the old binding is still active
    if (s.status !== "replaced") {
      expect(r.status).toBe("linked");
      expect((await q("select status from public.x_account_bindings where id = $1", [id])).rows[0].status).toBe("active");
    } else {
      expect(r.status).toBe("taken");
    }
  });
});
