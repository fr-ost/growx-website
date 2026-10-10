import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getCurrentUser = vi.fn();
const rpc = vi.fn();
const createNowPayment = vi.fn();

vi.mock("@/lib/supabase/user", () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));
vi.mock("@/lib/origin", () => ({ requestOrigin: async () => "https://www.growxapp.org" }));
vi.mock("@/lib/billing/nowpayments", async (orig) => ({ ...(await orig<typeof import("@/lib/billing/nowpayments")>()), createNowPayment: (i: unknown) => createNowPayment(i) }));

const { POST: cryptoCheckout } = await import("@/app/api/billing/crypto/checkout/route");
const { GET: options } = await import("@/app/api/billing/options/route");

const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk", SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
  NOWPAYMENTS_ENV: "sandbox", NOWPAYMENTS_API_KEY: "np-key", NOWPAYMENTS_IPN_SECRET: "np-ipn", NOWPAYMENTS_PAY_CURRENCIES: "usdttrc20,usdcerc20",
};
const KEYS = [...Object.keys(ENV), "EARLY_ADOPTER_ENABLED", "BILLING_LIVE_APPROVED"];

const req = (url: string, body?: unknown, headers: Record<string, string> = { origin: "https://www.growxapp.org", host: "www.growxapp.org" }) =>
  new NextRequest(`https://www.growxapp.org${url}`, { method: body === undefined ? "GET" : "POST", headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
const USER = { id: "11111111-1111-4111-8111-111111111111", email: "u@example.com", email_confirmed_at: "2026-10-01T00:00:00Z" };
const ORDER_ID = "22222222-2222-4222-8222-222222222222";

beforeEach(() => {
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, ENV);
  getCurrentUser.mockReset().mockResolvedValue(USER);
  rpc.mockReset().mockImplementation(async (fn: string) => (fn === "create_checkout_order" ? { data: { status: "ok", order_id: ORDER_ID }, error: null } : { data: null, error: null }));
  createNowPayment.mockReset();
});

describe("POST /api/billing/crypto/checkout", () => {
  const good = { payment_id: "999", pay_address: "TAddr", order_id: ORDER_ID, price_amount: 1.99, pay_amount: 2.01, pay_currency: "usdttrc20", expiration_estimate_date: new Date(Date.now() + 3600_000).toISOString() };

  it("requires an authenticated same-origin caller and strict input", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "usdttrc20" }))).status).toBe(401);
    getCurrentUser.mockResolvedValue(USER);
    expect((await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "usdttrc20", price_amount: 0.01 }))).status).toBe(400);
    expect((await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "usdttrc20" }, { origin: "https://evil.example", host: "www.growxapp.org" }))).status).toBe(403);
    expect(createNowPayment).not.toHaveBeenCalled();
  });

  it("only offers assets from the server allowlist", async () => {
    const res = await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "btc" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("unsupported_asset");
    expect(createNowPayment).not.toHaveBeenCalled();
  });

  it("creates the payment with the server's amount and order id, records the provider reference, and returns payment details", async () => {
    createNowPayment.mockResolvedValue(good);
    const res = await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "usdttrc20" }));
    expect(res.status).toBe(200);
    expect(rpc.mock.calls.find((c) => c[0] === "create_checkout_order")![1]).toMatchObject({ p_user_id: USER.id, p_provider: "nowpayments", p_amount_minor: 199, p_asset: "usdttrc20", p_period_days: 30 });
    expect(createNowPayment).toHaveBeenCalledWith({ orderId: ORDER_ID, productId: "PRO_MONTHLY", payCurrency: "usdttrc20", callbackUrl: "https://www.growxapp.org/api/webhooks/nowpayments" });
    expect(rpc.mock.calls.find((c) => c[0] === "attach_order_ref")![1]).toMatchObject({ p_ref: "999" });
    const body = await res.json();
    expect(body.payment).toMatchObject({ address: "TAddr", amount: "2.01", currency: "usdttrc20" });
    expect(body.prepaid).toBe(30);
  });

  it("refuses a provider response that doesn't match the order (amount, asset, order id, address) and closes the order", async () => {
    for (const bad of [{ price_amount: 0.01 }, { pay_currency: "usdterc20" }, { order_id: "99999999-9999-4999-8999-999999999999" }, { pay_address: "" }]) {
      createNowPayment.mockResolvedValue({ ...good, ...bad });
      rpc.mockClear();
      const res = await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "usdttrc20" }));
      expect(res.status, JSON.stringify(bad)).toBe(502);
      expect(rpc).toHaveBeenCalledWith("close_checkout_order", expect.objectContaining({ p_status: "failed" }));
      expect(rpc.mock.calls.some((c) => c[0] === "attach_order_ref")).toBe(false);
    }
  });

  it("is unavailable without NOWPayments configuration", async () => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    expect((await cryptoCheckout(req("/api/billing/crypto/checkout", { product: "PRO_MONTHLY", payCurrency: "usdttrc20" }))).status).toBe(503);
  });
});

describe("GET /api/billing/options", () => {
  it("exposes availability only (no keys, price ids or counts)", async () => {
    const body = await (await options()).json();
    expect(body.card).toBeUndefined();
    expect(body.crypto).toMatchObject({ available: true, prepaid: true, payCurrencies: ["usdttrc20", "usdcerc20"] });
    expect(body.earlyAdopter).toBe("unavailable");
    const text = JSON.stringify(body);
    for (const secret of ["service-role-secret", "np-ipn", "np-key"]) expect(text).not.toContain(secret);
  });

  it("nothing is available while unconfigured, and the early offer stays off", async () => {
    for (const k of Object.keys(ENV)) if (/^NOWPAY/.test(k)) delete process.env[k];
    const off = await (await options()).json();
    expect(off.crypto.available).toBe(false);
    expect(off.earlyAdopter).toBe("unavailable");
  });

  it("early-adopter state comes from the database function and never includes a count", async () => {
    process.env.EARLY_ADOPTER_ENABLED = "true";
    for (const [db, ui] of [["available", "available"], ["sold_out", "sold_out"], ["unavailable", "temporarily_unavailable"]] as const) {
      rpc.mockResolvedValueOnce({ data: db, error: null });
      const body = await (await options()).json();
      expect(body.earlyAdopter).toBe(ui);
      expect(JSON.stringify(body)).not.toMatch(/remaining|left|count/i);
    }
  });
});
