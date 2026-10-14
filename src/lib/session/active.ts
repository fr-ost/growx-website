import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodeJwtClaims } from "./claims";

/**
 * Single active login per account (server side).
 *
 *  - "web": cookie sessions of the website.   - "extension": Bearer-token sessions of the Chrome extension.
 * By default a user has one active web session and one active extension session, so using the website never
 * logs out the extension. SINGLE_SESSION_SCOPE=account makes it ONE session across everything.
 *
 * The decision lives in Postgres (see supabase/migrations/*_active_sessions.sql). A Supabase access token stays
 * cryptographically valid until it expires even after its session is revoked, so every protected request
 * compares the token's session_id with the recorded active session.
 */
export type SessionClient = "web" | "extension";
/** active: valid. revoked: definitively replaced/ended. error: could not be determined (never treat as either). */
export type SessionStatus = "active" | "revoked" | "error";

export const strictSessions = (env: Record<string, string | undefined> = process.env) => env.SINGLE_SESSION_SCOPE === "account";

const admin = (): SupabaseClient | null => (isSupabaseConfigured() && getSupabaseServiceKey() ? createAdminClient() : null);

export async function checkActiveSession(userId: string, sessionId: string, client: SessionClient): Promise<SessionStatus> {
  const db = admin();
  if (!db) return "error";
  try {
    const { data, error } = await db.rpc("check_active_session", { p_user: userId, p_session: sessionId, p_client: client, p_strict: strictSessions() });
    if (error) return "error";
    return data === "active" ? "active" : data === "revoked" ? "revoked" : "error";
  } catch {
    return "error";
  }
}

export type RegisterResult = { status: "active"; revoked: number } | { status: "session_not_found" } | { status: "error" };

/** Makes this session the active one and revokes the previous one. Call ONLY right after a successful authentication. */
export async function registerActiveSession(userId: string, sessionId: string, client: SessionClient): Promise<RegisterResult> {
  const db = admin();
  if (!db) return { status: "error" };
  try {
    const { data, error } = await db.rpc("register_active_session", { p_user: userId, p_session: sessionId, p_client: client, p_strict: strictSessions() });
    if (error) return { status: "error" };
    const r = data as { status?: string; revoked?: number } | null;
    if (r?.status === "active") return { status: "active", revoked: Number(r.revoked ?? 0) };
    if (r?.status === "session_not_found") return { status: "session_not_found" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export async function releaseActiveSession(userId: string, sessionId: string): Promise<boolean> {
  const db = admin();
  if (!db) return false;
  try {
    const { error } = await db.rpc("release_active_session", { p_user: userId, p_session: sessionId });
    return !error;
  } catch {
    return false;
  }
}

/**
 * The session id of an ALREADY VERIFIED request. Bearer: from the token Supabase Auth just verified
 * (the subject must match). Cookie: from the verified claims of the SSR client.
 */
export async function verifiedSessionId(
  supabase: Pick<SupabaseClient, "auth">,
  userId: string,
  bearer: string | null,
): Promise<string | null> {
  if (bearer) {
    const c = decodeJwtClaims(bearer);
    return c?.sub === userId && c.session_id ? c.session_id : null;
  }
  try {
    const { data } = await supabase.auth.getClaims();
    const c = data?.claims as { sub?: string; session_id?: string } | undefined;
    return c?.sub === userId && c.session_id ? c.session_id : null;
  } catch {
    return null;
  }
}
