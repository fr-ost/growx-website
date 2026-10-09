"use server";

import { revalidatePath } from "next/cache";
import { startTrial } from "@/lib/trial/start";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { logDbIssue, toDbIssue } from "@/lib/db/errors";
import { xUsernameSchema } from "@/lib/validation/xUsername";

export interface FormState {
  ok?: boolean;
  message?: string;
}

export async function saveXUsernameAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please sign in again." };

  const parsed = xUsernameSchema.safeParse(formData.get("x_username") ?? "");
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Invalid username." };

  // User-scoped client: RLS restricts this to the caller's own row. The user id
  // comes from the verified session, never from the form.
  const supabase = await createClient();
  const existing = await supabase.from("x_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (existing.error) {
    const issue = toDbIssue("x_profiles", existing.error);
    logDbIssue(issue, existing.error);
    return { message: `Could not save your username (${issue.kind}${issue.code ? ` ${issue.code}` : ""}). Please try again or contact support.` };
  }

  const write = () =>
    existing.data
      ? supabase.from("x_profiles").update({ x_username: parsed.data.username }).eq("user_id", user.id)
      : supabase.from("x_profiles").insert({ user_id: user.id, x_username: parsed.data.username });
  let res = await write();
  // 23503 = foreign key violation: this account has no profile row (it signed
  // up before the database trigger existed). Create the caller's OWN profile
  // via a narrow SECURITY DEFINER function, then retry once.
  if (res.error?.code === "23503") {
    const fix = await supabase.rpc("ensure_my_profile");
    if (fix.error) logDbIssue(toDbIssue("ensure_my_profile", fix.error), fix.error);
    else res = await write();
  }
  if (res.error) {
    const issue = toDbIssue("x_profiles.write", res.error);
    logDbIssue(issue, res.error);
    return { message: `Could not save your username (${issue.kind}${issue.code ? ` ${issue.code}` : ""}). Please try again or contact support.` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/account");
  return { ok: true, message: "Saved. This username is self-reported and is not verified." };
}

const TRIAL_MESSAGES = {
  email_not_verified: "Confirm your email address before starting a trial.",
  x_username_required: "Add your X username first.",
  already_used: "Your account has already used its free trial.",
  username_already_used: "A trial has already been used with this X username.",
  error: "We could not start the trial. Please try again later.",
} as const;

export async function startTrialAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please sign in again." };

  let result;
  try {
    result = await startTrial(createAdminClient(), { id: user.id, emailConfirmed: !!user.email_confirmed_at });
  } catch (e) {
    // Most likely SUPABASE_SERVICE_ROLE_KEY is not set in this deployment.
    console.error(JSON.stringify({ event: "start_trial_unavailable", message: e instanceof Error ? e.message.slice(0, 120) : "unknown" }));
    return { message: `${TRIAL_MESSAGES.error} (reference: start_trial/not_configured)` };
  }
  if (!result.ok) return { message: TRIAL_MESSAGES[result.reason] + (result.detail ? ` (reference: start_trial/${result.detail})` : "") };

  revalidatePath("/dashboard");
  revalidatePath("/account");
  return { ok: true, message: "Your 14-day Premium trial has started." };
}
