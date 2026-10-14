import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let state: unknown;
vi.mock("@/lib/supabase/user", () => ({ getAuthState: async () => state, getCurrentUser: async () => (state as { user: unknown }).user }));
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: (u: string) => redirect(u) }));

const { requireApiUser } = await import("@/lib/api/guards");
const { requireUser } = await import("@/lib/supabase/require-user");

const USER = { id: "u", email_confirmed_at: "2026-01-01" };
const req = () => new NextRequest("https://www.growxapp.org/api/x");
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  redirect.mockClear();
});

describe("protected API routes (checkout, orders)", () => {
  it("active -> allowed; revoked -> 401 session_revoked; unknown -> 503; signed out -> 401", async () => {
    state = { user: USER, status: "active" };
    expect((await requireApiUser(req())).ok).toBe(true);
    for (const [s, status, code] of [["revoked", 401, "session_revoked"], ["error", 503, "session_check_unavailable"], ["signed_out", 401, "unauthenticated"]] as const) {
      state = { user: null, status: s };
      const r = await requireApiUser(req());
      expect(r.ok).toBe(false);
      if (!r.ok) expect([r.response.status, (await r.response.json()).error.code]).toEqual([status, code]);
    }
  });
});

describe("protected pages", () => {
  it("revoked -> the login page with the explanation; unknown -> error page; signed out -> login", async () => {
    state = { user: USER, status: "active" };
    expect(await requireUser("/account")).toBe(USER);
    state = { user: null, status: "revoked" };
    await expect(requireUser("/account")).rejects.toThrow("REDIRECT:/login?error=session_replaced&next=%2Faccount");
    state = { user: null, status: "error" };
    await expect(requireUser("/account")).rejects.toThrow("session_check_failed");
    state = { user: null, status: "signed_out" };
    await expect(requireUser("/account")).rejects.toThrow("REDIRECT:/login?next=%2Faccount");
  });
});
