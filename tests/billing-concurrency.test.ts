import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findPostgresBin, startRealPg, type RealPg } from "./helpers/realpg";

/**
 * TRUE concurrency: many simultaneous database connections against a real
 * PostgreSQL server (the in-process engine used elsewhere is single-connection).
 * Skipped automatically if no PostgreSQL server binaries are installed.
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
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
const q = (text: string, values: unknown[] = []) => pg.pool.query(text, values);
const scalar = async (text: string, values: unknown[] = []) => Object.values((await q(text, values)).rows[0])[0] as number;

async function users(count: number) {
  const ids = Array.from({ length: count }, uuid);
  await q("insert into auth.users (id, email) select x, x || '@c.com' from unnest($1::uuid[]) x", [ids]);
  return ids;
}
const earlyOrder = async (user: string, provider = "paddle", ref?: string) => {
  const r = (await q("select public.create_checkout_order($1,$2,'PRO_LIFETIME_EARLY','PRO_LIFETIME',99,'USD',$3,null,1800) as r", [user, provider, provider === "nowpayments" ? "usdttrc20" : null])).rows[0].r as { status: string; order_id?: string; code?: string };
  if (r.status === "ok") await q("select public.attach_order_ref($1,$2,null)", [r.order_id, ref ?? `ref_${r.order_id}`]);
  return r;
};
const pay = (orderId: string, ref: string, provider: "paddle" | "nowpayments", eventId: string) => {
  const effect =
    provider === "paddle"
      ? { kind: "payment", provider_payment_id: ref, order_id: orderId, status: "succeeded", fulfill: true, product: "PRO_LIFETIME_EARLY", price_product: "PRO_LIFETIME_EARLY", amount_minor: 99, currency: "USD", provider_status: "completed" }
      : { kind: "payment", provider_payment_id: ref, order_id: orderId, status: "succeeded", fulfill: true, product: "PRO_LIFETIME_EARLY", amount_minor: 99, currency: "USD", asset: "usdttrc20", asset_expected: "0.99", asset_received: "0.99", provider_status: "finished" };
  return q("select public.billing_apply($1,$2,'t',now(),$3::jsonb) as r", [provider, eventId, JSON.stringify(effect)]).then((r) => (r.rows[0].r as { result: string }).result);
};
const reset = () => q("truncate public.early_adopter_slots, public.webhook_events, public.payments, public.subscriptions, public.checkout_orders cascade");

describe.skipIf(!available)("billing under real concurrency (PostgreSQL)", () => {
  it("150 simultaneous early-adopter checkouts reserve exactly 100, across both providers", async () => {
    await reset();
    const ids = await users(150);
    const results = await Promise.all(ids.map((u, i) => earlyOrder(u, i % 2 ? "nowpayments" : "paddle")));
    expect(results.filter((r) => r.status === "ok")).toHaveLength(100);
    expect(results.filter((r) => r.code === "early_unavailable")).toHaveLength(50);
    expect(await scalar("select count(*)::int from public.checkout_orders where status = 'pending'")).toBe(100);
  }, 60_000);

  it("100 payments + 100 duplicate deliveries, all at once, produce exactly 100 slots and 100 lifetime grants", async () => {
    await reset();
    const ids = await users(100);
    const orders = (await Promise.all(ids.map((u, i) => earlyOrder(u, i % 2 ? "nowpayments" : "paddle", `r_${i}`)))).map((r, i) => ({ id: r.order_id!, ref: `r_${i}`, provider: (i % 2 ? "nowpayments" : "paddle") as "paddle" | "nowpayments" }));
    expect(orders).toHaveLength(100);
    const calls = orders.flatMap((o, i) => [pay(o.id, o.ref, o.provider, `evt_a_${i}`), pay(o.id, o.ref, o.provider, `evt_a_${i}`), pay(o.id, o.ref, o.provider, `evt_b_${i}`)]);
    const results = await Promise.all(calls);
    expect(results.filter((r) => r === "applied")).toHaveLength(100);
    expect(await scalar("select count(*)::int from public.early_adopter_slots")).toBe(100);
    expect(await scalar("select count(*)::int from public.subscriptions where plan = 'PRO_LIFETIME' and status = 'active'")).toBe(100);
    expect(await scalar("select count(*)::int from public.payments where status = 'succeeded'")).toBe(100);
    expect(await scalar("select count(distinct slot)::int from public.early_adopter_slots")).toBe(100);
    expect(await scalar("select count(*)::int from public.checkout_orders where status = 'fulfilled'")).toBe(100);
  }, 120_000);

  it("5 late payments racing for 1 remaining slot: exactly 1 is granted, 4 are flagged for refund, never 101", async () => {
    await reset();
    const ids = await users(5);
    const orders = [];
    for (const [i, u] of ids.entries()) orders.push({ ...(await earlyOrder(u, "paddle", `late_${i}`)), ref: `late_${i}` });
    // all reservations lapse (customers were slow), and 99 slots were sold meanwhile
    await q("update public.checkout_orders set reservation_expires_at = now() - interval '1 hour'");
    const filler = await users(99);
    for (const [i, u] of filler.entries()) {
      const pid = (await q("insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status) values ($1,'paddle',$2,'PRO_LIFETIME_EARLY',99,'USD','succeeded') returning id", [u, `f_${i}`])).rows[0].id;
      await q("select public.claim_early_adopter_slot($1)", [pid]);
    }
    const results = await Promise.all(orders.map((o, i) => pay(o.order_id!, o.ref, "paddle", `late_evt_${i}`)));
    expect(results.filter((r) => r === "applied")).toHaveLength(1);
    expect(results.filter((r) => r === "refund_required:early_adopter_unavailable")).toHaveLength(4);
    expect(await scalar("select count(*)::int from public.early_adopter_slots")).toBe(100);
    expect(await scalar("select count(*)::int from public.checkout_orders where status = 'refund_required'")).toBe(4);
    expect(await scalar("select count(*)::int from public.subscriptions where plan = 'PRO_LIFETIME'")).toBe(1);
    expect((await q("select public.early_adopter_state() as s")).rows[0].s).toBe("sold_out");
  }, 60_000);

  it("20 simultaneous deliveries of one webhook event apply exactly once", async () => {
    await reset();
    const [u] = await users(1);
    const o = await earlyOrder(u, "paddle", "dup_1");
    const results = await Promise.all(Array.from({ length: 20 }, () => pay(o.order_id!, "dup_1", "paddle", "evt_same")));
    expect(results.filter((r) => r === "applied")).toHaveLength(1);
    expect(results.filter((r) => r === "duplicate")).toHaveLength(19);
    expect(await scalar("select count(*)::int from public.subscriptions")).toBe(1);
    expect(await scalar("select count(*)::int from public.webhook_events where event_id = 'evt_same'")).toBe(1);
  }, 60_000);

  it("crypto: 10 concurrent 'finished' notifications with different ids extend the period once", async () => {
    await reset();
    const [u] = await users(1);
    const r = (await q("select public.create_checkout_order($1,'nowpayments','PRO_MONTHLY','PRO_MONTHLY',199,'USD','usdttrc20',30,1800) as r", [u])).rows[0].r as { order_id: string };
    await q("select public.attach_order_ref($1,'np_conc',null)", [r.order_id]);
    const effect = { kind: "payment", provider_payment_id: "np_conc", order_id: r.order_id, status: "succeeded", fulfill: true, product: "PRO_MONTHLY", amount_minor: 199, currency: "USD", asset: "usdttrc20", provider_status: "finished" };
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => q("select public.billing_apply('nowpayments',$1,'t',now(),$2::jsonb) as r", [`np_evt_${i}`, JSON.stringify(effect)]).then((x) => (x.rows[0].r as { result: string }).result)));
    expect(results.filter((x) => x === "applied")).toHaveLength(1);
    expect(results.filter((x) => x === "duplicate_fulfillment")).toHaveLength(9);
    const days = await scalar("select round(extract(epoch from (current_period_end - now())) / 86400)::int from public.subscriptions");
    expect(days).toBe(30);
  }, 60_000);
});
