import type { SupabaseClient } from "@supabase/supabase-js";
import { getGracePolicy } from "@/lib/billing/grace";
import { resolveEntitlement } from "./resolve";
import type { Entitlement, SubscriptionRecord, TrialRecord } from "./types";

export class EntitlementLoadError extends Error {}

/**
 * Loads a user's entitlement through a USER-scoped client, so Row Level
 * Security guarantees only that user's rows can be read. The explicit user_id
 * filter is belt-and-braces. A missing profile or no rows resolves to FREE;
 * a database error throws (never silently granting or denying Premium).
 */
export async function loadEntitlement(supabase: SupabaseClient, userId: string, now = new Date()): Promise<Entitlement> {
  const [trials, subs] = await Promise.all([
    supabase.from("trials").select("status, started_at, expires_at").eq("user_id", userId),
    supabase.from("subscriptions").select("plan, status, current_period_end, provider, past_due_since").eq("user_id", userId),
  ]);
  if (trials.error || subs.error) throw new EntitlementLoadError("entitlement query failed");
  return resolveEntitlement(
    { trials: (trials.data ?? []) as TrialRecord[], subscriptions: (subs.data ?? []) as SubscriptionRecord[] },
    now,
    getGracePolicy(),
  );
}
