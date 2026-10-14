import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { checkActiveSession, verifiedSessionId, type SessionStatus } from "@/lib/session/active";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { user: User; status: "active" }
  /** Signed in with a valid token, but another login replaced this session (or it no longer exists). */
  | { user: null; status: "revoked" }
  /** The active-session check itself failed: unknown, so neither signed in nor "replaced". */
  | { user: null; status: "error" }
  | { user: null; status: "signed_out" };

/**
 * Verified current user AND proof that this is still the account's active web session.
 * auth.getUser() validates the JWT with the Supabase Auth server; the active-session check closes the gap
 * that a revoked session's access token stays valid until it expires. Never use getSession() for authorisation.
 */
export const getAuthState = cache(async (): Promise<AuthState> => {
  if (!isSupabaseConfigured()) return { user: null, status: "signed_out" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { user: null, status: "signed_out" };
  const sessionId = await verifiedSessionId(supabase, data.user.id, null);
  if (!sessionId) return { user: null, status: "error" };
  const status: SessionStatus = await checkActiveSession(data.user.id, sessionId, "web");
  return status === "active" ? { user: data.user, status: "active" } : { user: null, status };
});

export const getCurrentUser = cache(async (): Promise<User | null> => (await getAuthState()).user);
