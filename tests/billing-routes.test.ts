import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getCurrentUser = vi.fn();
const rpc = vi.fn();
const createNowInvoice = vi.fn();

vi.mock("@/lib/supabase/user", () => ({ getCurrentUser: () => getCurrentUser() }));
let claimedSlots: number | null = 0;
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    rpc,
    from: () => ({ select: () => Promise.resolve(claimedSlots === null ? { count: null, error: { code: "42P01" } } : { count: claimedSlots, error: null }) }),
  }),
}));
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
  rpc.mockReset().mockImplementation(async (fn: string) => (fn === "create_checkout_order" ? { data: { status: "ok", order_id: ORDER_ID }, error: null } : fn === "early_adopter_state" ? { data: "available", error: null } : { data: null, error: null }));
  createNowInvoice.mockReset();
  claimedSlots = 0;
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

describe("lifetime price and the early bird (server decides)", () => {
  const good = { id: "9", invoice_url: "https://nowpayments.io/payment/?iid=9", order_id: ORDER_ID };
  const orderCall = () => rpc.mock.calls.find((c) => c[0] === "create_checkout_order")![1];
  const buy = (product = "PRO_LIFETIME") => cryptoCheckout(req("/api/billing/crypto/checkout", { product }));

  it("lifetime buyers get the $29.99 early-bird order while spots are available", async () => {
    createNowInvoice.mockResolvedValue({ ...good, price_amount: "29.99" });
    expect((await buy()).status).toBe(200);
    expect(orderCall()).toMatchObject({ p_product: "PRO_LIFETIME_EARLY", p_plan: "PRO_LIFETIME", p_amount_minor: 2999 });
    expect(createNowInvoice).toHaveBeenCalledWith(expect.objectContaining({ productId: "PRO_LIFETIME_EARLY" }));
  });
  it("when sold out, reserved, off or unreadable the regular $59.99 applies", async () => {
    createNowInvoice.mockResolvedValue({ ...good, price_amount: "59.99" });
    for (const state of ["sold_out", "unavailable", "weird"]) {
      rpc.mockClear();
      rpc.mockImplementation(async (fn: string) => (fn === "create_checkout_order" ? { data: { status: "ok", order_id: ORDER_ID }, error: null } : fn === "early_adopter_state" ? { data: state, error: null } : { data: null, error: null }));
      expect((await buy()).status, state).toBe(200);
      expect(orderCall(), state).toMatchObject({ p_product: "PRO_LIFETIME", p_amount_minor: 5999 });
    }
    process.env.EARLY_ADOPTER_ENABLED = "false";
    rpc.mockClear();
    await buy();
    expect(orderCall()).toMatchObject({ p_product: "PRO_LIFETIME", p_amount_minor: 5999 });
  });
  it("monthly and yearly never become early-bird orders, and the browser cannot ask for the early product", async () => {
    createNowInvoice.mockResolvedValue(good);
    await buy("PRO_YEARLY");
    expect(orderCall()).toMatchObject({ p_product: "PRO_YEARLY", p_amount_minor: 1499 });
    expect((await buy("PRO_LIFETIME_EARLY")).status).toBe(400);
  });
  it("an invoice that does not match the early-bird price is refused", async () => {
    createNowInvoice.mockResolvedValue({ ...good, price_amount: "59.99" }); // asked for 29.99
    expect((await buy()).status).toBe(502);
  });
  it("a changed early-bird situation never silently charges another price", async () => {
    for (const code of ["early_sold_out", "early_unavailable", "early_already_held"]) {
      rpc.mockImplementation(async (fn: string) => (fn === "create_checkout_order" ? { data: { status: "error", code }, error: null } : fn === "early_adopter_state" ? { data: "available", error: null } : { data: null, error: null }));
      const res = await buy();
      expect(res.status, code).toBe(409);
      expect((await res.json()).error.message).toMatch(/early-bird/i);
    }
    expect(createNowInvoice).not.toHaveBeenCalled();
  });
});

describe("GET /api/billing/options", () => {
  it("exposes availability and the early-bird counter only (no keys, price ids or user data)", async () => {
    claimedSlots = 37;
    const body = await (await options()).json();
    expect(body.card).toBeUndefined();
    expect(body.crypto).toMatchObject({ available: true, prepaid: true });
    expect(body.crypto.payCurrencies).toBeUndefined();
    expect(body.earlyBird).toEqual({ state: "available", total: 100, remaining: 63 });
    const text = JSON.stringify(body);
    for (const secret of ["service-role-secret", "np-ipn", "np-key"]) expect(text).not.toContain(secret);
  });

  it("nothing is available while unconfigured, and no early-bird data is read", async () => {
    for (const k of Object.keys(ENV)) if (/^NOWPAY/.test(k)) delete process.env[k];
    const off = await (await options()).json();
    expect(off.crypto.available).toBe(false);
    expect(off.earlyBird).toEqual({ state: "off", total: 100, remaining: null });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("early-bird state and remaining spots come from the database", async () => {
    const cases: [string, number | null, unknown][] = [
      ["available", 0, { state: "available", total: 100, remaining: 100 }],
      ["available", 99, { state: "available", total: 100, remaining: 1 }],
      ["unavailable", 90, { state: "temporarily_unavailable", total: 100, remaining: 10 }],
      ["sold_out", 100, { state: "sold_out", total: 100, remaining: 0 }],
      ["available", 100, { state: "sold_out", total: 100, remaining: 0 }],
      ["available", null, { state: "available", total: 100, remaining: null }],
    ];
    for (const [db, claimed, expected] of cases) {
      claimedSlots = claimed;
      rpc.mockResolvedValueOnce({ data: db, error: null });
      expect((await (await options()).json()).earlyBird, `${db}/${claimed}`).toEqual(expected);
    }
  });

  it("is off when disabled or when the database cannot be read (regular price applies)", async () => {
    process.env.EARLY_ADOPTER_ENABLED = "false";
    expect((await (await options()).json()).earlyBird.state).toBe("off");
    delete process.env.EARLY_ADOPTER_ENABLED;
    rpc.mockResolvedValueOnce({ data: null, error: { code: "42883" } });
    expect((await (await options()).json()).earlyBird.state).toBe("off");
  });
});
