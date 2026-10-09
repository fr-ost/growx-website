import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, getSupabaseServiceKey } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS: use ONLY in server code, ONLY with a
 * user id taken from a verified session, and ONLY for operations users must
 * not perform themselves (e.g. starting a trial).
 */
export function createAdminClient(): SupabaseClient {
  const url = getSupabasePublicConfig()?.url;
  const key = getSupabaseServiceKey();
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
