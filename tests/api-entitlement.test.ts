import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUserBearer = vi.fn();
const getUserCookie = vi.fn();
const fromCalls: Array<{ table: string; userId?: unknown }> = [];
let dbError = false;
let rows: Record<string, unknown[]> = { trials: [], subscriptions: [] };

let errorTables: string[] = [];
/** Chainable, awaitable query mock: select().eq().eq().order() all resolve to the table's rows. */
const makeFrom = () => (table: string) => {
  const q = {
    select: () => q,
    order: () => q,
    eq: (col: string, val: unknown) => {
      if (col === "user_id") fromCalls.push({ table, userId: val });
      return q;
    },
    then: (ok: (v: unknown) => unknown, bad?: (e: unknown) => unknown) =>
      Promise.resolve(dbError || errorTables.includes(table) ? { data: null, error: { message: "x" } } : { data: rows[table] ?? [], error: null }).then(ok, bad),
  };
  return q;
};

const checkActiveSession = vi.fn();
const sessionIdOf = vi.fn();
vi.mock("@/lib/session/active", () => ({
  checkActiveSession: (...a: unknown[]) => checkActiveSession(...a),
  verifiedSessionId: (...a: unknown[]) => sessionIdOf(...a),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: { getUser: getUserBearer }, from: makeFrom() })),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: getUserCookie }, from: makeFrom() })),
}));

const { GET, OPTIONS } = await import("@/app/api/entitlement/route");

const EXT = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
const req = (headers: Record<string, string> = {}, url = "http://localhost/api/entitlement") => new NextRequest(url, { headers });

beforeEach(() => {
  vi.clearAllMocks();
  fromCalls.length = 0;
  dbError = false;
  errorTables = [];
  rows = { trials: [], subscriptions: [] };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.ALLOWED_EXTENSION_ORIGINS = EXT;
  checkActiveSession.mockReset().mockResolvedValue("active");
  sessionIdOf.mockReset().mockResolvedValue("55555555-5555-4555-8555-555555555555");
});

describe("GET /api/entitlement", () => {
  it("401 without credentials", async () => {
    getUserCookie.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const res = await GET(req());
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthenticated");
    expect(fromCalls).toHaveLength(0);
  });

  it("401 for an invalid bearer token", async () => {
    getUserBearer.mockResolvedValue({ data: { user: null }, error: { message: "bad jwt" } });
    const res = await GET(req({ authorization: "Bearer bad.token.value" }));
    expect(res.status).toBe(401);
    expect(getUserCookie).not.toHaveBeenCalled();
  });

  it("ignores malformed Authorization headers instead of crashing", async () => {
    getUserCookie.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const res = await GET(req({ authorization: "Basic abc" }));
    expect(res.status).toBe(401);
  });

  it("FREE for a user with no records (missing profile rows are safe)", async () => {
    getUserBearer.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const res = await GET(req({ authorization: "Bearer a.b.c" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ plan: "FREE", isPremium: false });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("only ever queries the verified user's id, ignoring query-string ids", async () => {
    getUserBearer.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    await GET(req({ authorization: "Bearer a.b.c" }, "http://localhost/api/entitlement?user_id=victim&userId=victim"));
    expect(fromCalls.length).toBeGreaterThan(0);
    expect(fromCalls.every((c) => c.userId === "u1")).toBe(true);
  });

  it("returns TRIAL for an active trial and FREE once it has expired", async () => {
    getUserBearer.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    rows.trials = [{ status: "active", started_at: new Date(Date.now() - 86400000).toISOString(), expires_at: new Date(Date.now() + 86400000).toISOString() }];
    expect((await (await GET(req({ authorization: "Bearer a.b.c" }))).json()).plan).toBe("TRIAL");
    rows.trials = [{ status: "active", started_at: new Date(Date.now() - 20 * 86400000).toISOString(), expires_at: new Date(Date.now() - 6 * 86400000).toISOString() }];
    expect((await (await GET(req({ authorization: "Bearer a.b.c" }))).json()).plan).toBe("FREE");
  });

  it("503 (never Premium) when the database errors", async () => {
    getUserBearer.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    dbError = true;
    const res = await GET(req({ authorization: "Bearer a.b.c" }));
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toMatch(/isPremium/);
  });

  it("503 when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect((await GET(req())).status).toBe(503);
  });
});

describe("CORS", () => {
  it("echoes only allowlisted extension origins", async () => {
    getUserBearer.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const ok = await GET(req({ authorization: "Bearer a.b.c", origin: EXT }));
    expect(ok.headers.get("access-control-allow-origin")).toBe(EXT);
    expect(ok.headers.get("access-control-allow-credentials")).toBeNull();
    const evil = await GET(req({ authorization: "Bearer a.b.c", origin: "https://evil.example" }));
    expect(evil.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("preflight succeeds only for allowlisted origins", () => {
    expect(OPTIONS(req({ origin: EXT })).status).toBe(204);
    expect(OPTIONS(req({ origin: "https://evil.example" })).status).toBe(403);
    expect(OPTIONS(req()).status).toBe(403);
  });

  it("ignores malformed entries in ALLOWED_EXTENSION_ORIGINS (no wildcards)", () => {
    process.env.ALLOWED_EXTENSION_ORIGINS = "*, https://evil.example, chrome-extension://short";
    expect(OPTIONS(req({ origin: "*" })).status).toBe(403);
    expect(OPTIONS(req({ origin: "https://evil.example" })).status).toBe(403);
  });

  describe("single active session", () => {
    const SID = "55555555-5555-4555-8555-555555555555";
    const user = { data: { user: { id: "u-1" } }, error: null };

    it("a revoked bearer session gets a DEFINITIVE 401 session_revoked and no entitlement data is read", async () => {
      getUserBearer.mockResolvedValue(user);
      checkActiveSession.mockResolvedValue("revoked");
      const res = await GET(req({ authorization: "Bearer a.b.c", origin: EXT }));
      expect(res.status).toBe(401);
      expect((await res.json()).error.code).toBe("session_revoked");
      expect(checkActiveSession).toHaveBeenCalledWith("u-1", SID, "extension");
      expect(fromCalls).toHaveLength(0);
    });

    it("a failing check is 503 (unknown), never a revocation verdict and never Premium", async () => {
      getUserBearer.mockResolvedValue(user);
      checkActiveSession.mockResolvedValue("error");
      const res = await GET(req({ authorization: "Bearer a.b.c" }));
      expect(res.status).toBe(503);
      expect((await res.json()).error.code).toBe("session_check_unavailable");
      expect(fromCalls).toHaveLength(0);
    });

    it("a verified token without a usable session id is refused", async () => {
      getUserBearer.mockResolvedValue(user);
      sessionIdOf.mockResolvedValue(null);
      expect((await GET(req({ authorization: "Bearer a.b.c" }))).status).toBe(401);
      expect(checkActiveSession).not.toHaveBeenCalled();
    });

    it("the active session still gets its entitlement (trial, paid and gifted rows resolve as before)", async () => {
      getUserBearer.mockResolvedValue(user);
      rows = {
        trials: [{ status: "active", started_at: "2026-01-01T00:00:00Z", expires_at: "2099-01-01T00:00:00Z" }],
        subscriptions: [{ plan: "PRO_LIFETIME", status: "active", current_period_end: null, provider: "nowpayments" }],
      };
      const res = await GET(req({ authorization: "Bearer a.b.c" }));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ plan: "PRO_LIFETIME", isPremium: true });
    });

    it("cookie sessions are checked as 'web' and bearer sessions as 'extension'", async () => {
      getUserCookie.mockResolvedValue(user);
      await GET(req());
      expect(checkActiveSession).toHaveBeenLastCalledWith("u-1", SID, "web");
      getUserBearer.mockResolvedValue(user);
      await GET(req({ authorization: "Bearer a.b.c" }));
      expect(checkActiveSession).toHaveBeenLastCalledWith("u-1", SID, "extension");
    });
  });
});

describe("X account fields (permanent bindings and slots)", () => {
  const user = { data: { user: { id: "u1" } }, error: null };

  it("adds the documented fields next to the unchanged entitlement fields", async () => {
    getUserBearer.mockResolvedValue(user);
    rows.x_account_bindings = [
      { username: "MainAcct", normalized_username: "mainacct", confirmed_at: "2026-10-16T00:00:00Z", created_at: "2026-10-16T00:00:00Z" },
      { username: "alt_one", normalized_username: "alt_one", confirmed_at: "2026-10-16T01:00:00Z", created_at: "2026-10-16T01:00:00Z" },
    ];
    rows.account_slot_grants = [{ slots: 1, status: "active", created_at: "2026-10-16T00:00:00Z" }];
    const body = await (await GET(req({ authorization: "Bearer a.b.c" }))).json();
    expect(body).toMatchObject({ plan: "FREE", isPremium: false, expiresAt: null, source: "none", paymentWarning: null });
    expect(body.trial).toBeDefined();
    expect(body.checkedAt).toEqual(expect.any(String));
    expect(body.linkedXAccounts).toEqual([
      { username: "MainAcct", normalizedUsername: "mainacct" },
      { username: "alt_one", normalizedUsername: "alt_one" },
    ]);
    expect(body).toMatchObject({ baseAccountSlots: 2, purchasedExtraSlots: 1, allowedAccountSlots: 3, usedAccountSlots: 2, availableAccountSlots: 1 });
    expect(fromCalls.filter((c) => c.table.startsWith("x_account") || c.table === "account_slot_grants").every((c) => c.userId === "u1")).toBe(true);
  });

  it("a new account has 2 free slots and nothing linked", async () => {
    getUserBearer.mockResolvedValue(user);
    const body = await (await GET(req({ authorization: "Bearer a.b.c" }))).json();
    expect(body).toMatchObject({ linkedXAccounts: [], baseAccountSlots: 2, purchasedExtraSlots: 0, allowedAccountSlots: 2, usedAccountSlots: 0, availableAccountSlots: 2 });
  });

  it("if X accounts cannot be read, the plan is still returned and the X fields are null (unknown, never granted)", async () => {
    getUserBearer.mockResolvedValue(user);
    errorTables = ["x_account_bindings"];
    const res = await GET(req({ authorization: "Bearer a.b.c" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBe("FREE");
    expect(body).toMatchObject({ linkedXAccounts: null, baseAccountSlots: null, purchasedExtraSlots: null, allowedAccountSlots: null, usedAccountSlots: null, availableAccountSlots: null });
  });

  it("available slots never go negative after a refunded slot", async () => {
    getUserBearer.mockResolvedValue(user);
    rows.x_account_bindings = ["a1", "a2", "a3"].map((n) => ({ username: n, normalized_username: n, confirmed_at: "2026-10-16T00:00:00Z", created_at: "2026-10-16T00:00:00Z" }));
    rows.account_slot_grants = [];
    const body = await (await GET(req({ authorization: "Bearer a.b.c" }))).json();
    expect(body).toMatchObject({ allowedAccountSlots: 2, usedAccountSlots: 3, availableAccountSlots: 0 });
  });
});

describe("gifts in the entitlement API", () => {
  it("a valid admin gift is recognized (PRO_GIFT, isPremium) and failing gift reads never block the plan", async () => {
    getUserBearer.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    rows.premium_gifts = [{ status: "active", starts_at: new Date(Date.now() - 1000).toISOString(), expires_at: null }];
    const body = await (await GET(req({ authorization: "Bearer a.b.c" }))).json();
    expect(body).toMatchObject({ plan: "PRO_GIFT", isPremium: true, source: "gift", gift: { lifetime: true, expiresAt: null } });
    errorTables = ["premium_gifts"];
    const res = await GET(req({ authorization: "Bearer a.b.c" }));
    expect(res.status).toBe(200);
    expect((await res.json()).plan).toBe("FREE");
  });
});
