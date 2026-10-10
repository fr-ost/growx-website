import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolveEntitlement } from "@/lib/entitlement/resolve";
import type { SubscriptionRecord } from "@/lib/entitlement/types";
import { addUser, asRole, freshDb, uid } from "./helpers/pg";

/**
 * Runs the real billing SQL (billing_apply & friends) on Postgres.
 * Covers: association/validation, idempotency, out-of-order events, refunds,
 * chargebacks, crypto prepaid periods and the early-adopter inventory.
 */
let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
});
afterAll(async () => db.close());

const DAY = 86_400_000;
const j = (o: unknown) => JSON.stringify(o);
let evt = 0;
const eid = () => `evt_${++evt}`;
const iso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();

async function apply(provider: "paddle" | "nowpayments", effect: Record<string, unknown>, opts: { id?: string; type?: string; at?: string } = {}) {
  const r = await db.query<{ r: { result: string } }>("select public.billing_apply($1,$2,$3,$4::timestamptz,$5::jsonb) as r", [
    provider, opts.id ?? eid(), opts.type ?? "test.event", opts.at ?? iso(), j(effect),
  ]);
  return r.rows[0].r.result;
}

async function order(
  user: string, provider: "paddle" | "nowpayments", product: string,
  o: { amount?: number; asset?: string | null; days?: number | null; ref?: string | null; ttl?: number } = {},
) {
  const plan = product === "PRO_MONTHLY" ? "PRO_MONTHLY" : product === "PRO_YEARLY" ? "PRO_YEARLY" : "PRO_LIFETIME";
  const amount = o.amount ?? ({ PRO_MONTHLY: 199, PRO_YEARLY: 1499, PRO_LIFETIME: 2999, PRO_LIFETIME_EARLY: 99 } as Record<string, number>)[product];
  const r = await db.query<{ r: { status: string; order_id?: string; code?: string } }>(
    "select public.create_checkout_order($1,$2,$3,$4,$5,'USD',$6,$7,$8) as r",
    [user, provider, product, plan, amount, o.asset ?? null, o.days ?? null, o.ttl ?? 1800],
  );
  const res = r.rows[0].r;
  if (res.status === "ok" && o.ref !== null) {
    await db.query("select public.attach_order_ref($1, $2, null)", [res.order_id, o.ref ?? `ref_${res.order_id}`]);
  }
  return res;
}

const row = async <T = Record<string, unknown>>(sql: string, p: unknown[] = []) => (await db.query<T>(sql, p)).rows;
const subsOf = (u: string) => row<SubscriptionRecord & { id: string }>("select * from public.subscriptions where user_id = $1 order by created_at", [u]);
const planAt = async (u: string, at = new Date()) => resolveEntitlement({ trials: [], subscriptions: await subsOf(u) }, at).plan;
const count = async (sql: string, p: unknown[] = []) => Number((await row<{ n: string }>(`select count(*)::int as n from (${sql}) t`, p))[0].n);

// --- effect builders -------------------------------------------------------
const paddlePay = (orderId: string, txn: string, product: string, status: string, fulfill: boolean, extra: Record<string, unknown> = {}) => ({
  kind: "payment", provider_payment_id: txn, order_id: orderId, status, fulfill, product, price_product: product,
  amount_minor: 2999, currency: "USD", provider_status: status, ...extra,
});
const cryptoPay = (orderId: string, id: string, product: string, status: string, fulfill: boolean, extra: Record<string, unknown> = {}) => ({
  kind: "payment", provider_payment_id: id, order_id: orderId, status, fulfill, product, amount_minor: 199, currency: "USD",
  asset: "usdttrc20", asset_expected: "2.00", asset_received: "2.00", provider_status: status, ...extra,
});
const subSync = (orderId: string | undefined, subId: string, status: string, periodEnd: string | undefined, extra: Record<string, unknown> = {}) => ({
  kind: "subscription_sync", provider_subscription_id: subId, order_id: orderId, plan: "PRO_MONTHLY", status, period_end: periodEnd, cancel_at_period_end: false, ...extra,
});
const adjust = (txn: string, action: string, type: string, status: string, amount: number, extra: Record<string, unknown> = {}) => ({
  kind: "adjustment", provider_payment_id: txn, action, adj_type: type, status, amount_minor: amount, ...extra,
});

describe("Paddle one-time lifetime purchase", () => {
  it("records capture on paid, grants ONLY on completed, and is idempotent", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: "txn_L1" });
    expect(o.status).toBe("ok");

    expect(await apply("paddle", paddlePay(o.order_id!, "txn_L1", "PRO_LIFETIME", "succeeded", false))).toBe("applied");
    expect(await subsOf(u)).toHaveLength(0); // captured but not yet fulfilled
    expect(await planAt(u)).toBe("FREE");

    const completed = eid();
    expect(await apply("paddle", paddlePay(o.order_id!, "txn_L1", "PRO_LIFETIME", "succeeded", true), { id: completed })).toBe("applied");
    expect(await planAt(u)).toBe("PRO_LIFETIME");
    expect(await planAt(u, new Date("2099-01-01"))).toBe("PRO_LIFETIME"); // never expires

    // exact same event delivered again, and a replay under a different event id
    expect(await apply("paddle", paddlePay(o.order_id!, "txn_L1", "PRO_LIFETIME", "succeeded", true), { id: completed })).toBe("duplicate");
    expect(await apply("paddle", paddlePay(o.order_id!, "txn_L1", "PRO_LIFETIME", "succeeded", true))).toBe("duplicate_fulfillment");
    expect(await subsOf(u)).toHaveLength(1);
    expect(await count("select 1 from public.payments where user_id = $1", [u])).toBe(1);
    expect((await row<{ status: string; amount_minor: number }>("select status, amount_minor from public.payments where user_id = $1", [u]))[0]).toMatchObject({ status: "succeeded", amount_minor: 2999 });
  });

  it("concurrent identical deliveries grant once", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: "txn_L2" });
    const id = eid();
    const results = await Promise.all([1, 2, 3].map(() => apply("paddle", paddlePay(o.order_id!, "txn_L2", "PRO_LIFETIME", "succeeded", true), { id })));
    expect(results.filter((r) => r === "applied")).toHaveLength(1);
    expect(await subsOf(u)).toHaveLength(1);
  });

  it("rejects a transaction whose price maps to a different product (price tampering) and flags refund review", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: "txn_L3" });
    const r = await apply("paddle", paddlePay(o.order_id!, "txn_L3", "PRO_LIFETIME", "succeeded", true, { price_product: "PRO_MONTHLY" }));
    expect(r).toBe("rejected:order_validation_failed");
    expect(await planAt(u)).toBe("FREE");
    expect(await count("select 1 from public.payments where user_id = $1", [u])).toBe(0);
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("refund_required");
  });

  it("rejects wrong currency, wrong provider and wrong transaction reference; unknown orders are 'unlinked'", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: "txn_L4" });
    expect(await apply("paddle", paddlePay(o.order_id!, "txn_L4", "PRO_LIFETIME", "succeeded", true, { currency: "EUR" }))).toBe("rejected:order_validation_failed");
    const o2 = await order(await addUser(db), "paddle", "PRO_LIFETIME", { ref: "txn_L5" });
    expect(await apply("nowpayments", cryptoPay(o2.order_id!, "x", "PRO_LIFETIME", "succeeded", true))).toBe("rejected:order_provider_mismatch");
    expect(await apply("paddle", paddlePay(o2.order_id!, "txn_OTHER", "PRO_LIFETIME", "succeeded", true))).toBe("rejected:order_reference_mismatch");
    expect(await apply("paddle", paddlePay(uid(), "txn_Z", "PRO_LIFETIME", "succeeded", true))).toBe("unlinked");
    expect(await planAt(u)).toBe("FREE");
  });

  it("a payment is never reassigned to another user", async () => {
    const a = await addUser(db), b = await addUser(db);
    const oa = await order(a, "paddle", "PRO_LIFETIME", { ref: "txn_SHARED" });
    await apply("paddle", paddlePay(oa.order_id!, "txn_SHARED", "PRO_LIFETIME", "succeeded", false));
    // Same provider payment id arriving for user B's order must fail (reference mismatch first, DB constraint second).
    const ob = await order(b, "paddle", "PRO_LIFETIME", { ref: "txn_B" });
    expect(await apply("paddle", paddlePay(ob.order_id!, "txn_SHARED", "PRO_LIFETIME", "succeeded", true))).toMatch(/^rejected/);
    expect(await planAt(b)).toBe("FREE");
  });

  it("failed attempts are recorded without granting; a later capture on the same transaction still works; a late failure never downgrades", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: "txn_F1" });
    await apply("paddle", paddlePay(o.order_id!, "txn_F1", "PRO_LIFETIME", "failed", false, { provider_status: "payment_failed" }));
    expect(await planAt(u)).toBe("FREE");
    expect((await row<{ status: string }>("select status from public.payments where provider_payment_id = 'txn_F1'"))[0].status).toBe("failed");
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("pending"); // retry still possible
    await apply("paddle", paddlePay(o.order_id!, "txn_F1", "PRO_LIFETIME", "succeeded", true));
    expect(await planAt(u)).toBe("PRO_LIFETIME");
    await apply("paddle", paddlePay(o.order_id!, "txn_F1", "PRO_LIFETIME", "failed", false)); // out-of-order failure
    expect((await row<{ status: string }>("select status from public.payments where provider_payment_id = 'txn_F1'"))[0].status).toBe("succeeded");
    expect(await planAt(u)).toBe("PRO_LIFETIME");
  });

  it("a canceled transaction closes the order (releasing any reservation)", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: "txn_C1" });
    await apply("paddle", paddlePay(o.order_id!, "txn_C1", "PRO_LIFETIME", "failed", false, { order_status: "canceled" }));
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("canceled");
  });
});

describe("Paddle subscriptions (monthly)", () => {
  it("creation, renewal, scheduled cancellation, past-due grace, expiry and out-of-order protection", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_M1" });
    const t0 = Date.now();
    const end1 = iso(30 * DAY);

    // payment capture alone does not create access for recurring plans
    await apply("paddle", paddlePay(o.order_id!, "txn_M1", "PRO_MONTHLY", "succeeded", true, { amount_minor: 199, subscription_ref: "sub_1" }), { at: iso(-5000) });
    expect(await planAt(u)).toBe("FREE");

    expect(await apply("paddle", subSync(o.order_id, "sub_1", "active", end1), { at: iso(-4000) })).toBe("applied");
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("fulfilled");

    // renewal: new period, later event
    const end2 = iso(60 * DAY);
    await apply("paddle", subSync(undefined, "sub_1", "active", end2), { at: iso(-3000) });
    expect((await subsOf(u))[0].current_period_end).toBeTruthy();
    expect(new Date((await subsOf(u))[0].current_period_end!).getTime()).toBeGreaterThan(t0 + 59 * DAY);

    // stale (older) event must not roll the period back
    expect(await apply("paddle", subSync(undefined, "sub_1", "active", end1), { at: iso(-9000) })).toBe("stale");
    expect(new Date((await subsOf(u))[0].current_period_end!).getTime()).toBeGreaterThan(t0 + 59 * DAY);

    // scheduled cancellation: still Premium until the paid period ends
    await apply("paddle", subSync(undefined, "sub_1", "active", end2, { cancel_at_period_end: true }), { at: iso(-2000) });
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    expect((await row<{ cancel_at_period_end: boolean }>("select cancel_at_period_end from public.subscriptions where user_id = $1", [u]))[0].cancel_at_period_end).toBe(true);
    expect(await planAt(u, new Date(t0 + 61 * DAY))).toBe("FREE"); // paid-through date passed

    // failed renewal: past_due keeps access for the 3-day grace only
    await apply("paddle", subSync(undefined, "sub_1", "past_due", end2), { at: iso(-1000) });
    const row1 = (await subsOf(u))[0];
    expect(row1.status).toBe("past_due");
    expect(row1.past_due_since).toBeTruthy();
    expect(await planAt(u, new Date(t0 + 1 * DAY))).toBe("PRO_MONTHLY");
    expect(await planAt(u, new Date(t0 + 4 * DAY))).toBe("FREE");

    // recovery clears past-due; final cancellation ends access immediately
    await apply("paddle", subSync(undefined, "sub_1", "active", end2), { at: iso(-500) });
    expect((await subsOf(u))[0].past_due_since).toBeNull();
    await apply("paddle", subSync(undefined, "sub_1", "canceled", end2), { at: iso(-100), type: "subscription.canceled" });
    expect(await planAt(u)).toBe("FREE");
  });

  it("never creates access from a non-active first event, a missing period end, a wrong plan or an unknown order", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_M2" });
    expect(await apply("paddle", subSync(o.order_id, "sub_t", "trialing", iso(DAY)))).toBe("ignored");
    expect(await apply("paddle", subSync(o.order_id, "sub_t", "past_due", iso(DAY)))).toBe("ignored");
    expect(await apply("paddle", subSync(o.order_id, "sub_t", "active", undefined))).toBe("rejected:missing_period_end");
    expect(await apply("paddle", subSync(o.order_id, "sub_t", "active", iso(DAY), { plan: "PRO_YEARLY" }))).toBe("rejected:order_validation_failed");
    expect(await apply("paddle", subSync(uid(), "sub_t", "active", iso(DAY)))).toBe("unlinked");
    expect(await apply("paddle", subSync(undefined, "sub_unknown", "active", iso(DAY)))).toBe("unlinked");
    expect(await subsOf(u)).toHaveLength(0);
  });

  it("a duplicate subscription.created does not duplicate the subscription", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_M3" });
    const id = eid();
    await apply("paddle", subSync(o.order_id, "sub_d", "active", iso(30 * DAY)), { id });
    expect(await apply("paddle", subSync(o.order_id, "sub_d", "active", iso(30 * DAY)), { id })).toBe("duplicate");
    expect(await apply("paddle", subSync(o.order_id, "sub_d", "active", iso(30 * DAY)), { at: iso(-100000) })).toBe("stale");
    expect(await subsOf(u)).toHaveLength(1);
  });

  it("renewal payments resolve their user from the subscription (no order needed)", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_M4" });
    await apply("paddle", subSync(o.order_id, "sub_r", "active", iso(30 * DAY)), { at: iso(-2000) });
    expect(await apply("paddle", { kind: "payment", provider_payment_id: "txn_renew1", subscription_ref: "sub_r", status: "succeeded", fulfill: true, product: "PRO_MONTHLY", price_product: "PRO_MONTHLY", amount_minor: 199, currency: "USD", provider_status: "completed" })).toBe("applied");
    expect(await count("select 1 from public.payments where user_id = $1 and provider_payment_id = 'txn_renew1'", [u])).toBe(1);
  });
});

describe("refunds and chargebacks", () => {
  async function paidLifetime() {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_LIFETIME", { ref: `txn_R_${u}` });
    await apply("paddle", paddlePay(o.order_id!, `txn_R_${u}`, "PRO_LIFETIME", "succeeded", true));
    expect(await planAt(u)).toBe("PRO_LIFETIME");
    return { u, txn: `txn_R_${u}` };
  }

  it("a full approved refund revokes Premium; duplicates and non-approved adjustments change nothing", async () => {
    const { u, txn } = await paidLifetime();
    expect(await apply("paddle", adjust(txn, "refund", "full", "pending_approval", 2999))).toBe("ignored");
    expect(await apply("paddle", adjust(txn, "refund", "full", "rejected", 2999))).toBe("ignored");
    expect(await apply("paddle", adjust(txn, "credit", "full", "approved", 2999))).toBe("ignored");
    expect(await planAt(u)).toBe("PRO_LIFETIME");
    const id = eid();
    expect(await apply("paddle", adjust(txn, "refund", "full", "approved", 2999), { id })).toBe("applied");
    expect(await planAt(u)).toBe("FREE");
    expect(await apply("paddle", adjust(txn, "refund", "full", "approved", 2999), { id })).toBe("duplicate");
    const p = (await row<{ status: string; refunded_minor: number }>("select status, refunded_minor from public.payments where provider_payment_id = $1", [txn]))[0];
    expect(p).toMatchObject({ status: "refunded", refunded_minor: 2999 });
    expect((await subsOf(u))[0]).toMatchObject({ status: "refunded" });
  });

  it("a partial refund is recorded but keeps access; refunds adding up to the total revoke", async () => {
    const { u, txn } = await paidLifetime();
    await apply("paddle", adjust(txn, "refund", "partial", "approved", 1000));
    expect(await planAt(u)).toBe("PRO_LIFETIME");
    await apply("paddle", adjust(txn, "refund", "partial", "approved", 1999));
    expect(await planAt(u)).toBe("FREE");
  });

  it("a chargeback revokes access and later subscription syncs cannot restore it", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_CB" });
    await apply("paddle", subSync(o.order_id, "sub_cb", "active", iso(30 * DAY)), { at: iso(-3000) });
    await apply("paddle", paddlePay(o.order_id!, "txn_CB", "PRO_MONTHLY", "succeeded", true, { subscription_ref: "sub_cb", amount_minor: 199 }), { at: iso(-2500) });
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    expect(await apply("paddle", adjust("txn_CB", "chargeback_warning", "full", "approved", 199))).toBe("ignored");
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    expect(await apply("paddle", adjust("txn_CB", "chargeback", "full", "approved", 199, { subscription_ref: "sub_cb" }))).toBe("applied");
    expect(await planAt(u)).toBe("FREE");
    expect(await apply("paddle", subSync(undefined, "sub_cb", "active", iso(60 * DAY)), { at: iso(1000) })).toBe("revoked_unchanged");
    expect(await planAt(u)).toBe("FREE");
    expect((await row<{ status: string }>("select status from public.payments where provider_payment_id = 'txn_CB'"))[0].status).toBe("disputed");
  });

  it("the same provider adjustment announced by several events is applied once (no double-counted partial refunds)", async () => {
    const { u, txn } = await paidLifetime();
    expect(await apply("paddle", adjust(txn, "refund", "partial", "approved", 1000, { adjustment_id: "adj_same" }))).toBe("applied"); // adjustment.created
    expect(await apply("paddle", adjust(txn, "refund", "partial", "approved", 1000, { adjustment_id: "adj_same" }))).toBe("duplicate_adjustment"); // adjustment.updated
    expect((await row<{ refunded_minor: number }>("select refunded_minor from public.payments where provider_payment_id = $1", [txn]))[0].refunded_minor).toBe(1000);
    expect(await planAt(u)).toBe("PRO_LIFETIME");
    expect(await apply("paddle", adjust(txn, "refund", "partial", "approved", 1999, { adjustment_id: "adj_other" }))).toBe("applied");
    expect(await planAt(u)).toBe("FREE");
  });

  it("adjustments for unknown payments are 'unlinked'", async () => {
    expect(await apply("paddle", adjust("txn_nope", "refund", "full", "approved", 100))).toBe("unlinked");
  });
});

describe("NOWPayments (prepaid crypto periods)", () => {
  const monthly = (u: string, ref?: string) => order(u, "nowpayments", "PRO_MONTHLY", { asset: "usdttrc20", days: 30, ref });

  it("pending/confirming/partial/failed never grant; only a matching 'finished' does, once", async () => {
    const u = await addUser(db);
    const o = await monthly(u, "np_1");
    const oid = o.order_id!;
    for (const [status, ps] of [["pending", "waiting"], ["confirming", "confirming"], ["confirming", "confirmed"], ["confirming", "sending"], ["partially_paid", "partially_paid"]] as const) {
      await apply("nowpayments", cryptoPay(oid, "np_1", "PRO_MONTHLY", status, false, { provider_status: ps }));
      expect(await planAt(u)).toBe("FREE");
    }
    expect((await row<{ status: string }>("select status from public.payments where provider_payment_id = 'np_1'"))[0].status).toBe("partially_paid");

    const fin = eid();
    expect(await apply("nowpayments", cryptoPay(oid, "np_1", "PRO_MONTHLY", "succeeded", true, { provider_status: "finished" }), { id: fin })).toBe("applied");
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    const end = new Date((await subsOf(u))[0].current_period_end!).getTime();
    expect(end).toBeGreaterThan(Date.now() + 29 * DAY);
    expect(end).toBeLessThan(Date.now() + 31 * DAY);

    // replay + out-of-order lower status
    expect(await apply("nowpayments", cryptoPay(oid, "np_1", "PRO_MONTHLY", "succeeded", true), { id: fin })).toBe("duplicate");
    expect(await apply("nowpayments", cryptoPay(oid, "np_1", "PRO_MONTHLY", "succeeded", true))).toBe("duplicate_fulfillment");
    await apply("nowpayments", cryptoPay(oid, "np_1", "PRO_MONTHLY", "pending", false, { provider_status: "waiting" }));
    expect((await row<{ status: string }>("select status from public.payments where provider_payment_id = 'np_1'"))[0].status).toBe("succeeded");
    expect(new Date((await subsOf(u))[0].current_period_end!).getTime()).toBe(end); // not extended twice
    expect(await planAt(u, new Date(Date.now() + 32 * DAY))).toBe("FREE"); // expires: prepaid, no auto-renewal
  });

  it("hosted invoice: no coin preselected; the first verified payment binds payment id + coin, then strict checks apply", async () => {
    const u = await addUser(db);
    const o = await order(u, "nowpayments", "PRO_MONTHLY", { asset: null, days: 30, ref: null });
    const oid = o.order_id!;
    await db.query("select public.attach_order_ref($1, null, null)", [oid]); // what the checkout route does
    expect((await row<{ status: string; provider_ref: string | null }>("select status, provider_ref from public.checkout_orders where id = $1", [oid]))[0]).toEqual({ status: "pending", provider_ref: null });

    // Without the bind, a payment in any coin would not match the order (asset null) and is never granted.
    const u2 = await addUser(db);
    const o2 = (await order(u2, "nowpayments", "PRO_MONTHLY", { asset: null, days: 30, ref: null })).order_id!;
    expect(await apply("nowpayments", cryptoPay(o2, "np_unbound", "PRO_MONTHLY", "succeeded", true, { asset: "eth" }))).toBe("rejected:order_validation_failed");
    expect(await planAt(u2)).toBe("FREE");

    // The IPN handler's bind, executed with the service role's privileges only.
    const bind = (id: string, ref: string, coin: string) =>
      asRole(db, "service_role", null, () => db.query("update public.checkout_orders set provider_ref = $2, asset = $3 where id = $1 and provider = 'nowpayments' and provider_ref is null and status in ('created','pending')", [id, ref, coin]));
    await bind(oid, "np_inv_1", "eth");
    await bind(oid, "np_inv_2", "bnbbsc"); // a second payment on the same invoice cannot re-bind
    expect((await row<{ provider_ref: string; asset: string }>("select provider_ref, asset from public.checkout_orders where id = $1", [oid]))[0]).toEqual({ provider_ref: "np_inv_1", asset: "eth" });

    await apply("nowpayments", cryptoPay(oid, "np_inv_1", "PRO_MONTHLY", "confirming", false, { asset: "eth" }));
    expect(await planAt(u)).toBe("FREE");
    expect(await apply("nowpayments", cryptoPay(oid, "np_inv_1", "PRO_MONTHLY", "succeeded", true, { asset: "eth" }))).toBe("applied");
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    expect((await row<{ asset: string }>("select asset from public.payments where provider_payment_id = 'np_inv_1'"))[0].asset).toBe("eth");

    // A different payment (or coin) on the same order never grants again.
    expect(await apply("nowpayments", cryptoPay(oid, "np_inv_2", "PRO_MONTHLY", "succeeded", true, { asset: "bnbbsc" }))).toBe("rejected:order_reference_mismatch");
    expect(await apply("nowpayments", cryptoPay(oid, "np_inv_1", "PRO_MONTHLY", "succeeded", true, { asset: "bnbbsc" }))).toMatch(/^(rejected:order_validation_failed|duplicate_fulfillment)$/);
    expect(await subsOf(u)).toHaveLength(1);
  });

  it("a renewal is a NEW verified payment and stacks on the remaining time", async () => {
    const u = await addUser(db);
    const o1 = await monthly(u, "np_r1");
    await apply("nowpayments", cryptoPay(o1.order_id!, "np_r1", "PRO_MONTHLY", "succeeded", true));
    const end1 = new Date((await subsOf(u))[0].current_period_end!).getTime();
    const o2 = await monthly(u, "np_r2");
    await apply("nowpayments", cryptoPay(o2.order_id!, "np_r2", "PRO_MONTHLY", "succeeded", true));
    const subs = await subsOf(u);
    expect(subs).toHaveLength(1); // one row per (user, plan)
    expect(new Date(subs[0].current_period_end!).getTime() - end1).toBe(30 * DAY);
  });

  it("rejects amount, asset and product mismatches, flags them for refund review, and grants nothing", async () => {
    const u = await addUser(db);
    for (const [ref, extra] of [["np_m1", { amount_minor: 99 }], ["np_m2", { asset: "usdterc20" }], ["np_m3", { currency: "EUR" }], ["np_m4", { product: "PRO_YEARLY" }]] as const) {
      const o = await monthly(u, ref);
      expect(await apply("nowpayments", cryptoPay(o.order_id!, ref, "PRO_MONTHLY", "succeeded", true, extra))).toBe("rejected:order_validation_failed");
      expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("refund_required");
      await db.query("update public.checkout_orders set status = 'canceled' where id = $1", [o.order_id]); // free the user for the next case
    }
    expect(await planAt(u)).toBe("FREE");
    expect(await count("select 1 from public.payments where user_id = $1", [u])).toBe(0);
  });

  it("expired payments close the order; a late 'finished' is still honoured (money was received), exactly once", async () => {
    const u = await addUser(db);
    const o = await monthly(u, "np_e1");
    await apply("nowpayments", cryptoPay(o.order_id!, "np_e1", "PRO_MONTHLY", "expired", false, { provider_status: "expired", order_status: "expired" }));
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("expired");
    expect(await planAt(u)).toBe("FREE");
    await apply("nowpayments", cryptoPay(o.order_id!, "np_e1", "PRO_MONTHLY", "succeeded", true));
    expect(await planAt(u)).toBe("PRO_MONTHLY");
  });

  it("failed payments close the order and grant nothing", async () => {
    const u = await addUser(db);
    const o = await monthly(u, "np_f1");
    await apply("nowpayments", cryptoPay(o.order_id!, "np_f1", "PRO_MONTHLY", "failed", false, { order_status: "failed" }));
    expect(await planAt(u)).toBe("FREE");
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [o.order_id]))[0].status).toBe("failed");
  });

  it("crypto yearly and lifetime", async () => {
    const u = await addUser(db);
    const y = await order(u, "nowpayments", "PRO_YEARLY", { asset: "usdttrc20", days: 365, ref: "np_y1" });
    await apply("nowpayments", cryptoPay(y.order_id!, "np_y1", "PRO_YEARLY", "succeeded", true, { amount_minor: 1499 }));
    expect(await planAt(u)).toBe("PRO_YEARLY");
    const u2 = await addUser(db);
    const l = await order(u2, "nowpayments", "PRO_LIFETIME", { asset: "usdttrc20", ref: "np_l1" });
    await apply("nowpayments", cryptoPay(l.order_id!, "np_l1", "PRO_LIFETIME", "succeeded", true, { amount_minor: 2999 }));
    expect(await planAt(u2, new Date("2099-01-01"))).toBe("PRO_LIFETIME");
    // already owning lifetime blocks further purchases
    expect((await order(u2, "paddle", "PRO_YEARLY")).code).toBe("already_owned");
  });

  it("refund revokes; a legitimate repurchase after a refund restarts access; a chargeback blocks crypto access", async () => {
    const u = await addUser(db);
    const o1 = await monthly(u, "np_x1");
    await apply("nowpayments", cryptoPay(o1.order_id!, "np_x1", "PRO_MONTHLY", "succeeded", true));
    await apply("nowpayments", { kind: "adjustment", provider_payment_id: "np_x1", action: "refund", adj_type: "full", status: "approved", amount_minor: 199 });
    expect(await planAt(u)).toBe("FREE");
    const o2 = await monthly(u, "np_x2");
    await apply("nowpayments", cryptoPay(o2.order_id!, "np_x2", "PRO_MONTHLY", "succeeded", true));
    expect(await planAt(u)).toBe("PRO_MONTHLY");
    const end = new Date((await subsOf(u))[0].current_period_end!).getTime();
    expect(end).toBeLessThan(Date.now() + 31 * DAY); // restarted from now, not stacked on refunded time

    await apply("nowpayments", { kind: "adjustment", provider_payment_id: "np_x2", action: "chargeback", adj_type: "full", status: "approved", amount_minor: 199 });
    expect(await planAt(u)).toBe("FREE");
    const o3 = await monthly(u, "np_x3");
    expect(await apply("nowpayments", cryptoPay(o3.order_id!, "np_x3", "PRO_MONTHLY", "succeeded", true))).toBe("refund_required:chargeback_block");
    expect(await planAt(u)).toBe("FREE");
  });
});

describe("entitlement is consistent across providers", () => {
  it("uses the best valid plan when a user holds both a card subscription and crypto time", async () => {
    const u = await addUser(db);
    const oc = await order(u, "nowpayments", "PRO_YEARLY", { asset: "usdttrc20", days: 365, ref: "np_both" });
    await apply("nowpayments", cryptoPay(oc.order_id!, "np_both", "PRO_YEARLY", "succeeded", true, { amount_minor: 1499 }));
    const op = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_both" });
    await apply("paddle", subSync(op.order_id, "sub_both", "active", iso(30 * DAY)));
    expect(await planAt(u)).toBe("PRO_YEARLY");
    expect(await subsOf(u)).toHaveLength(2);
  });

  it("blocks a second card subscription while one is active", async () => {
    const u = await addUser(db);
    const o = await order(u, "paddle", "PRO_MONTHLY", { ref: "txn_s1" });
    await apply("paddle", subSync(o.order_id, "sub_s1", "active", iso(30 * DAY)));
    expect((await order(u, "paddle", "PRO_YEARLY")).code).toBe("already_subscribed");
  });
});

describe("early-adopter inventory (first 100, both providers)", () => {
  async function manyUsers(n: number) {
    const ids: string[] = [];
    for (let i = 0; i < n; i++) ids.push(uid());
    await db.query("insert into auth.users (id, email) select x, x || '@e.com' from unnest($1::uuid[]) x", [ids]);
    return ids;
  }
  const early = (u: string, provider: "paddle" | "nowpayments" = "paddle", ref?: string) =>
    order(u, provider, "PRO_LIFETIME_EARLY", { amount: 99, asset: provider === "nowpayments" ? "usdttrc20" : null, ref });
  const payEarly = (orderId: string, ref: string, provider: "paddle" | "nowpayments") =>
    provider === "paddle"
      ? apply("paddle", paddlePay(orderId, ref, "PRO_LIFETIME_EARLY", "succeeded", true, { amount_minor: 99 }))
      : apply("nowpayments", cryptoPay(orderId, ref, "PRO_LIFETIME_EARLY", "succeeded", true, { amount_minor: 99 }));
  const state = async () => (await row<{ s: string }>("select public.early_adopter_state() as s"))[0].s;

  it("reservations are capped at 100 across providers, one per user, and sell out permanently after 100 completed purchases", async () => {
    await db.exec("truncate public.early_adopter_slots, public.webhook_events, public.payments, public.subscriptions, public.checkout_orders cascade");
    expect(await state()).toBe("available");
    const users = await manyUsers(103);

    // 100 reservations (mixed providers) succeed; the 101st is refused while they are open
    const orders: { id: string; user: string; provider: "paddle" | "nowpayments"; ref: string }[] = [];
    for (let i = 0; i < 100; i++) {
      const provider = i % 2 ? "nowpayments" : "paddle";
      const ref = `early_${i}`;
      const r = await early(users[i], provider, ref);
      expect(r.status, `reservation ${i}`).toBe("ok");
      orders.push({ id: r.order_id!, user: users[i], provider, ref });
    }
    expect((await early(users[100])).code).toBe("early_unavailable");
    expect(await state()).toBe("unavailable");

    // a user cannot hold two
    expect((await early(users[0])).code).toBe("early_already_held");

    // abandonment releases exactly one slot
    await db.query("select public.close_checkout_order($1, 'canceled')", [orders[0].id]);
    expect(await state()).toBe("available");
    const again = await early(users[101], "paddle", "early_new");
    expect(again.status).toBe("ok");
    orders[0] = { id: again.order_id!, user: users[101], provider: "paddle", ref: "early_new" };
    expect((await early(users[102])).code).toBe("early_unavailable");

    // complete all 100 (duplicates delivered too): exactly 100 slots, no more
    for (const o of orders) {
      expect(await payEarly(o.id, o.ref, o.provider)).toBe("applied");
      await payEarly(o.id, o.ref, o.provider); // replay under a new event id
    }
    expect(await count("select 1 from public.early_adopter_slots")).toBe(100);
    expect(await count("select 1 from public.subscriptions where plan = 'PRO_LIFETIME'")).toBe(100);
    expect(await state()).toBe("sold_out");
    expect((await early(users[102])).code).toBe("early_sold_out");
    for (const o of orders.slice(0, 5)) expect(await planAt(o.user)).toBe("PRO_LIFETIME");
    expect(await planAt(users[102])).toBe("FREE");
  });

  it("a late payment after the reservation expired is honoured only if inventory remains; otherwise flagged for refund and never granted", async () => {
    await db.exec("truncate public.early_adopter_slots, public.webhook_events, public.payments, public.subscriptions, public.checkout_orders cascade");
    const users = await manyUsers(4);
    const late = await early(users[0], "nowpayments", "late_1");
    const lateB = await early(users[1], "nowpayments", "late_2");
    await db.query("update public.checkout_orders set reservation_expires_at = now() - interval '1 hour' where id = any($1::uuid[])", [[late.order_id, lateB.order_id]]);

    // plenty of inventory: the late but genuine payment is honoured
    expect(await payEarly(late.order_id!, "late_1", "nowpayments")).toBe("applied");
    expect(await planAt(users[0])).toBe("PRO_LIFETIME");

    // now fill 98 more slots + 1 active reservation of another customer -> full
    await db.exec("insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status) select (select id from public.profiles limit 1), 'paddle', 'fill_' || g, 'PRO_LIFETIME_EARLY', 99, 'USD', 'succeeded' from generate_series(1, 98) g");
    const fillPays = await row<{ id: string }>("select id from public.payments where provider_payment_id like 'fill_%'");
    for (const p of fillPays) await db.query("select public.claim_early_adopter_slot($1)", [p.id]);
    const holder = await early(users[2], "paddle", "holder"); // takes the last open reservation (99 slots + this = 100)
    expect(holder.status).toBe("ok");
    expect(await count("select 1 from public.early_adopter_slots")).toBe(99);

    // the expired order's customer pays late: honouring would eat the other customer's reservation -> refund path
    expect(await payEarly(lateB.order_id!, "late_2", "nowpayments")).toBe("refund_required:early_adopter_unavailable");
    expect(await planAt(users[1])).toBe("FREE");
    expect((await row<{ status: string }>("select status from public.checkout_orders where id = $1", [lateB.order_id]))[0].status).toBe("refund_required");
    expect((await row<{ status: string }>("select status from public.payments where provider_payment_id = 'late_2'"))[0].status).toBe("succeeded"); // money is recorded
    expect(await count("select 1 from public.early_adopter_slots")).toBe(99);

    // the holder still gets the last slot, and the cap is never exceeded
    expect(await payEarly(holder.order_id!, "holder", "paddle")).toBe("applied");
    expect(await count("select 1 from public.early_adopter_slots")).toBe(100);
    expect(await planAt(users[2])).toBe("PRO_LIFETIME");
  });
});

describe("RLS and privileges for billing data", () => {
  it("users read only their own orders and payments, cannot write them, and cannot call billing functions", async () => {
    const a = await addUser(db), b = await addUser(db);
    const oa = await order(a, "paddle", "PRO_LIFETIME", { ref: "txn_rls_a" });
    await apply("paddle", paddlePay(oa.order_id!, "txn_rls_a", "PRO_LIFETIME", "succeeded", true));
    await order(b, "paddle", "PRO_MONTHLY", { ref: "txn_rls_b" });

    await asRole(db, "authenticated", a, async () => {
      expect((await db.query("select user_id from public.checkout_orders")).rows.every((r) => (r as { user_id: string }).user_id === a)).toBe(true);
      expect((await db.query("select * from public.payments")).rows).toHaveLength(1);
      expect((await db.query("select * from public.subscriptions")).rows).toHaveLength(1);
      await expect(db.query("update public.checkout_orders set status = 'fulfilled'")).rejects.toThrow(/permission denied/);
      await expect(db.query("insert into public.checkout_orders (user_id, provider, product, plan, expected_amount_minor) values ($1,'paddle','PRO_LIFETIME','PRO_LIFETIME',1)", [a])).rejects.toThrow(/permission denied/);
      await expect(db.query("update public.payments set status = 'succeeded'")).rejects.toThrow(/permission denied/);
      await expect(db.query("update public.subscriptions set status = 'active'")).rejects.toThrow(/permission denied/);
      for (const fn of [
        "select public.billing_apply('paddle','x','t',now(),'{\"kind\":\"noop\"}')",
        `select public.create_checkout_order('${a}','paddle','PRO_MONTHLY','PRO_MONTHLY',199,'USD',null,null,60)`,
        "select public.early_adopter_state()",
        "select public.grant_crypto_period(gen_random_uuid(),'PRO_MONTHLY',30,gen_random_uuid())",
      ]) await expect(db.query(fn)).rejects.toThrow(/permission denied/);
    });
    await asRole(db, "authenticated", b, async () => {
      expect((await db.query("select * from public.payments")).rows).toHaveLength(0);
      expect((await db.query("select * from public.subscriptions")).rows).toHaveLength(0);
      expect((await db.query("select user_id from public.checkout_orders")).rows.every((r) => (r as { user_id: string }).user_id === b)).toBe(true);
    });
    await asRole(db, "anon", null, async () => {
      for (const t of ["checkout_orders", "payments", "subscriptions", "webhook_events"]) await expect(db.query(`select * from public.${t}`)).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.billing_apply('paddle','x','t',now(),'{}')")).rejects.toThrow(/permission denied/);
    });
  });

  it("webhook_events is invisible to API roles and records one row per provider event", async () => {
    const a = await addUser(db);
    await asRole(db, "authenticated", a, async () => {
      await expect(db.query("select * from public.webhook_events")).rejects.toThrow(/permission denied/);
    });
    const id = eid();
    await apply("paddle", { kind: "noop" }, { id });
    await apply("paddle", { kind: "noop" }, { id });
    expect(await count("select 1 from public.webhook_events where event_id = $1", [id])).toBe(1);
    // the same id from a different provider is a different event
    await apply("nowpayments", { kind: "noop" }, { id });
    expect(await count("select 1 from public.webhook_events where event_id = $1", [id])).toBe(2);
  });

  it("an unknown effect kind rolls the whole event back (provider will retry)", async () => {
    const id = eid();
    await expect(apply("paddle", { kind: "wat" }, { id })).rejects.toThrow(/unknown_effect_kind/);
    expect(await count("select 1 from public.webhook_events where event_id = $1", [id])).toBe(0);
  });

  it("money is stored as exact integer minor units", async () => {
    const t = await row<{ data_type: string }>("select data_type from information_schema.columns where table_name = 'payments' and column_name = 'amount_minor'");
    expect(t[0].data_type).toBe("bigint");
    const o = await row<{ data_type: string }>("select data_type from information_schema.columns where table_name = 'checkout_orders' and column_name = 'expected_amount_minor'");
    expect(o[0].data_type).toBe("bigint");
  });
});
