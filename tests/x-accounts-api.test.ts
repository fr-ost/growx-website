import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUserBearer = vi.fn();
const getUserCookie = vi.fn();
const check = vi.fn();
const sessionIdOf = vi.fn();
const rpc = vi.fn();
const load = vi.fn();
const apiUser = vi.fn();
const startInvoice = vi.fn();
const npStatus = vi.fn();

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ auth: { getUser: getUserBearer } })) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ auth: { getUser: getUserCookie } })) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: (...a: unknown[]) => rpc(...a) }) }));
vi.mock("@/lib/session/active", () => ({
  checkActiveSession: (...a: unknown[]) => check(...a),
  verifiedSessionId: (...a: unknown[]) => sessionIdOf(...a),
}));
vi.mock("@/lib/x-accounts", async (orig) => ({ ...(await orig<typeof import("@/lib/x-accounts")>()), loadXAccounts: (...a: unknown[]) => load(...a) }));
vi.mock("@/lib/api/guards", async (orig) => ({ ...(await orig<typeof import("@/lib/api/guards")>()), requireApiUser: (...a: unknown[]) => apiUser(...a) }));
vi.mock("@/lib/billing/invoice", () => ({ startInvoiceCheckout: (...a: unknown[]) => startInvoice(...a) }));
vi.mock("@/lib/billing/config", async (orig) => ({ ...(await orig<typeof import("@/lib/billing/config")>()), nowPaymentsStatus: () => npStatus() }));

const route = await import("@/app/api/x-accounts/route");
const slots = await import("@/app/api/x-accounts/slots/checkout/route");

const EXT = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
const SID = "55555555-5555-4555-8555-555555555555";
const SUMMARY = { linkedXAccounts: [{ username: "Main", normalizedUsername: "main", linkedAt: "2026-10-16T00:00:00Z" }], baseAccountSlots: 2, purchasedExtraSlots: 0, allowedAccountSlots: 2, usedAccountSlots: 1, availableAccountSlots: 1 };
const url = "https://www.growxapp.org/api/x-accounts";
const bearer = { authorization: "Bearer a.b.c", origin: EXT, "content-type": "application/json" };
const sameOrigin = { origin: "https://www.growxapp.org", host: "www.growxapp.org", "content-type": "application/json" };
const req = (method: string, headers: Record<string, string>, body?: unknown) => new NextRequest(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.ALLOWED_EXTENSION_ORIGINS = EXT;
  getUserBearer.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
  getUserCookie.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
  check.mockResolvedValue("active");
  sessionIdOf.mockResolvedValue(SID);
  load.mockResolvedValue(SUMMARY);
  rpc.mockResolvedValue({ data: { status: "linked", normalized_username: "newname" }, error: null });
  npStatus.mockReturnValue({ available: true });
});

describe("GET /api/x-accounts", () => {
  it("returns the verified caller's accounts and allowance (extension bearer, CORS for the allowlisted origin)", async () => {
    const res = await route.GET(req("GET", bearer));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ...SUMMARY, extraSlotPrice: { amountMinor: 99, currency: "USD", label: "$0.99" } });
    expect(load).toHaveBeenCalledWith(expect.anything(), "u-1");
    expect(check).toHaveBeenCalledWith("u-1", SID, "extension");
    expect(res.headers.get("access-control-allow-origin")).toBe(EXT);
  });
  it("401 without a valid session, 401 session_revoked for a replaced session, 503 when unknown", async () => {
    getUserCookie.mockResolvedValue({ data: { user: null }, error: { message: "none" } });
    expect((await route.GET(req("GET", {}))).status).toBe(401);
    check.mockResolvedValue("revoked");
    const r = await route.GET(req("GET", bearer));
    expect([r.status, (await r.json()).error.code]).toEqual([401, "session_revoked"]);
    check.mockResolvedValue("error");
    expect((await route.GET(req("GET", bearer))).status).toBe(503);
    expect(load).not.toHaveBeenCalled();
  });
});

describe("POST /api/x-accounts (register)", () => {
  it("links with explicit confirmation, for the VERIFIED user only", async () => {
    const res = await route.POST(req("POST", bearer, { username: "@NewName", confirm: true }));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ status: "linked", normalizedUsername: "newname", usedAccountSlots: 1 });
    expect(rpc).toHaveBeenCalledWith("register_x_account", { p_user: "u-1", p_username: "@NewName" });
  });
  it("requires confirm: true and rejects any extra field (user ids, slot counts, payment state)", async () => {
    for (const body of [{ username: "a" }, { username: "a", confirm: false }, { username: "a", confirm: "yes" }]) {
      const r = await route.POST(req("POST", bearer, body));
      expect([r.status, (await r.json()).error.code]).toEqual([400, "confirmation_required"]);
    }
    for (const body of [{ username: "a", confirm: true, userId: "victim" }, { username: "a", confirm: true, allowedAccountSlots: 99 }, { username: "a", confirm: true, paid: true }, { username: 5, confirm: true }, null]) {
      const r = await route.POST(req("POST", bearer, body));
      expect(r.status).toBe(400);
    }
    expect(rpc).not.toHaveBeenCalled();
  });
  it("409 with the exact message for a username linked to another account, revealing nothing else", async () => {
    rpc.mockResolvedValue({ data: { status: "taken" }, error: null });
    const r = await route.POST(req("POST", bearer, { username: "someone", confirm: true }));
    const body = await r.json();
    expect(r.status).toBe(409);
    expect(body).toEqual({ error: { code: "x_username_taken", message: "This X username is already linked to another GrowX account." } });
  });
  it("409 no_slot_available when every slot is used; 400 invalid_username; 200 for an already linked name", async () => {
    rpc.mockResolvedValue({ data: { status: "no_slot", used: 2, allowed: 2 }, error: null });
    let r = await route.POST(req("POST", bearer, { username: "third", confirm: true }));
    expect([r.status, (await r.json()).error.code]).toEqual([409, "no_slot_available"]);
    rpc.mockResolvedValue({ data: { status: "invalid_username" }, error: null });
    r = await route.POST(req("POST", bearer, { username: "bad name", confirm: true }));
    expect([r.status, (await r.json()).error.code]).toEqual([400, "invalid_username"]);
    rpc.mockResolvedValue({ data: { status: "already_linked", normalized_username: "main" }, error: null });
    r = await route.POST(req("POST", bearer, { username: "MAIN", confirm: true }));
    expect([r.status, (await r.json()).status]).toEqual([200, "already_linked"]);
    rpc.mockResolvedValue({ data: null, error: { code: "57014" } });
    expect((await route.POST(req("POST", bearer, { username: "x", confirm: true }))).status).toBe(503);
  });
  it("cookie callers must be same-origin; revoked sessions cannot register", async () => {
    const cross = await route.POST(req("POST", { origin: "https://evil.example", host: "www.growxapp.org", "content-type": "application/json" }, { username: "a", confirm: true }));
    expect([cross.status, (await cross.json()).error.code]).toEqual([403, "bad_origin"]);
    expect((await route.POST(req("POST", sameOrigin, { username: "a", confirm: true }))).status).toBe(201);
    check.mockResolvedValue("revoked");
    expect((await route.POST(req("POST", bearer, { username: "a", confirm: true }))).status).toBe(401);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});

describe("no self-service change or removal", () => {
  it.each(["PUT", "PATCH", "DELETE"] as const)("%s is refused with 405", async (m) => {
    const r = await route[m](req(m, bearer, { username: "x" }));
    expect([r.status, (await r.json()).error.code]).toEqual([405, "x_account_immutable"]);
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("POST /api/x-accounts/slots/checkout", () => {
  const sreq = (body: unknown) => new NextRequest("https://www.growxapp.org/api/x-accounts/slots/checkout", { method: "POST", headers: sameOrigin, body: JSON.stringify(body) });
  beforeEach(() => {
    apiUser.mockResolvedValue({ ok: true, user: { id: "u-1" } });
    startInvoice.mockResolvedValue(new Response(JSON.stringify({ orderId: "o", invoiceUrl: "https://nowpayments.io/payment/?iid=1" }), { status: 200 }));
  });
  it("creates a server-owned order for exactly one slot for the session user", async () => {
    const r = await slots.POST(sreq({}));
    expect(r.status).toBe(200);
    expect(apiUser).toHaveBeenCalledWith(expect.anything(), { mutating: true, verifiedEmail: true });
    expect(startInvoice).toHaveBeenCalledWith(expect.anything(), "u-1", "X_ACCOUNT_SLOT");
  });
  it("accepts no client quantity, amount or user id", async () => {
    for (const b of [{ quantity: 5 }, { amount: 1 }, { userId: "victim" }, { product: "X_ACCOUNT_SLOT" }, null]) expect((await slots.POST(sreq(b))).status).toBe(400);
    expect(startInvoice).not.toHaveBeenCalled();
  });
  it("refuses unauthenticated callers and an unconfigured provider", async () => {
    apiUser.mockResolvedValue({ ok: false, response: new Response("{}", { status: 401 }) });
    expect((await slots.POST(sreq({}))).status).toBe(401);
    apiUser.mockResolvedValue({ ok: true, user: { id: "u-1" } });
    npStatus.mockReturnValue({ available: false });
    expect((await slots.POST(sreq({}))).status).toBe(503);
    expect(startInvoice).not.toHaveBeenCalled();
  });
});
