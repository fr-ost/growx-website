import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const apiUser = vi.fn();
const rpc = vi.fn();
let adminIds = new Set<string>();

vi.mock("@/lib/api/guards", async (orig) => ({ ...(await orig<typeof import("@/lib/api/guards")>()), requireApiUser: (...a: unknown[]) => apiUser(...a) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    rpc: (...a: unknown[]) => rpc(...a),
    from: (table: string) => ({
      select: () => ({
        eq: (_c: string, id: string) => ({ maybeSingle: async () => (table === "admins" && adminIds.has(id) ? { data: { user_id: id }, error: null } : { data: null, error: null }) }),
      }),
    }),
  }),
}));

const users = await import("@/app/api/admin/users/route");
const gifts = await import("@/app/api/admin/gifts/route");
const gift = await import("@/app/api/admin/gifts/[id]/route");
const eb = await import("@/app/api/admin/early-bird/route");
const alloc = await import("@/app/api/admin/early-bird/allocation/route");

const ADMIN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const GIFT = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const H = { origin: "https://www.growxapp.org", host: "www.growxapp.org", "content-type": "application/json" };
const req = (path: string, body?: unknown, method = body === undefined ? "GET" : "POST") => new NextRequest(`https://www.growxapp.org${path}`, { method, headers: H, body: body === undefined ? undefined : JSON.stringify(body) });
const ctx = { params: Promise.resolve({ id: GIFT }) };
const as = (id: string | null) => apiUser.mockResolvedValue(id ? { ok: true, user: { id, email_confirmed_at: "2026-01-01" } } : { ok: false, response: new Response(JSON.stringify({ error: { code: "unauthenticated" } }), { status: 401 }) });

beforeEach(() => {
  vi.clearAllMocks();
  adminIds = new Set([ADMIN]);
  as(ADMIN);
  rpc.mockImplementation(async (fn: string) => ({
    data: { admin_find_user: { status: "ok", user_id: USER, email: "u@example.com" }, admin_grant_gift: { status: "granted", gift_id: GIFT, expires_at: null }, admin_extend_gift: { status: "extended", expires_at: "2027-01-01T00:00:00Z" }, admin_revoke_gift: { status: "revoked" }, admin_set_early_bird: { status: "saved" }, admin_increase_early_bird_allocation: { status: "saved" } }[fn],
    error: null,
  }));
});

const ALL = () => [
  users.GET(req(`/api/admin/users?email=u@example.com`)),
  gifts.POST(req("/api/admin/gifts", { userId: USER, duration: "30d" })),
  gift.POST(req(`/api/admin/gifts/${GIFT}`, { action: "revoke" }), ctx),
  eb.POST(req("/api/admin/early-bird", { remaining: 5, enabled: true })),
  alloc.POST(req("/api/admin/early-bird/allocation", { allocation: 150, reason: "Second wave approved" })),
];

describe("admin authorization (server-side, every endpoint)", () => {
  it("a signed-in non-admin gets 404 on every admin endpoint and nothing is called", async () => {
    as(USER);
    for (const r of await Promise.all(ALL())) expect(r.status).toBe(404);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("signed-out callers get 401; writes require same-origin + verified email (requireApiUser options)", async () => {
    as(null);
    for (const r of await Promise.all(ALL())) expect(r.status).toBe(401);
    as(ADMIN);
    await gifts.POST(req("/api/admin/gifts", { userId: USER, duration: "30d" }));
    expect(apiUser).toHaveBeenLastCalledWith(expect.anything(), { mutating: true, verifiedEmail: true });
  });
  it("client-supplied admin flags or admin ids are rejected; the admin id is always the session user", async () => {
    for (const body of [{ userId: USER, duration: "30d", admin: true }, { userId: USER, duration: "30d", p_admin: USER }, { userId: USER, duration: "10y" }, { userId: "x", duration: "30d" }]) {
      expect((await gifts.POST(req("/api/admin/gifts", body))).status).toBe(400);
    }
    await gifts.POST(req("/api/admin/gifts", { userId: USER, duration: "lifetime", reason: "partner" }));
    expect(rpc).toHaveBeenLastCalledWith("admin_grant_gift", { p_admin: ADMIN, p_user: USER, p_duration: "lifetime", p_reason: "partner" });
  });
});

describe("gift endpoints", () => {
  it("finds a user, grants, extends and revokes", async () => {
    expect(await (await users.GET(req("/api/admin/users?email=u@example.com"))).json()).toMatchObject({ userId: USER, email: "u@example.com" });
    expect((await gifts.POST(req("/api/admin/gifts", { userId: USER, duration: "7d" }))).status).toBe(201);
    const ext = await gift.POST(req(`/api/admin/gifts/${GIFT}`, { action: "extend", duration: "90d" }), ctx);
    expect(await ext.json()).toEqual({ status: "extended", expiresAt: "2027-01-01T00:00:00Z" });
    expect(rpc).toHaveBeenLastCalledWith("admin_extend_gift", { p_admin: ADMIN, p_gift: GIFT, p_duration: "90d", p_reason: null });
    expect((await gift.POST(req(`/api/admin/gifts/${GIFT}`, { action: "revoke", reason: "ended" }), ctx)).status).toBe(200);
    expect(rpc).toHaveBeenLastCalledWith("admin_revoke_gift", { p_admin: ADMIN, p_gift: GIFT, p_reason: "ended" });
  });
  it("maps database refusals to clear errors", async () => {
    rpc.mockResolvedValueOnce({ data: { status: "active_gift_exists" }, error: null });
    const r = await gifts.POST(req("/api/admin/gifts", { userId: USER, duration: "7d" }));
    expect([r.status, (await r.json()).error.code]).toEqual([409, "active_gift_exists"]);
    rpc.mockResolvedValueOnce({ data: { status: "revoked" }, error: null }); // extending a revoked gift
    expect((await gift.POST(req(`/api/admin/gifts/${GIFT}`, { action: "extend", duration: "7d" }), ctx)).status).toBe(409);
    rpc.mockResolvedValueOnce({ data: { status: "not_found" }, error: null });
    expect((await users.GET(req("/api/admin/users?email=nobody@example.com"))).status).toBe(404);
    expect((await users.GET(req("/api/admin/users?email=notanemail"))).status).toBe(400);
  });
});

describe("early-bird endpoints", () => {
  it("remaining must be a non-negative integer; extra fields are rejected", async () => {
    for (const body of [{ remaining: -1, enabled: true }, { remaining: 2.5, enabled: true }, { remaining: "5", enabled: true }, { remaining: 5, enabled: true, soldCount: 0 }, { remaining: 5 }]) {
      expect((await eb.POST(req("/api/admin/early-bird", body))).status, JSON.stringify(body)).toBe(400);
    }
    expect((await eb.POST(req("/api/admin/early-bird", { remaining: 0, enabled: false, reason: "pause", expectedUpdatedAt: "2026-10-17T00:00:00Z" }))).status).toBe(200);
    expect(rpc).toHaveBeenLastCalledWith("admin_set_early_bird", { p_admin: ADMIN, p_remaining: 0, p_enabled: false, p_reason: "pause", p_expected_updated_at: "2026-10-17T00:00:00Z" });
  });
  it("stale edits and over-allocation are refused with explanations", async () => {
    rpc.mockResolvedValueOnce({ data: { status: "stale" }, error: null });
    expect((await eb.POST(req("/api/admin/early-bird", { remaining: 1, enabled: true }))).status).toBe(409);
    rpc.mockResolvedValueOnce({ data: { status: "exceeds_allocation", max_remaining: 63 }, error: null });
    const r = await eb.POST(req("/api/admin/early-bird", { remaining: 99, enabled: true }));
    expect((await r.json()).error.message).toMatch(/63/);
  });
  it("allocation increases need a reason of 10+ characters", async () => {
    expect((await alloc.POST(req("/api/admin/early-bird/allocation", { allocation: 150, reason: "short" }))).status).toBe(400);
    expect((await alloc.POST(req("/api/admin/early-bird/allocation", { allocation: 150, reason: "Second wave approved" }))).status).toBe(200);
  });
});
