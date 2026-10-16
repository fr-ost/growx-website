import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findPostgresBin, startRealPg, type RealPg } from "./helpers/realpg";

/** Early-bird inventory edits under TRUE concurrency (real PostgreSQL, separate connections). Skips without PostgreSQL. */
const available = !!findPostgresBin();
let pg: RealPg;
let ADMIN: string;

beforeAll(async () => {
  if (!available) return;
  pg = await startRealPg();
  ADMIN = (await users(1))[0];
  await q("insert into public.admins (user_id) values ($1)", [ADMIN]);
}, 120_000);
afterAll(async () => {
  if (pg) await pg.stop();
}, 60_000);

let n = 0;
const uuid = () => `00000000-0000-4000-a000-${String(++n).padStart(12, "0")}`;
const q = (text: string, values: unknown[] = []) => pg.pool.query(text, values);
async function users(count: number) {
  const ids = Array.from({ length: count }, uuid);
  await q("insert into auth.users (id, email) select x, x || '@a.com' from unnest($1::uuid[]) x", [ids]);
  return ids;
}
const earlyOrder = async (u: string) => (await q("select public.create_checkout_order($1,'nowpayments','PRO_LIFETIME_EARLY','PRO_LIFETIME',2999,'USD',null,null,3600) as r", [u])).rows[0].r as { status: string; order_id?: string; code?: string };
const status = async () => (await q("select public.early_bird_status() as s")).rows[0].s as { sold: number; remaining: number; open_reservations: number };
const reset = async () => {
  await q("truncate public.early_adopter_slots, public.webhook_events, public.payments, public.subscriptions, public.checkout_orders cascade");
  await q("update public.early_bird_settings set enabled = true, sales_cap = 100, campaign_allocation = 100");
};

describe.skipIf(!available)("early-bird editor under real concurrency (PostgreSQL)", () => {
  it("after an admin sets 5 remaining, 40 simultaneous checkouts reserve exactly 5", async () => {
    await reset();
    expect(((await q("select public.admin_set_early_bird($1, 5, true, 'test', null) as r", [ADMIN])).rows[0].r as { status: string }).status).toBe("saved");
    const res = await Promise.all((await users(40)).map(earlyOrder));
    expect(res.filter((r) => r.status === "ok")).toHaveLength(5);
    expect(res.filter((r) => r.status !== "ok").every((r) => r.code === "early_unavailable")).toBe(true);
    expect((await status()).open_reservations).toBe(5);
  });

  it("checkouts racing an admin setting 0 never exceed the remaining spots at any moment", async () => {
    await reset();
    await q("select public.admin_set_early_bird($1, 10, true, 'test', null)", [ADMIN]);
    const buyers = await users(30);
    const [orders] = await Promise.all([
      Promise.all(buyers.map(earlyOrder)),
      q("select public.admin_set_early_bird($1, 0, true, 'race', null)", [ADMIN]),
    ]);
    const ok = orders.filter((r) => r.status === "ok").length;
    expect(ok).toBeLessThanOrEqual(10);
    // after the edit nothing new can be reserved
    expect((await earlyOrder((await users(1))[0])).code).toBe("early_sold_out");
  });

  it("paying all open reservations plus duplicate callbacks at once counts each sale exactly once", async () => {
    await reset();
    await q("select public.admin_set_early_bird($1, 8, true, 'test', null)", [ADMIN]);
    const orders = (await Promise.all((await users(8)).map(earlyOrder))).filter((r) => r.status === "ok");
    expect(orders).toHaveLength(8);
    for (const o of orders) await q("update public.checkout_orders set provider_ref = $2, asset = 'bnbbsc', status = 'pending' where id = $1", [o.order_id, `np_${o.order_id}`]);
    const deliveries = orders.flatMap((o) => [0, 1, 2].map((k) => {
      const effect = JSON.stringify({ kind: "payment", provider_payment_id: `np_${o.order_id}`, order_id: o.order_id, status: "succeeded", fulfill: true, product: "PRO_LIFETIME_EARLY", amount_minor: 2999, currency: "USD", asset: "bnbbsc", provider_status: "finished" });
      return q("select public.billing_apply('nowpayments',$1,'t',now(),$2::jsonb) as r", [`evt_${o.order_id}_${k % 2}`, effect]);
    }));
    await Promise.all(deliveries);
    expect(await status()).toMatchObject({ sold: 8, remaining: 0 });
    expect(Number((await q("select count(*) from public.subscriptions where plan = 'PRO_LIFETIME'")).rows[0].count)).toBe(8);
  });

  it("concurrent gift grants for one user create exactly one running gift", async () => {
    const [u] = await users(1);
    const res = await Promise.all(Array.from({ length: 10 }, () => q("select public.admin_grant_gift($1, $2, '30d', null) as r", [ADMIN, u]).then((r) => (r.rows[0].r as { status: string }).status)));
    expect(res.filter((s) => s === "granted")).toHaveLength(1);
    expect(res.filter((s) => s === "active_gift_exists")).toHaveLength(9);
  });
});
