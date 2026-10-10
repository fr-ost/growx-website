import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkoutBodySchema, cryptoCheckoutBodySchema, decimalToMinor, getProduct, minorToDecimal, PRODUCT_IDS } from "@/lib/billing/catalog";
import { getNowPaymentsConfig, getPaddleConfig, nowPaymentsStatus, paddleProductForPrice, paddleStatus } from "@/lib/billing/config";
import { computeIpnSignature, mapNowPayment, nowEventId, sortKeysDeep, verifyIpnSignature } from "@/lib/billing/nowpayments";
import { mapPaddleEvent, verifyPaddleSignature } from "@/lib/billing/paddle";
import { handleNowPaymentsIpn, handlePaddleWebhook } from "@/lib/billing/service";

const ENV = {
  PADDLE_ENV: "sandbox", PADDLE_API_KEY: "pdl_sdbx_apikey_x", PADDLE_WEBHOOK_SECRET: "pdl_ntfset_secret", NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: "test_clienttoken",
  PADDLE_PRICE_ID_MONTHLY: "pri_monthly", PADDLE_PRICE_ID_YEARLY: "pri_yearly", PADDLE_PRICE_ID_LIFETIME: "pri_lifetime", PADDLE_PRICE_ID_EARLY_ADOPTER: "pri_early",
  NOWPAYMENTS_ENV: "sandbox", NOWPAYMENTS_API_KEY: "np_key", NOWPAYMENTS_IPN_SECRET: "np_ipn_secret",
};

describe("product catalog and amounts", () => {
  it("amounts are fixed server-side in exact minor units", () => {
    expect(PRODUCT_IDS.map((p) => [p, getProduct(p).amountMinor])).toEqual([["PRO_MONTHLY", 199], ["PRO_YEARLY", 1499], ["PRO_LIFETIME", 2999], ["PRO_LIFETIME_EARLY", 99]]);
    expect(getProduct("PRO_LIFETIME_EARLY").plan).toBe("PRO_LIFETIME");
    expect(getProduct("PRO_MONTHLY").cryptoPeriodDays).toBe(30);
    expect(getProduct("PRO_YEARLY").cryptoPeriodDays).toBe(365);
    expect(getProduct("PRO_LIFETIME").cryptoPeriodDays).toBeNull();
  });
  it("decimal parsing is exact and strict", () => {
    expect(decimalToMinor("1.99")).toBe(199);
    expect(decimalToMinor(14.99)).toBe(1499);
    expect(decimalToMinor("29.99")).toBe(2999);
    expect(decimalToMinor("0.99")).toBe(99);
    expect(decimalToMinor("5")).toBe(500);
    expect(decimalToMinor("5.1")).toBe(510);
    for (const bad of ["1.999", "-1", "abc", "", "1e3", null, undefined, "1,99"]) expect(decimalToMinor(bad)).toBeNull();
    expect(minorToDecimal(199)).toBe("1.99");
  });
  it("request bodies accept only a product id: amounts, price ids and entitlement claims are rejected", () => {
    expect(checkoutBodySchema.safeParse({ product: "PRO_MONTHLY" }).success).toBe(true);
    for (const bad of [{ product: "PRO_MONTHLY", amount: 1 }, { product: "PRO_MONTHLY", priceId: "pri_x" }, { product: "PRO_MONTHLY", plan: "PRO_LIFETIME" }, { product: "PRO_MONTHLY", userId: "x" }, { product: "FREE" }, { product: "pro_monthly" }, {}, null, "PRO_MONTHLY"])
      expect(checkoutBodySchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
    expect(cryptoCheckoutBodySchema.safeParse({ product: "PRO_YEARLY", payCurrency: "usdttrc20" }).success).toBe(true);
    expect(cryptoCheckoutBodySchema.safeParse({ product: "PRO_YEARLY", payCurrency: "usdttrc20", price_amount: 0.01 }).success).toBe(false);
    expect(cryptoCheckoutBodySchema.safeParse({ product: "PRO_YEARLY", payCurrency: "USDT TRC20; drop" }).success).toBe(false);
  });
});

describe("provider configuration gates", () => {
  it("checkout is unavailable until every required setting exists; reports names, never values", () => {
    const s = paddleStatus({});
    expect(s.available).toBe(false);
    expect(s.problems).toEqual(expect.arrayContaining(["PADDLE_API_KEY", "PADDLE_WEBHOOK_SECRET", "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN", "PADDLE_PRICE_ID_*"]));
    expect(nowPaymentsStatus({}).available).toBe(false);
    expect(JSON.stringify(paddleStatus(ENV))).not.toContain("pdl_ntfset_secret");
  });
  it("sandbox config enables exactly the configured products; the early offer needs its own flag", () => {
    const s = paddleStatus(ENV);
    expect(s).toMatchObject({ available: true, environment: "sandbox" });
    expect(s.products).toEqual(["PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME"]);
    expect(paddleStatus({ ...ENV, EARLY_ADOPTER_ENABLED: "true" }).products).toContain("PRO_LIFETIME_EARLY");
    expect(paddleStatus({ ...ENV, PADDLE_PRICE_ID_YEARLY: "" }).products).toEqual(["PRO_MONTHLY", "PRO_LIFETIME"]);
    expect(nowPaymentsStatus(ENV).products).not.toContain("PRO_LIFETIME_EARLY");
  });
  it("malformed price ids are ignored (never invented or guessed)", () => {
    expect(getPaddleConfig({ ...ENV, PADDLE_PRICE_ID_MONTHLY: "not-a-price" }).prices.PRO_MONTHLY).toBeUndefined();
  });
  it("live mode needs BOTH production env and explicit approval; sandbox/live credentials cannot be mixed", () => {
    const live = { ...ENV, PADDLE_ENV: "production", PADDLE_API_KEY: "pdl_live_apikey_x", NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: "live_tok" };
    expect(paddleStatus(live).available).toBe(false);
    expect(paddleStatus(live).problems.join()).toMatch(/BILLING_LIVE_APPROVED/);
    expect(paddleStatus({ ...live, BILLING_LIVE_APPROVED: "true" })).toMatchObject({ available: true, environment: "production" });
    expect(paddleStatus({ ...ENV, PADDLE_API_KEY: "pdl_live_apikey_x" }).problems.join()).toMatch(/live credentials/);
    expect(paddleStatus({ ...ENV, PADDLE_ENV: "production", BILLING_LIVE_APPROVED: "true" }).problems.join()).toMatch(/sandbox credentials/);
    expect(nowPaymentsStatus({ ...ENV, NOWPAYMENTS_ENV: "production" }).available).toBe(false);
    expect(getNowPaymentsConfig({ ...ENV }).baseUrl).toContain("sandbox");
    expect(getNowPaymentsConfig({ ...ENV, NOWPAYMENTS_ENV: "production" }).baseUrl).toBe("https://api.nowpayments.io/v1");
  });
  it("asset allowlist comes from server config and is sanitised", () => {
    expect(getNowPaymentsConfig({ ...ENV, NOWPAYMENTS_PAY_CURRENCIES: "USDTTRC20, usdcerc20 ,bad!!, usdttrc20" }).payCurrencies).toEqual(["usdttrc20", "usdcerc20"]);
    expect(getNowPaymentsConfig(ENV).payCurrencies.length).toBeGreaterThan(0);
  });
  it("price id -> product mapping only knows configured ids", () => {
    expect(paddleProductForPrice("pri_lifetime", ENV)).toBe("PRO_LIFETIME");
    expect(paddleProductForPrice("pri_other", ENV)).toBeNull();
    expect(paddleProductForPrice(undefined, ENV)).toBeNull();
  });
});

// ---------------------------------------------------------------- Paddle
const sign = (body: string, secret = ENV.PADDLE_WEBHOOK_SECRET, ts = Math.floor(Date.now() / 1000)) =>
  `ts=${ts};h1=${createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex")}`;

describe("Paddle signature verification (official SDK, raw body)", () => {
  const body = JSON.stringify({ event_id: "evt_1", event_type: "transaction.completed", occurred_at: new Date().toISOString(), data: { id: "txn_1" } });
  const secret = ENV.PADDLE_WEBHOOK_SECRET;
  it("accepts a correct signature over the exact raw body", async () => expect(await verifyPaddleSignature(body, sign(body), secret)).toBe(true));
  it("rejects wrong secret, tampered body (even whitespace), stale timestamp, malformed and missing headers", async () => {
    expect(await verifyPaddleSignature(body, sign(body, "other_secret"), secret)).toBe(false);
    expect(await verifyPaddleSignature(body + " ", sign(body), secret)).toBe(false);
    expect(await verifyPaddleSignature(JSON.stringify(JSON.parse(body), null, 1), sign(body), secret)).toBe(false); // re-serialised JSON must not verify
    expect(await verifyPaddleSignature(body, sign(body, secret, Math.floor(Date.now() / 1000) - 60), secret)).toBe(false);
    expect(await verifyPaddleSignature(body, "garbage", secret)).toBe(false);
    expect(await verifyPaddleSignature(body, "ts=1;h1=", secret)).toBe(false);
    expect(await verifyPaddleSignature(body, null, secret)).toBe(false);
    expect(await verifyPaddleSignature(body, sign(body), undefined)).toBe(false);
  });
});

const txn = (type: string, over: Record<string, unknown> = {}) => ({
  event_id: `evt_${type}`, event_type: type, occurred_at: "2026-10-10T10:00:00Z",
  data: { id: "txn_9", status: "completed", currency_code: "USD", customer_id: "ctm_1", subscription_id: null, custom_data: { order_id: "11111111-1111-4111-8111-111111111111" }, items: [{ price: { id: "pri_lifetime" }, quantity: 1 }], details: { totals: { total: "2999", currency_code: "USD" } }, ...over },
});

describe("Paddle event mapping (documented semantics)", () => {
  it("paid = captured (no fulfilment); completed = fulfilment; payment_failed = failed attempt, not conclusive; canceled = conclusive", () => {
    expect(mapPaddleEvent(txn("transaction.paid"), ENV)).toMatchObject({ kind: "payment", status: "succeeded", fulfill: false, product: "PRO_LIFETIME", price_product: "PRO_LIFETIME", amount_minor: 2999, currency: "USD", order_id: "11111111-1111-4111-8111-111111111111" });
    expect(mapPaddleEvent(txn("transaction.completed"), ENV)).toMatchObject({ status: "succeeded", fulfill: true });
    expect(mapPaddleEvent(txn("transaction.payment_failed"), ENV)).toMatchObject({ status: "failed", fulfill: false });
    expect(mapPaddleEvent(txn("transaction.payment_failed"), ENV)).not.toHaveProperty("order_status");
    expect(mapPaddleEvent(txn("transaction.canceled"), ENV)).toMatchObject({ status: "failed", order_status: "canceled" });
    for (const t of ["transaction.created", "transaction.ready", "transaction.billed", "transaction.updated", "transaction.past_due", "transaction.revised"]) expect(mapPaddleEvent(txn(t), ENV).kind).toBe("noop");
  });
  it("never trusts client claims: product comes from the server price map; unknown or mixed prices are ignored", () => {
    expect(mapPaddleEvent(txn("transaction.completed", { items: [{ price: { id: "pri_unknown" }, quantity: 1 }] }), ENV)).toMatchObject({ kind: "noop", reason: "unknown_price" });
    expect(mapPaddleEvent(txn("transaction.completed", { items: [{ price: { id: "pri_lifetime" } }, { price: { id: "pri_monthly" } }] }), ENV).kind).toBe("noop");
    expect(mapPaddleEvent(txn("transaction.completed", { items: [{ price: { id: "pri_early" } }], custom_data: { order_id: "x", user_id: "attacker", plan: "PRO_LIFETIME", amount: 1 } }), ENV)).toMatchObject({ product: "PRO_LIFETIME_EARLY" });
    const e = mapPaddleEvent(txn("transaction.completed", { custom_data: { user_id: "attacker" } }), ENV);
    expect(JSON.stringify(e)).not.toContain("attacker");
  });
  it("subscription events map status, plan from price, billing period end and scheduled cancellation", () => {
    const sub = (type: string, over: Record<string, unknown> = {}) => ({
      event_id: `e_${type}`, event_type: type, occurred_at: "2026-10-10T10:00:00Z",
      data: { id: "sub_1", status: "active", customer_id: "ctm_1", custom_data: { order_id: "o1" }, items: [{ price: { id: "pri_monthly" }, quantity: 1 }], current_billing_period: { starts_at: "2026-10-10T00:00:00Z", ends_at: "2026-11-10T00:00:00Z" }, scheduled_change: null, ...over },
    });
    expect(mapPaddleEvent(sub("subscription.created"), ENV)).toMatchObject({ kind: "subscription_sync", plan: "PRO_MONTHLY", status: "active", period_end: "2026-11-10T00:00:00Z", cancel_at_period_end: false, provider_subscription_id: "sub_1" });
    expect(mapPaddleEvent(sub("subscription.updated", { scheduled_change: { action: "cancel", effective_at: "2026-11-10T00:00:00Z" } }), ENV)).toMatchObject({ cancel_at_period_end: true, status: "active" });
    expect(mapPaddleEvent(sub("subscription.past_due", { status: "past_due" }), ENV)).toMatchObject({ status: "past_due" });
    expect(mapPaddleEvent(sub("subscription.canceled", { status: "canceled" }), ENV)).toMatchObject({ status: "canceled" });
    expect(mapPaddleEvent(sub("subscription.canceled", { status: "active" }), ENV)).toMatchObject({ status: "canceled" }); // the event type is authoritative
    expect(mapPaddleEvent(sub("subscription.paused", { status: "paused" }), ENV)).toMatchObject({ status: "paused" });
    expect(mapPaddleEvent(sub("subscription.created", { items: [{ price: { id: "pri_lifetime" } }] }), ENV)).toMatchObject({ plan: undefined }); // not a recurring plan
  });
  it("adjustments map refunds and chargebacks", () => {
    const adj = (over: Record<string, unknown>) => ({ event_id: "e_a", event_type: "adjustment.updated", occurred_at: "2026-10-10T10:00:00Z", data: { id: "adj_1", action: "refund", type: "full", status: "approved", transaction_id: "txn_9", subscription_id: null, totals: { total: "2999" }, ...over } });
    expect(mapPaddleEvent(adj({}), ENV)).toMatchObject({ kind: "adjustment", adjustment_id: "adj_1", action: "refund", adj_type: "full", status: "approved", amount_minor: 2999, provider_payment_id: "txn_9" });
    expect(mapPaddleEvent(adj({ action: "chargeback" }), ENV)).toMatchObject({ action: "chargeback" });
  });
  it("unrelated events are recorded but have no effect", () => {
    expect(mapPaddleEvent({ event_id: "e", event_type: "customer.updated", occurred_at: "", data: {} }, ENV).kind).toBe("noop");
  });
});

const fakeAdmin = (result = "applied") => {
  const rpc = vi.fn().mockResolvedValue({ data: { result }, error: null });
  return { admin: { rpc, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { product: "PRO_MONTHLY" } }) }) }) }) } as unknown as SupabaseClient, rpc };
};

describe("Paddle webhook handler", () => {
  const body = JSON.stringify(txn("transaction.completed"));
  it("401 and NO database call for invalid or missing signatures", async () => {
    const { admin, rpc } = fakeAdmin();
    expect((await handlePaddleWebhook(body, sign(body, "wrong"), { admin, env: ENV })).status).toBe(401);
    expect((await handlePaddleWebhook(body, null, { admin, env: ENV })).status).toBe(401);
    expect((await handlePaddleWebhook(body + "x", sign(body), { admin, env: ENV })).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("503 when the endpoint secret is not configured (fail closed)", async () => {
    const { admin, rpc } = fakeAdmin();
    expect((await handlePaddleWebhook(body, sign(body), { admin, env: { ...ENV, PADDLE_WEBHOOK_SECRET: "" } })).status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("a valid event is applied once through the idempotent database function with the event id", async () => {
    const { admin, rpc } = fakeAdmin();
    const r = await handlePaddleWebhook(body, sign(body), { admin, env: ENV });
    expect(r).toEqual({ status: 200, body: { ok: true, result: "applied" } });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0][0]).toBe("billing_apply");
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_provider: "paddle", p_event_id: "evt_transaction.completed", p_event_type: "transaction.completed", p_effect: { kind: "payment", fulfill: true } });
  });
  it("a database failure surfaces as an error (HTTP 500 -> Paddle retries); duplicates are acknowledged", async () => {
    const bad = { rpc: vi.fn().mockResolvedValue({ data: null, error: { code: "XX000" } }) } as unknown as SupabaseClient;
    await expect(handlePaddleWebhook(body, sign(body), { admin: bad, env: ENV })).rejects.toThrow(/billing_apply failed/);
    const { admin } = fakeAdmin("duplicate");
    expect((await handlePaddleWebhook(body, sign(body), { admin, env: ENV })).body).toMatchObject({ result: "duplicate" });
  });
  it("invalid JSON with a valid signature is a 400", async () => {
    const { admin } = fakeAdmin();
    const junk = "{not json";
    expect((await handlePaddleWebhook(junk, sign(junk), { admin, env: ENV })).status).toBe(400);
  });
});

// ----------------------------------------------------------- NOWPayments
const ipn = (over: Record<string, unknown> = {}) => ({
  payment_id: 5077125051, payment_status: "finished", pay_address: "TXyz", price_amount: 1.99, price_currency: "usd", pay_amount: 2.0, actually_paid: 2.0,
  pay_currency: "usdttrc20", order_id: "22222222-2222-4222-8222-222222222222", updated_at: 1700000000000, ...over,
});
const nsig = (payload: unknown, secret = ENV.NOWPAYMENTS_IPN_SECRET) => computeIpnSignature(payload, secret);

describe("NOWPayments IPN signature", () => {
  it("sorts keys recursively and signs with HMAC-SHA512 (hex)", () => {
    expect(JSON.stringify(sortKeysDeep({ b: 1, a: { d: 1, c: [{ z: 1, y: 2 }] } }))).toBe('{"a":{"c":[{"y":2,"z":1}],"d":1},"b":1}');
    const payload = ipn();
    const expected = createHmac("sha512", ENV.NOWPAYMENTS_IPN_SECRET).update(JSON.stringify(sortKeysDeep(payload))).digest("hex");
    expect(nsig(payload)).toBe(expected);
    expect(expected).toHaveLength(128);
  });
  it("verifies regardless of the order keys arrive in; rejects tampering, wrong secret, malformed and missing signatures", () => {
    const payload = ipn();
    const reordered = Object.fromEntries(Object.entries(payload).reverse());
    expect(verifyIpnSignature(reordered, nsig(payload), ENV.NOWPAYMENTS_IPN_SECRET)).toBe(true);
    expect(verifyIpnSignature(ipn({ price_amount: 0.01 }), nsig(payload), ENV.NOWPAYMENTS_IPN_SECRET)).toBe(false);
    expect(verifyIpnSignature(payload, nsig(payload, "other"), ENV.NOWPAYMENTS_IPN_SECRET)).toBe(false);
    for (const bad of [null, "", "abc", "z".repeat(128), nsig(payload).slice(0, 100)]) expect(verifyIpnSignature(payload, bad, ENV.NOWPAYMENTS_IPN_SECRET)).toBe(false);
    expect(verifyIpnSignature(payload, nsig(payload), undefined)).toBe(false);
  });
});

describe("NOWPayments status mapping", () => {
  const m = (status: string, over: Record<string, unknown> = {}) => mapNowPayment(ipn({ payment_status: status, ...over }) as never, "PRO_MONTHLY");
  it("only 'finished' with the full amount fulfils; pending/confirming/confirmed/sending never do", () => {
    expect(m("finished")).toMatchObject({ kind: "payment", status: "succeeded", fulfill: true, amount_minor: 199, currency: "USD", asset: "usdttrc20", product: "PRO_MONTHLY" });
    expect(m("waiting")).toMatchObject({ status: "pending", fulfill: false });
    for (const s of ["confirming", "confirmed", "sending"]) expect(m(s)).toMatchObject({ status: "confirming", fulfill: false });
    expect(m("partially_paid", { actually_paid: 1.0 })).toMatchObject({ status: "partially_paid", fulfill: false });
  });
  it("'finished' with an underpayment, or without amounts, is treated as partially paid (never fulfils)", () => {
    expect(m("finished", { actually_paid: 1.5 })).toMatchObject({ status: "partially_paid", fulfill: false });
    expect(m("finished", { actually_paid: undefined })).toMatchObject({ status: "partially_paid", fulfill: false });
    expect(m("finished", { actually_paid: 2.5 })).toMatchObject({ status: "succeeded", fulfill: true }); // overpayment is fine
  });
  it("failed/expired close the order; refunded becomes a full refund adjustment; unknown statuses are ignored", () => {
    expect(m("failed")).toMatchObject({ status: "failed", order_status: "failed", fulfill: false });
    expect(m("expired")).toMatchObject({ status: "expired", order_status: "expired" });
    expect(m("refunded")).toMatchObject({ kind: "adjustment", adjustment_id: "refund:5077125051", action: "refund", adj_type: "full", status: "approved" });
    expect(m("mystery").kind).toBe("noop");
  });
  it("a price that is not an exact 2-decimal amount cannot match any order", () => {
    expect(m("finished", { price_amount: 1.999 })).toMatchObject({ amount_minor: -1 });
    expect(m("finished", { price_amount: "abc" })).toMatchObject({ amount_minor: -1 });
  });
  it("event ids are deterministic per provider state, so duplicate IPNs collapse", () => {
    expect(nowEventId(ipn() as never)).toBe(nowEventId(ipn() as never));
    expect(nowEventId(ipn() as never)).not.toBe(nowEventId(ipn({ payment_status: "waiting" }) as never));
    expect(nowEventId(ipn({ actually_paid: 1 }) as never)).not.toBe(nowEventId(ipn({ actually_paid: 2 }) as never));
  });
});

describe("NOWPayments IPN handler", () => {
  const payload = ipn();
  const raw = JSON.stringify(payload);
  const apiPayment = () => Promise.resolve(payload as never);

  it("401 and no database call for a bad/missing signature or tampered body", async () => {
    const { admin, rpc } = fakeAdmin();
    expect((await handleNowPaymentsIpn(raw, "0".repeat(128), { admin, env: ENV, fetchPayment: apiPayment })).status).toBe(401);
    expect((await handleNowPaymentsIpn(raw, null, { admin, env: ENV, fetchPayment: apiPayment })).status).toBe(401);
    expect((await handleNowPaymentsIpn(JSON.stringify(ipn({ price_amount: 0.01 })), nsig(payload), { admin, env: ENV, fetchPayment: apiPayment })).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("503 when the IPN secret is missing (fail closed)", async () => {
    const { admin, rpc } = fakeAdmin();
    expect((await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: { ...ENV, NOWPAYMENTS_IPN_SECRET: "" } })).status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("reconciles with the provider API and applies the API's state, not the notification's", async () => {
    const { admin, rpc } = fakeAdmin();
    const r = await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: () => Promise.resolve(ipn({ payment_status: "waiting", actually_paid: 0 }) as never) });
    expect(r.status).toBe(200);
    expect(rpc.mock.calls[0][1].p_effect).toMatchObject({ status: "pending", fulfill: false });
  });
  it("rejects a signed notification that disagrees with the provider about the order or payment id", async () => {
    const { admin, rpc } = fakeAdmin();
    const r = await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: () => Promise.resolve(ipn({ order_id: "33333333-3333-4333-8333-333333333333" }) as never) });
    expect(r.body).toMatchObject({ result: "rejected:reconcile_mismatch" });
    expect(rpc).not.toHaveBeenCalled();
  });
  it("asks the provider to retry (503) if reconciliation is unavailable, instead of trusting the notification", async () => {
    const { admin, rpc } = fakeAdmin();
    const r = await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: () => Promise.reject(new Error("down")) });
    expect(r.status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("applies a verified, reconciled notification idempotently with a deterministic event id", async () => {
    const { admin, rpc } = fakeAdmin();
    await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: apiPayment });
    await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: apiPayment });
    expect(rpc.mock.calls[0][1].p_event_id).toBe(rpc.mock.calls[1][1].p_event_id);
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_provider: "nowpayments", p_effect: { kind: "payment", fulfill: true, product: "PRO_MONTHLY" } });
  });
});
