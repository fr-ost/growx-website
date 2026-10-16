import "server-only";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { createClient as createSupabaseClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { apiError, bearerToken } from "@/lib/api/http";
import { isSameOrigin } from "@/lib/api/guards";
import { getSupabasePublicConfig } from "@/lib/env";
import { checkActiveSession, verifiedSessionId } from "@/lib/session/active";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export type Caller =
  | { ok: true; user: User; supabase: SupabaseClient; bearer: string | null; origin: string | null }
  | { ok: false; response: NextResponse };

/**
 * Verified caller for APIs used by BOTH the website (session cookie) and the extension
 * (`Authorization: Bearer <Supabase access token>`). The user is always taken from the verified token,
 * never from the request body. The returned client is USER-scoped (RLS applies). The session must be the
 * account's active one: 401 session_revoked is definitive, 503 means "could not verify".
 */
export async function requireCaller(request: NextRequest, opts: { mutating?: boolean } = {}): Promise<Caller> {
  const origin = request.headers.get("origin");
  const cfg = getSupabasePublicConfig();
  if (!cfg) return { ok: false, response: apiError(503, "not_configured", "Service is not configured.", origin) };
  const bearer = bearerToken(request.headers.get("authorization"));
  // Cookie-authenticated browser calls must come from our own origin; bearer calls carry no ambient credentials.
  if (!bearer && opts.mutating && !isSameOrigin(request)) return { ok: false, response: apiError(403, "bad_origin", "Cross-site request refused.", origin) };

  const supabase = bearer
    ? createSupabaseClient(cfg.url, cfg.key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${bearer}` } } })
    : await createCookieClient();
  const { data, error } = bearer ? await supabase.auth.getUser(bearer) : await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, response: apiError(401, "unauthenticated", "Sign in required.", origin) };

  const sessionId = await verifiedSessionId(supabase, data.user.id, bearer);
  if (!sessionId) return { ok: false, response: apiError(401, "unauthenticated", "Sign in required.", origin) };
  const session = await checkActiveSession(data.user.id, sessionId, bearer ? "extension" : "web");
  if (session === "revoked") return { ok: false, response: apiError(401, "session_revoked", "This session was ended because the account signed in elsewhere.", origin) };
  if (session === "error") return { ok: false, response: apiError(503, "session_check_unavailable", "Could not verify the session. Try again.", origin) };
  return { ok: true, user: data.user, supabase, bearer, origin };
}
