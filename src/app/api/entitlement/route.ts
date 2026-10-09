import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiError, bearerToken, corsHeaders, json } from "@/lib/api/http";
import { EntitlementLoadError, loadEntitlement } from "@/lib/entitlement/load";
import { getSupabasePublicConfig } from "@/lib/env";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export function OPTIONS(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: Object.keys(headers).length ? 204 : 403, headers });
}

/**
 * GET /api/entitlement
 * Returns the AUTHENTICATED caller's effective plan. The user is always taken
 * from a verified token/session; there is no user id parameter, so one user
 * cannot ask about another. Auth: `Authorization: Bearer <Supabase access
 * token>` (extension) or the website session cookie (browser).
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const cfg = getSupabasePublicConfig();
  if (!cfg) return apiError(503, "not_configured", "Service is not configured.", origin);

  try {
    const token = bearerToken(request.headers.get("authorization"));
    const supabase = token
      ? createSupabaseClient(cfg.url, cfg.key, {
          auth: { persistSession: false, autoRefreshToken: false },
          // RLS runs as the token's user: only that user's rows are visible.
          global: { headers: { Authorization: `Bearer ${token}` } },
        })
      : await createCookieClient();

    const { data, error } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    if (error || !data.user) return apiError(401, "unauthenticated", "Sign in required.", origin);

    const entitlement = await loadEntitlement(supabase, data.user.id);
    return json(entitlement, { origin });
  } catch (e) {
    // Never leak internals; never fall back to granting Premium. The cause is
    // logged server-side (without user data) by loadEntitlement.
    const reason = e instanceof EntitlementLoadError ? e.issues[0]?.kind : undefined;
    return apiError(503, "unavailable", `Entitlement could not be determined. Try again.${reason ? ` (${reason})` : ""}`, origin);
  }
}
