import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiError, bearerToken, corsHeaders, json } from "@/lib/api/http";
import { EntitlementLoadError, loadEntitlement } from "@/lib/entitlement/load";
import { getSupabasePublicConfig } from "@/lib/env";
import { checkActiveSession, verifiedSessionId } from "@/lib/session/active";
import { loadXAccounts, type XAccountSummary } from "@/lib/x-accounts";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * X account fields added to the entitlement response. null = could not be determined right now (the extension
 * must then treat X account permissions as unknown, never as granted). These list the usernames the account
 * has PERMANENTLY linked; they do not prove which X account is signed in on x.com.
 */
function xAccountFields(x: XAccountSummary | null) {
  return {
    linkedXAccounts: x ? x.linkedXAccounts.map((a) => ({ username: a.username, normalizedUsername: a.normalizedUsername })) : null,
    baseAccountSlots: x?.baseAccountSlots ?? null,
    purchasedExtraSlots: x?.purchasedExtraSlots ?? null,
    allowedAccountSlots: x?.allowedAccountSlots ?? null,
    usedAccountSlots: x?.usedAccountSlots ?? null,
    availableAccountSlots: x?.availableAccountSlots ?? null,
  };
}

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

    // A revoked session's access token is still a valid JWT until it expires: check the active session.
    // 401 session_revoked is definitive ("signed in elsewhere"); 503 means "could not verify" and is never a verdict.
    const sessionId = await verifiedSessionId(supabase, data.user.id, token);
    if (!sessionId) return apiError(401, "unauthenticated", "Sign in required.", origin);
    const session = await checkActiveSession(data.user.id, sessionId, token ? "extension" : "web");
    if (session === "revoked") return apiError(401, "session_revoked", "This session was ended because the account signed in elsewhere.", origin);
    if (session === "error") return apiError(503, "session_check_unavailable", "Could not verify the session. Try again.", origin);

    const [entitlement, xAccounts] = await Promise.all([
      loadEntitlement(supabase, data.user.id),
      // X accounts never block the plan answer: if they cannot be read, the fields are null ("unknown").
      loadXAccounts(supabase, data.user.id).catch(() => null),
    ]);
    return json({ ...entitlement, ...xAccountFields(xAccounts) }, { origin });
  } catch (e) {
    // Never leak internals; never fall back to granting Premium. The cause is
    // logged server-side (without user data) by loadEntitlement.
    const reason = e instanceof EntitlementLoadError ? e.issues[0]?.kind : undefined;
    return apiError(503, "unavailable", `Entitlement could not be determined. Try again.${reason ? ` (${reason})` : ""}`, origin);
  }
}
