import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decodeJwtClaims } from "@/lib/session/claims";

const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));

const { checkActiveSession, registerActiveSession, releaseActiveSession, verifiedSessionId, strictSessions } = await import("@/lib/session/active");
const { registerWebSession, endWebSession } = await import("@/lib/session/web");

const SID = "55555555-5555-4555-8555-555555555555";
const jwt = (claims: Record<string, unknown>) => `h.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.s`;

beforeEach(() => {
  rpc.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret";
  delete process.env.SINGLE_SESSION_SCOPE;
});

describe("token claims", () => {
  it("reads sub / session_id / exp; ignores malformed input", () => {
    expect(decodeJwtClaims(jwt({ sub: "u", session_id: SID, exp: 5 }))).toEqual({ sub: "u", session_id: SID, exp: 5 });
    expect(decodeJwtClaims(jwt({ sub: "u", session_id: "not-a-uuid" }))?.session_id).toBeUndefined();
    for (const bad of ["", "a.b", "a.%%%.c", jwt({}).replace(/\.[^.]*\./, ".bm90LWpzb24.")]) expect(decodeJwtClaims(bad)?.session_id).toBeUndefined();
  });
  it("verifiedSessionId: bearer token subject must match the verified user", async () => {
    const sb = { auth: {} } as never;
    expect(await verifiedSessionId(sb, "u", jwt({ sub: "u", session_id: SID }))).toBe(SID);
    expect(await verifiedSessionId(sb, "someone-else", jwt({ sub: "u", session_id: SID }))).toBeNull();
    expect(await verifiedSessionId(sb, "u", jwt({ sub: "u" }))).toBeNull();
  });
  it("verifiedSessionId: cookie sessions use the verified claims", async () => {
    const sb = { auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: "u", session_id: SID } } }) } } as never;
    expect(await verifiedSessionId(sb, "u", null)).toBe(SID);
    const other = { auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { sub: "x", session_id: SID } } }) } } as never;
    expect(await verifiedSessionId(other, "u", null)).toBeNull();
    const boom = { auth: { getClaims: vi.fn().mockRejectedValue(new Error("x")) } } as never;
    expect(await verifiedSessionId(boom, "u", null)).toBeNull();
  });
});

describe("server session helpers fail safe", () => {
  it("map database answers to active / revoked / error; errors and exceptions are 'error', never 'active'", async () => {
    rpc.mockResolvedValueOnce({ data: "active", error: null });
    expect(await checkActiveSession("u", SID, "web")).toBe("active");
    expect(rpc).toHaveBeenLastCalledWith("check_active_session", { p_user: "u", p_session: SID, p_client: "web", p_strict: false });
    rpc.mockResolvedValueOnce({ data: "revoked", error: null });
    expect(await checkActiveSession("u", SID, "web")).toBe("revoked");
    rpc.mockResolvedValueOnce({ data: null, error: { code: "42883" } });
    expect(await checkActiveSession("u", SID, "web")).toBe("error");
    rpc.mockResolvedValueOnce({ data: "weird", error: null });
    expect(await checkActiveSession("u", SID, "web")).toBe("error");
    rpc.mockRejectedValueOnce(new Error("network"));
    expect(await checkActiveSession("u", SID, "web")).toBe("error");
  });
  it("without the service key nothing can be verified (error), so protected requests fail closed", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
    expect(await checkActiveSession("u", SID, "web")).toBe("error");
    expect(await registerActiveSession("u", SID, "web")).toEqual({ status: "error" });
    expect(await releaseActiveSession("u", SID)).toBe(false);
  });
  it("SINGLE_SESSION_SCOPE=account switches every call to strict mode", async () => {
    process.env.SINGLE_SESSION_SCOPE = "account";
    expect(strictSessions()).toBe(true);
    rpc.mockResolvedValue({ data: { status: "active", revoked: 2 }, error: null });
    expect(await registerActiveSession("u", SID, "extension")).toEqual({ status: "active", revoked: 2 });
    expect(rpc).toHaveBeenLastCalledWith("register_active_session", { p_user: "u", p_session: SID, p_client: "extension", p_strict: true });
  });
});

const sbWith = (user: unknown, claims: unknown) =>
  ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      getClaims: vi.fn().mockResolvedValue({ data: { claims } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }) as unknown as SupabaseClient & { auth: { signOut: ReturnType<typeof vi.fn> } };

describe("website login registration", () => {
  it("registers the freshly authenticated web session", async () => {
    rpc.mockResolvedValue({ data: { status: "active", revoked: 1 }, error: null });
    expect(await registerWebSession(sbWith({ id: "u" }, { sub: "u", session_id: SID }))).toBe(true);
    expect(rpc).toHaveBeenCalledWith("register_active_session", { p_user: "u", p_session: SID, p_client: "web", p_strict: false });
  });
  it("is false (login must not stay signed in) when there is no user, no session id, or registration fails", async () => {
    expect(await registerWebSession(sbWith(null, null))).toBe(false);
    expect(await registerWebSession(sbWith({ id: "u" }, { sub: "u" }))).toBe(false);
    rpc.mockResolvedValue({ data: { status: "session_not_found" }, error: null });
    expect(await registerWebSession(sbWith({ id: "u" }, { sub: "u", session_id: SID }))).toBe(false);
    rpc.mockResolvedValue({ data: null, error: { code: "x" } });
    expect(await registerWebSession(sbWith({ id: "u" }, { sub: "u", session_id: SID }))).toBe(false);
  });
  it("explicit logout releases this session and signs out with LOCAL scope (the extension session is not killed)", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    const sb = sbWith({ id: "u" }, { sub: "u", session_id: SID });
    await endWebSession(sb);
    expect(rpc).toHaveBeenCalledWith("release_active_session", { p_user: "u", p_session: SID });
    expect(sb.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
