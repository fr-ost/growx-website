import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { registerActiveSession, releaseActiveSession, verifiedSessionId } from "./active";

/**
 * Called right after the website authenticated a user (password, email link, OAuth). The new web session
 * becomes the active one and the previous web session is revoked. Returns false when it could not be
 * registered; callers must then end the session (a login that is not registered must not stay signed in).
 */
export async function registerWebSession(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;
  const sessionId = await verifiedSessionId(supabase, data.user.id, null);
  if (!sessionId) return false;
  return (await registerActiveSession(data.user.id, sessionId, "web")).status === "active";
}

/** Explicit logout of THIS browser: forget it as the active session and delete its Supabase session. */
export async function endWebSession(supabase: SupabaseClient): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const sessionId = await verifiedSessionId(supabase, data.user.id, null);
    if (sessionId) await releaseActiveSession(data.user.id, sessionId);
  }
  // local scope: sign out this browser only (global would also kill the extension's session)
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
}
