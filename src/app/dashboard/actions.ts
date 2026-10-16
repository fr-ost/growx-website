"use server";

import { revalidatePath } from "next/cache";
import { startTrial } from "@/lib/trial/start";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { logDbIssue, toDbIssue } from "@/lib/db/errors";

export interface FormState {
  ok?: boolean;
  message?: string;
}

const TRIAL_MESSAGES = {
  email_not_verified: "Confirm your email address before starting a trial.",
  x_username_required: "Link your X account first.",
  already_used: "Your account has already used its free trial.",
  username_already_used: "A trial has already been used with this X account.",
  error: "We could not start the trial. Please try again later.",
} as const;

/**
 * Starts the one-time trial. The trial is tied to the account's FIRST permanently linked X account
 * (there is no editable username any more). The user id comes from the verified session only.
 */
export async function startTrialAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please sign in again." };
  if (!user.email_confirmed_at) return { message: TRIAL_MESSAGES.email_not_verified };

  // User-scoped read (RLS): the caller's own oldest active binding.
  const supabase = await createClient();
  const first = await supabase.from("x_account_bindings").select("username").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (first.error) {
    const issue = toDbIssue("x_account_bindings", first.error);
    logDbIssue(issue, first.error);
    return { message: `${TRIAL_MESSAGES.error} (reference: x_account_bindings/${issue.kind})` };
  }
  const username = (first.data as { username?: string } | null)?.username;
  if (!username) return { message: TRIAL_MESSAGES.x_username_required };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    // Most likely SUPABASE_SERVICE_ROLE_KEY is not set in this deployment.
    console.error(JSON.stringify({ event: "start_trial_unavailable", message: e instanceof Error ? e.message.slice(0, 120) : "unknown" }));
    return { message: `${TRIAL_MESSAGES.error} (reference: start_trial/not_configured)` };
  }

  // public.start_trial reads the trial username from x_profiles: set it to the linked account, but only
  // while this account has never had a trial (a used trial and its history are never touched).
  const existing = await admin.from("trials").select("user_id").eq("user_id", user.id).limit(1);
  if (existing.error) return { message: `${TRIAL_MESSAGES.error} (reference: trials/${toDbIssue("trials", existing.error).kind})` };
  if (!existing.data?.length) {
    const sync = await admin.from("x_profiles").upsert({ user_id: user.id, x_username: username }, { onConflict: "user_id" });
    if (sync.error) {
      const issue = toDbIssue("x_profiles.sync", sync.error);
      logDbIssue(issue, sync.error);
      return { message: `${TRIAL_MESSAGES.error} (reference: x_profiles/${issue.kind})` };
    }
  }

  const result = await startTrial(admin, { id: user.id, emailConfirmed: true });
  if (!result.ok) return { message: TRIAL_MESSAGES[result.reason] + (result.detail ? ` (reference: start_trial/${result.detail})` : "") };

  revalidatePath("/dashboard");
  return { ok: true, message: "Your 30-day Premium trial has started." };
}
