import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUserBearer = vi.fn();
const getUserCookie = vi.fn();
const fromCalls: Array<{ table: string; userId?: unknown }> = [];
let dbError = false;
let rows: Record<string, unknown[]> = { trials: [], subscriptions: [] };

const makeFrom = () => (table: string) => ({
  select: () => ({
    eq: (_col: string, val: unknown) => {
      fromCalls.push({ table, userId: val });
      return Promise.resolve(dbError ? { data: null, error: { message: "x" } } : { data: rows[table], error: null });
    },
  }),
});

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
  rows = { trials: [], subscriptions: [] };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.ALLOWED_EXTENSION_ORIGINS = EXT;
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
});
