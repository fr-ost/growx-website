import type { SupabaseClient } from "@supabase/supabase-js";
import { getGracePolicy } from "@/lib/billing/grace";
import { logDbIssue, toDbIssue, type DbIssue } from "@/lib/db/errors";
import { COLUMNS } from "@/lib/db/queries";
import { resolveEntitlement } from "./resolve";
import type { Entitlement, SubscriptionRecord, TrialRecord } from "./types";

export class EntitlementLoadError extends Error {
  constructor(readonly issues: DbIssue[]) {
    super(`entitlement query failed: ${issues.map((i) => `${i.source}:${i.kind}`).join(", ")}`);
  }
}

/**
 * Loads a user's entitlement through a USER-scoped client, so Row Level
 * Security guarantees only that user's rows can be read. The explicit user_id
 * filter is belt-and-braces. No rows (new user, no profile yet) resolves to
 * FREE. A database error throws with a classified reason: it never silently
 * grants or denies Premium, and it is logged (without user data).
 */
export async function loadEntitlement(supabase: SupabaseClient, userId: string, now = new Date()): Promise<Entitlement> {
  const [trials, subs] = await Promise.all([
    supabase.from("trials").select(COLUMNS.trials).eq("user_id", userId),
    supabase.from("subscriptions").select(COLUMNS.subscriptions).eq("user_id", userId),
  ]);
  const issues: DbIssue[] = [];
  if (trials.error) issues.push(toDbIssue("trials", trials.error));
  if (subs.error) issues.push(toDbIssue("subscriptions", subs.error));
  if (issues.length) {
    issues.forEach((i) => logDbIssue(i, i.source === "trials" ? trials.error : subs.error));
    throw new EntitlementLoadError(issues);
  }
  return resolveEntitlement(
    { trials: (trials.data ?? []) as TrialRecord[], subscriptions: (subs.data ?? []) as SubscriptionRecord[] },
    now,
    getGracePolicy(),
  );
}

/** Non-throwing variant for pages: either the entitlement or the classified issues. */
export async function tryLoadEntitlement(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ entitlement: Entitlement; issues: [] } | { entitlement: null; issues: DbIssue[] }> {
  try {
    return { entitlement: await loadEntitlement(supabase, userId), issues: [] };
  } catch (e) {
    if (e instanceof EntitlementLoadError) return { entitlement: null, issues: e.issues };
    const issue: DbIssue = { kind: "unreachable", code: null, source: "entitlement" };
    logDbIssue(issue, { message: e instanceof Error ? e.message : "unknown" });
    return { entitlement: null, issues: [issue] };
  }
}
