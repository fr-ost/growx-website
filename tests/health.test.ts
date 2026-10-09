import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));
const { GET } = await import("@/app/api/health/route");

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sr-secret-value";
});
afterEach(() => vi.unstubAllGlobals());

describe("GET /api/health", () => {
  it("200 when auth is reachable and the database function works; leaks no secrets", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    rpc.mockResolvedValue({ data: true, error: null });
    const res = await GET();
    expect(res.status).toBe(200);
    const text = JSON.stringify(await res.json());
    expect(text).toBe('{"ok":true,"auth":"ok","database":"ok"}');
    expect(text).not.toContain("sr-secret-value");
  });

  it("503 with failed flags when migrations are missing or auth is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    rpc.mockResolvedValue({ data: null, error: { message: "function does not exist" } });
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, auth: "failed", database: "failed" });
  });

  it("reports not_configured without env", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(await (await GET()).json()).toEqual({ ok: false, auth: "not_configured", database: "not_configured" });
  });
});
