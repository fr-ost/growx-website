import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const rpc = vi.fn();
const tableResult = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    rpc,
    from: (table: string) => ({ select: () => ({ limit: () => tableResult(table) }) }),
  }),
}));
const { GET } = await import("@/app/api/health/route");
const req = () => new NextRequest("https://www.growxapp.org/api/health");

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pk";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sr-secret-value";
  rpc.mockReset();
  tableResult.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

const healthyRpc = (name: string) =>
  Promise.resolve(name === "start_trial" ? { data: null, error: { code: "P0001", message: "x_username_required" } } : { data: true, error: null });

describe("GET /api/health", () => {
  it("200 when auth, every table and every function are present; leaks no secrets", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    tableResult.mockResolvedValue({ data: [], error: null });
    rpc.mockImplementation(healthyRpc);
    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, auth: "ok", database: "ok" });
    expect(Object.values(body.tables).every((s) => s === "ok")).toBe(true);
    expect(body.functions).toEqual({ early_adopter_available: "ok", start_trial: "ok" });
    expect(JSON.stringify(body)).not.toContain("sr-secret-value");
  });

  it("names missing tables/columns and explains the fix", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    tableResult.mockImplementation((t: string) =>
      Promise.resolve(
        t === "payments"
          ? { data: null, error: { code: "PGRST205", message: "Could not find the table 'public.payments' in the schema cache" } }
          : t === "subscriptions"
            ? { data: null, error: { code: "42703", message: "column subscriptions.past_due_since does not exist" } }
            : { data: [], error: null },
      ),
    );
    rpc.mockImplementation(healthyRpc);
    const res = await GET(req());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.tables.payments).toBe("table_missing");
    expect(body.tables.subscriptions).toBe("column_missing");
    expect(body.tables.trials).toBe("ok");
    expect(body.warnings.join(" ")).toMatch(/Migrations are missing/);
  });

  it("reports missing functions and an unreachable auth server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    tableResult.mockResolvedValue({ data: [], error: null });
    rpc.mockResolvedValue({ data: null, error: { code: "PGRST202", message: "Could not find the function public.start_trial" } });
    const body = await (await GET(req())).json();
    expect(body).toMatchObject({ ok: false, auth: "failed", database: "failed" });
    expect(body.functions.start_trial).toBe("function_missing");
  });

  it("reports not_configured without env", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const body = await (await GET(req())).json();
    expect(body).toMatchObject({ ok: false, auth: "not_configured", database: "not_configured" });
    expect(body.warnings.length).toBeGreaterThan(0);
  });
});
