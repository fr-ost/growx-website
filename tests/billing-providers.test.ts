import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkoutBodySchema, cryptoCheckoutBodySchema, decimalToMinor, getProduct, minorToDecimal, PRODUCT_IDS } from "@/lib/billing/catalog";
import { getNowPaymentsConfig, nowPaymentsStatus } from "@/lib/billing/config";
import { computeIpnSignature, isNowPaymentsUrl, mapNowPayment, nowEventId, sortKeysDeep, verifyIpnSignature } from "@/lib/billing/nowpayments";
import { handleNowPaymentsIpn } from "@/lib/billing/service";

const ENV = {
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
    expect(cryptoCheckoutBodySchema.safeParse({ product: "PRO_YEARLY" }).success).toBe(true);
    expect(cryptoCheckoutBodySchema.safeParse({ product: "PRO_YEARLY", price_amount: 0.01 }).success).toBe(false);
    expect(cryptoCheckoutBodySchema.safeParse({ product: "PRO_YEARLY", payCurrency: "eth" }).success).toBe(false);
  });
});

describe("provider configuration gates", () => {
  it("checkout is unavailable until every required setting exists; reports names, never values", () => {
    const s = nowPaymentsStatus({});
    expect(s.available).toBe(false);
    expect(s.problems).toEqual(expect.arrayContaining(["NOWPAYMENTS_API_KEY", "NOWPAYMENTS_IPN_SECRET"]));
    expect(JSON.stringify(nowPaymentsStatus(ENV))).not.toContain("np_ipn_secret");
  });
  it("sandbox config enables the products; the early offer needs its own flag", () => {
    const s = nowPaymentsStatus(ENV);
    expect(s).toMatchObject({ available: true, environment: "sandbox" });
    expect(s.products).toEqual(["PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME"]);
    expect(nowPaymentsStatus({ ...ENV, EARLY_ADOPTER_ENABLED: "true" }).products).toContain("PRO_LIFETIME_EARLY");
  });
  it("live is the default environment but takes payments only with explicit approval", () => {
    const live = { NOWPAYMENTS_API_KEY: "np_key", NOWPAYMENTS_IPN_SECRET: "np_ipn_secret" };
    expect(getNowPaymentsConfig(live)).toMatchObject({ environment: "production", baseUrl: "https://api.nowpayments.io/v1" });
    expect(nowPaymentsStatus(live).available).toBe(false);
    expect(nowPaymentsStatus(live).problems.join()).toMatch(/BILLING_LIVE_APPROVED/);
    expect(nowPaymentsStatus({ ...live, BILLING_LIVE_APPROVED: "true" })).toMatchObject({ available: true, environment: "production" });
    expect(getNowPaymentsConfig(ENV).baseUrl).toContain("sandbox");
  });
  it("only NOWPayments' own https pages are accepted as invoice links", () => {
    expect(isNowPaymentsUrl("https://nowpayments.io/payment/?iid=1")).toBe(true);
    expect(isNowPaymentsUrl("https://sandbox.nowpayments.io/payment/?iid=1")).toBe(true);
    for (const bad of ["http://nowpayments.io/x", "https://nowpayments.io.evil.com/x", "https://evilnowpayments.io/x", "javascript:alert(1)", "", null, 5])
      expect(isNowPaymentsUrl(bad), String(bad)).toBe(false);
  });
});

const fakeAdmin = (result = "applied", bindError: { code: string } | null = null) => {
  const rpc = vi.fn().mockResolvedValue({ data: { result }, error: null });
  const bind = vi.fn();
  // Minimal query-builder fake: select(...).eq().maybeSingle() and update(...).eq().eq().is().in()
  const chain = (done: () => unknown) => {
    const filters: unknown[][] = [];
    const c: Record<string, unknown> = { filters };
    for (const m of ["eq", "is"]) c[m] = (...a: unknown[]) => (filters.push([m, ...a]), c);
    c.in = async (...a: unknown[]) => (filters.push(["in", ...a]), done());
    c.maybeSingle = async () => done();
    return c;
  };
  const from = () => ({
    select: () => chain(() => ({ data: { product: "PRO_MONTHLY" } })),
    update: (values: unknown) => {
      const c = chain(() => ({ error: bindError }));
      bind(values, c.filters);
      return c;
    },
  });
  return { admin: { rpc, from } as unknown as SupabaseClient, rpc, bind };
};

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
  it("binds an invoice order to the first verified payment (payment id + the coin the customer chose), only after verification", async () => {
    const { admin, rpc, bind } = fakeAdmin();
    await handleNowPaymentsIpn(raw, "0".repeat(128), { admin, env: ENV, fetchPayment: apiPayment });
    expect(bind).not.toHaveBeenCalled();
    await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: () => Promise.resolve(ipn({ pay_currency: "ETH" }) as never) });
    expect(bind).toHaveBeenCalledTimes(1);
    const [values, filters] = bind.mock.calls[0];
    expect(values).toEqual({ provider_ref: "5077125051", asset: "eth" });
    expect(filters).toEqual(expect.arrayContaining([["eq", "id", payload.order_id], ["eq", "provider", "nowpayments"], ["is", "provider_ref", null], ["in", "status", ["created", "pending"]]]));
    expect(rpc.mock.calls[0][1].p_effect).toMatchObject({ asset: "ETH" });
  });
  it("a failing bind surfaces as an error (provider retries); an already-bound reference is not an error", async () => {
    await expect(handleNowPaymentsIpn(raw, nsig(payload), { admin: fakeAdmin("applied", { code: "08006" }).admin, env: ENV, fetchPayment: apiPayment })).rejects.toThrow(/bind_invoice_order/);
    const ok = fakeAdmin("applied", { code: "23505" });
    expect((await handleNowPaymentsIpn(raw, nsig(payload), { admin: ok.admin, env: ENV, fetchPayment: apiPayment })).status).toBe(200);
  });
  it("applies a verified, reconciled notification idempotently with a deterministic event id", async () => {
    const { admin, rpc } = fakeAdmin();
    await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: apiPayment });
    await handleNowPaymentsIpn(raw, nsig(payload), { admin, env: ENV, fetchPayment: apiPayment });
    expect(rpc.mock.calls[0][1].p_event_id).toBe(rpc.mock.calls[1][1].p_event_id);
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_provider: "nowpayments", p_effect: { kind: "payment", fulfill: true, product: "PRO_MONTHLY" } });
  });
});
