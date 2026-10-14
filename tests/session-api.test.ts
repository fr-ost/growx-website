import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUserBearer = vi.fn();
const getUserCookie = vi.fn();
const signOutCookie = vi.fn(async () => ({ error: null }));
const check = vi.fn();
const register = vi.fn();
const release = vi.fn();
const sessionIdOf = vi.fn();

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ auth: { getUser: getUserBearer } })) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ auth: { getUser: getUserCookie, signOut: signOutCookie } })) }));
vi.mock("@/lib/session/active", () => ({
  checkActiveSession: (...a: unknown[]) => check(...a),
  registerActiveSession: (...a: unknown[]) => register(...a),
  releaseActiveSession: (...a: unknown[]) => release(...a),
  verifiedSessionId: (...a: unknown[]) => sessionIdOf(...a),
}));

const { GET, POST, DELETE, OPTIONS } = await import("@/app/api/session/route");

const EXT = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
const SID = "55555555-5555-4555-8555-555555555555";
const USER = { data: { user: { id: "u-1" } }, error: null };
const req = (method: string, headers: Record<string, string> = {}) => new NextRequest("https://www.growxapp.org/api/session", { method, headers });
const bearer = { authorization: "Bearer a.b.c", origin: EXT };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.ALLOWED_EXTENSION_ORIGINS = EXT;
  getUserBearer.mockResolvedValue(USER);
  getUserCookie.mockResolvedValue(USER);
  check.mockResolvedValue("active");
  register.mockResolvedValue({ status: "active", revoked: 1 });
  release.mockResolvedValue(true);
  sessionIdOf.mockResolvedValue(SID);
});

describe("GET /api/session (validation)", () => {
  it("200 for the active session, with CORS only for the allowlisted extension", async () => {
    const res = await GET(req("GET", bearer));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ active: true, client: "extension" });
    expect(check).toHaveBeenCalledWith("u-1", SID, "extension");
    expect(res.headers.get("access-control-allow-origin")).toBe(EXT);
    expect((await GET(req("GET", { ...bearer, origin: "chrome-extension://evil" }))).headers.get("access-control-allow-origin")).toBeNull();
  });
  it("401 session_revoked is definitive; 503 is 'unknown'; bad tokens are plain 401 unauthenticated", async () => {
    check.mockResolvedValue("revoked");
    const revoked = await GET(req("GET", bearer));
    expect([revoked.status, (await revoked.json()).error.code]).toEqual([401, "session_revoked"]);
    check.mockResolvedValue("error");
    const unknown = await GET(req("GET", bearer));
    expect([unknown.status, (await unknown.json()).error.code]).toEqual([503, "session_check_unavailable"]);
    getUserBearer.mockResolvedValue({ data: { user: null }, error: { message: "bad jwt" } });
    const bad = await GET(req("GET", bearer));
    expect([bad.status, (await bad.json()).error.code]).toEqual([401, "unauthenticated"]);
  });
  it("cookie callers are the 'web' client; a token without a session id is refused", async () => {
    expect((await (await GET(req("GET"))).json()).client).toBe("web");
    expect(check).toHaveBeenLastCalledWith("u-1", SID, "web");
    sessionIdOf.mockResolvedValue(null);
    expect((await GET(req("GET", bearer))).status).toBe(401);
  });
  it("never accepts a user or session id from the request", async () => {
    await GET(new NextRequest("https://www.growxapp.org/api/session?user_id=victim&session_id=x", { headers: bearer }));
    expect(check).toHaveBeenCalledWith("u-1", SID, "extension");
  });
});

describe("POST /api/session (register after login)", () => {
  it("registers the verified session of the verified user and reports revoked sessions", async () => {
    const res = await POST(req("POST", bearer));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ active: true, client: "extension", revokedSessions: 1 });
    expect(register).toHaveBeenCalledWith("u-1", SID, "extension");
  });
  it("a session that no longer exists can never register: 401 session_revoked", async () => {
    register.mockResolvedValue({ status: "session_not_found" });
    const res = await POST(req("POST", bearer));
    expect([res.status, (await res.json()).error.code]).toEqual([401, "session_revoked"]);
  });
  it("a failing registration is 503, not success", async () => {
    register.mockResolvedValue({ status: "error" });
    expect((await POST(req("POST", bearer))).status).toBe(503);
  });
  it("cookie callers must be same-origin (CSRF); bearer callers are not cookie-based", async () => {
    expect((await POST(req("POST", { origin: "https://evil.example", host: "www.growxapp.org" }))).status).toBe(403);
    expect((await POST(req("POST", { origin: "https://www.growxapp.org", host: "www.growxapp.org" }))).status).toBe(200);
    expect(register).toHaveBeenLastCalledWith("u-1", SID, "web");
  });
});

describe("DELETE /api/session (explicit logout)", () => {
  it("releases only the caller's own session", async () => {
    const res = await DELETE(req("DELETE", bearer));
    expect(res.status).toBe(200);
    expect(release).toHaveBeenCalledWith("u-1", SID);
  });
  it("cookie logout also clears this browser (local scope) and needs the same origin", async () => {
    expect((await DELETE(req("DELETE", { origin: "https://evil.example", host: "www.growxapp.org" }))).status).toBe(403);
    expect(release).not.toHaveBeenCalled();
    await DELETE(req("DELETE", { origin: "https://www.growxapp.org", host: "www.growxapp.org" }));
    expect(signOutCookie).toHaveBeenCalledWith({ scope: "local" });
  });
});

describe("DELETE /api/session?stale=1 (login page cleanup)", () => {
  const sameOrigin = { origin: "https://www.growxapp.org", host: "www.growxapp.org" };
  const stale = () => new NextRequest("https://www.growxapp.org/api/session?stale=1", { method: "DELETE", headers: sameOrigin });
  it("clears this browser's cookies only when the session is confirmed revoked", async () => {
    check.mockResolvedValue("revoked");
    expect(await (await DELETE(stale())).json()).toEqual({ cleared: true });
    expect(signOutCookie).toHaveBeenCalledWith({ scope: "local" });
    expect(release).not.toHaveBeenCalled();
  });
  it("a crafted link cannot log out a session that is still active (or unknown)", async () => {
    for (const status of ["active", "error"]) {
      check.mockResolvedValue(status);
      signOutCookie.mockClear();
      expect(await (await DELETE(stale())).json()).toEqual({ cleared: false });
      expect(signOutCookie).not.toHaveBeenCalled();
    }
    expect(release).not.toHaveBeenCalled();
  });
});

it("OPTIONS is allowed only for allowlisted extension origins", () => {
  expect(OPTIONS(req("OPTIONS", { origin: EXT })).status).toBe(204);
  expect(OPTIONS(req("OPTIONS", { origin: "https://evil.example" })).status).toBe(403);
});
