"use server";

import { revalidatePath } from "next/cache";
import { startTrial } from "@/lib/trial/start";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
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
  if (existing.error) return { message: "Could not save your username. Please try again." };

  const res = existing.data
    ? await supabase.from("x_profiles").update({ x_username: parsed.data.username }).eq("user_id", user.id)
    : await supabase.from("x_profiles").insert({ user_id: user.id, x_username: parsed.data.username });
  if (res.error) return { message: "Could not save your username. Please try again." };

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
  } catch {
    return { message: TRIAL_MESSAGES.error };
  }
  if (!result.ok) return { message: TRIAL_MESSAGES[result.reason] };

  revalidatePath("/dashboard");
  revalidatePath("/account");
  return { ok: true, message: "Your 14-day Premium trial has started." };
}
