import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { apiError, bearerToken, corsHeaders, json } from "@/lib/api/http";
import { isSameOrigin } from "@/lib/api/guards";
import { getSupabasePublicConfig } from "@/lib/env";
import { checkActiveSession, registerActiveSession, releaseActiveSession, verifiedSessionId, type SessionClient } from "@/lib/session/active";
import { createClient as createCookieClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export function OPTIONS(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: Object.keys(headers).length ? 204 : 403, headers });
}

type Resolved =
  | { ok: true; userId: string; sessionId: string; client: SessionClient; supabase: SupabaseClient; bearer: string | null }
  | { ok: false; response: NextResponse };

/** Verifies the caller (Supabase Auth) and extracts the session id of the VERIFIED token. Never trusts the body. */
async function resolve(request: NextRequest, mutating: boolean): Promise<Resolved> {
  const origin = request.headers.get("origin");
  const cfg = getSupabasePublicConfig();
  if (!cfg) return { ok: false, response: apiError(503, "not_configured", "Service is not configured.", origin) };
  const bearer = bearerToken(request.headers.get("authorization"));
  // Cookie-authenticated browser calls must come from our own origin; bearer calls are not ambient-credential based.
  if (!bearer && mutating && !isSameOrigin(request)) return { ok: false, response: apiError(403, "bad_origin", "Cross-site request refused.", origin) };

  const supabase = bearer
    ? createSupabaseClient(cfg.url, cfg.key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${bearer}` } } })
    : await createCookieClient();
  const { data, error } = bearer ? await supabase.auth.getUser(bearer) : await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, response: apiError(401, "unauthenticated", "Sign in required.", origin) };
  const sessionId = await verifiedSessionId(supabase, data.user.id, bearer);
  if (!sessionId) return { ok: false, response: apiError(401, "unauthenticated", "Sign in required.", origin) };
  return { ok: true, userId: data.user.id, sessionId, client: bearer ? "extension" : "web", supabase, bearer };
}

/** GET /api/session: is this session still the account's active one? 401 session_revoked is DEFINITIVE; 503 is "unknown". */
export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const r = await resolve(request, false);
  if (!r.ok) return r.response;
  const status = await checkActiveSession(r.userId, r.sessionId, r.client);
  if (status === "revoked") return apiError(401, "session_revoked", "This session was ended because the account signed in elsewhere.", origin);
  if (status === "error") return apiError(503, "session_check_unavailable", "Could not verify the session. Try again.", origin);
  return json({ active: true, client: r.client }, { origin });
}

/**
 * POST /api/session: register this session as the active one. The extension calls this ONCE, right after it
 * authenticated (a new login). The previous session of the same kind is revoked. A session that was already
 * revoked does not exist any more and can never register again.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const r = await resolve(request, true);
  if (!r.ok) return r.response;
  const res = await registerActiveSession(r.userId, r.sessionId, r.client);
  if (res.status === "active") return json({ active: true, client: r.client, revokedSessions: res.revoked }, { origin });
  if (res.status === "session_not_found") return apiError(401, "session_revoked", "This session no longer exists. Sign in again.", origin);
  return apiError(503, "session_check_unavailable", "Could not register the session. Try again.", origin);
}

/** DELETE /api/session: explicit logout. Revokes THIS session (and its refresh tokens), nothing else. */
export async function DELETE(request: NextRequest) {
  const origin = request.headers.get("origin");
  const r = await resolve(request, true);
  if (!r.ok) return r.response;
  // ?stale=1 (login page after "signed in elsewhere"): clear this browser's cookies ONLY IF the server confirms
  // the session is revoked, so a crafted link can never log out someone whose session is still active.
  if (request.nextUrl.searchParams.get("stale") === "1") {
    if (r.bearer || (await checkActiveSession(r.userId, r.sessionId, r.client)) !== "revoked") return json({ cleared: false }, { origin });
    await r.supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return json({ cleared: true }, { origin });
  }
  const ok = await releaseActiveSession(r.userId, r.sessionId);
  if (!r.bearer) await r.supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  return json({ loggedOut: true, released: ok }, { origin });
}
