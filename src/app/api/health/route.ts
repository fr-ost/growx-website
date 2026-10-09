import { NextResponse } from "next/server";
import { getSupabasePublicConfig, getSupabaseServiceKey } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Check = "ok" | "failed" | "not_configured";

/**
 * GET /api/health - deployment self-check. Returns only coarse pass/fail flags
 * (never values, keys or user data) so it is safe to leave public.
 *  - auth:     Supabase Auth reachable with the publishable key
 *  - database: service role key valid AND migrations applied (calls a
 *              service-role-only function from the billing migration)
 */
export async function GET() {
  const cfg = getSupabasePublicConfig();
  let auth: Check = "not_configured";
  let database: Check = "not_configured";

  if (cfg) {
    try {
      const r = await fetch(`${cfg.url}/auth/v1/health`, { headers: { apikey: cfg.key }, signal: AbortSignal.timeout(5000) });
      auth = r.ok ? "ok" : "failed";
    } catch {
      auth = "failed";
    }
  }
  if (cfg && getSupabaseServiceKey()) {
    try {
      const { error } = await createAdminClient().rpc("early_adopter_available");
      database = error ? "failed" : "ok";
    } catch {
      database = "failed";
    }
  }

  const ok = auth === "ok" && database === "ok";
  return NextResponse.json({ ok, auth, database }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
