import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getCurrentUser = vi.fn();
const rpc = vi.fn();
const createNowInvoice = vi.fn();

vi.mock("@/lib/supabase/user", () => ({ getCurrentUser: () => getCurrentUser() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));
vi.mock("@/lib/origin", () => ({ requestOrigin: async () => "https://www.growxapp.org" }));
vi.mock("@/lib/billing/nowpayments", async (orig) => ({ ...(await orig<typeof import("@/lib/billing/nowpayments")>()), createNowInvoice: (i: unknown) => createNowInvoice(i) }));

const { POST: cryptoCheckout } = await import("@/app/api/billing/crypto/checkout/route");
const { GET: options } = await import("@/app/api/billing/options/route");

const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk", SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
  NOWPAYMENTS_ENV: "sandbox", NOWPAYMENTS_API_KEY: "np-key", NOWPAYMENTS_IPN_SECRET: "np-ipn",
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
  createNowInvoice.mockReset();
});

describe("POST /api/billing/crypto/checkout (hosted invoice)", () => {
  const good = { id: "4522625843", invoice_url: "https://nowpayments.io/payment/?iid=4522625843", order_id: ORDER_ID, price_amount: "1.99", price_currency: "usd" };
  const start = (body: unknown = { product: "PRO_MONTHLY" }, headers?: Record<string, string>) => cryptoCheckout(req("/api/billing/crypto/checkout", body, headers));

  it("requires an authenticated same-origin caller and strict input (only a product id)", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await start()).status).toBe(401);
    getCurrentUser.mockResolvedValue(USER);
    for (const bad of [{ product: "PRO_MONTHLY", price_amount: 0.01 }, { product: "PRO_MONTHLY", payCurrency: "eth" }, { product: "FREE" }, {}])
      expect((await start(bad)).status, JSON.stringify(bad)).toBe(400);
    expect((await start({ product: "PRO_MONTHLY" }, { origin: "https://evil.example", host: "www.growxapp.org" })).status).toBe(403);
    getCurrentUser.mockResolvedValue({ ...USER, email_confirmed_at: null });
    expect((await start()).status).toBe(403);
    expect(createNowInvoice).not.toHaveBeenCalled();
  });

  it("creates the order for the session user with the server's price and no preselected coin, then returns the invoice URL", async () => {
    createNowInvoice.mockResolvedValue(good);
    const res = await start();
    expect(res.status).toBe(200);
    expect(rpc.mock.calls.find((c) => c[0] === "create_checkout_order")![1]).toMatchObject({ p_user_id: USER.id, p_provider: "nowpayments", p_amount_minor: 199, p_asset: null, p_period_days: 30 });
    expect(createNowInvoice).toHaveBeenCalledWith({
      orderId: ORDER_ID, productId: "PRO_MONTHLY",
      callbackUrl: "https://www.growxapp.org/api/webhooks/nowpayments",
      successUrl: `https://www.growxapp.org/checkout/${ORDER_ID}`,
      cancelUrl: `https://www.growxapp.org/checkout/${ORDER_ID}?canceled=1`,
    });
    expect(rpc.mock.calls.find((c) => c[0] === "attach_order_ref")![1]).toMatchObject({ p_order_id: ORDER_ID, p_ref: null });
    expect(await res.json()).toEqual({ orderId: ORDER_ID, invoiceUrl: good.invoice_url });
  });

  it("refuses a provider response that doesn't match (amount, order id, non-NOWPayments URL) and closes the order", async () => {
    for (const bad of [{ price_amount: "0.01" }, { order_id: "99999999-9999-4999-8999-999999999999" }, { invoice_url: "https://evil.example/pay" }, { invoice_url: "http://nowpayments.io/x" }, { invoice_url: undefined }, { id: undefined }]) {
      createNowInvoice.mockResolvedValue({ ...good, ...bad });
      rpc.mockClear();
      const res = await start();
      expect(res.status, JSON.stringify(bad)).toBe(502);
      expect(rpc).toHaveBeenCalledWith("close_checkout_order", expect.objectContaining({ p_status: "failed" }));
      expect(rpc.mock.calls.some((c) => c[0] === "attach_order_ref")).toBe(false);
    }
  });

  it("a provider error closes the order and returns a short reference, never provider details", async () => {
    createNowInvoice.mockRejectedValue(new Error("NOWPayments invoice failed with HTTP 400 (INVALID_REQUEST_PARAMS: secret detail)"));
    const res = await start();
    expect(res.status).toBe(502);
    const text = JSON.stringify(await res.json());
    expect(text).toContain("ref: 400");
    expect(text).not.toContain("secret detail");
    expect(rpc).toHaveBeenCalledWith("close_checkout_order", expect.objectContaining({ p_status: "failed" }));
  });

  it("maps order refusals to 409 without calling the provider", async () => {
    rpc.mockImplementation(async (fn: string) => (fn === "create_checkout_order" ? { data: { status: "error", code: "already_owned" }, error: null } : { data: null, error: null }));
    expect((await start({ product: "PRO_LIFETIME" })).status).toBe(409);
    expect(createNowInvoice).not.toHaveBeenCalled();
  });

  it("is unavailable without NOWPayments configuration or live approval", async () => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    expect((await start()).status).toBe(503);
    process.env.NOWPAYMENTS_IPN_SECRET = "np-ipn";
    process.env.NOWPAYMENTS_ENV = "production";
    expect((await start()).status).toBe(503);
    process.env.BILLING_LIVE_APPROVED = "true";
    createNowInvoice.mockResolvedValue(good);
    expect((await start()).status).toBe(200);
  });
});

describe("GET /api/billing/options", () => {
  it("exposes availability only (no keys, price ids or counts)", async () => {
    const body = await (await options()).json();
    expect(body.card).toBeUndefined();
    expect(body.crypto).toMatchObject({ available: true, prepaid: true });
    expect(body.crypto.payCurrencies).toBeUndefined();
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
