"use server";

import { redirect } from "next/navigation";
import { googleAuthEnabled, isSupabaseConfigured } from "@/lib/env";
import { requestOrigin } from "@/lib/origin";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, safeNextPath } from "@/lib/validation/auth";

export interface AuthState {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  success?: string;
  /** Echo of the submitted email so the field is not cleared after an error. */
  email?: string;
}

const NOT_CONFIGURED: AuthState = { error: "Sign-in is temporarily unavailable. Please try again later." };
const emailOnly = credentialsSchema.pick({ email: true });
const passwordOnly = credentialsSchema.pick({ password: true });

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const f = error.flatten().fieldErrors;
  return { email: f.email?.[0], password: f.password?.[0] };
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  if (!isSupabaseConfigured()) return { ...NOT_CONFIGURED, email };
  const parsed = credentialsSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox (and spam folder) for the link.", email };
    }
    if (error.status === 429) return { error: "Too many attempts. Please wait a minute and try again.", email };
    return { error: "Invalid email or password.", email };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  if (!isSupabaseConfigured()) return { ...NOT_CONFIGURED, email };
  const parsed = credentialsSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), email };

  const supabase = await createClient();
  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
  });
  if (error) {
    if (error.status === 429) return { error: "Too many sign-up attempts. Please wait a few minutes and try again.", email };
    if (error.code === "weak_password") return { fieldErrors: { password: "Choose a stronger password." }, email };
    return { error: "We could not create the account. Please check your details and try again.", email };
  }
  if (data.session) redirect("/dashboard"); // email confirmation disabled in Supabase
  return { success: "Almost done! We sent a confirmation link to your email. Open it to activate your account." };
}

export async function googleAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured() || !googleAuthEnabled()) redirect("/login?error=google_unavailable");
  const supabase = await createClient();
  const next = safeNextPath(formData.get("next"));
  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=google_failed");
  redirect(data.url);
}

export async function forgotPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  if (!isSupabaseConfigured()) return { ...NOT_CONFIGURED, email };
  const parsed = emailOnly.safeParse({ email });
  if (!parsed.success) return { fieldErrors: { email: fieldErrors(parsed.error).email }, email };
  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  if (error?.status === 429) return { error: "Too many requests. Please wait a few minutes and try again.", email };
  // Same answer whether or not the account exists (no email enumeration).
  return { success: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const parsed = passwordOnly.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: { password: fieldErrors(parsed.error).password } };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser(); // must hold a verified recovery session
  if (!data.user) return { error: "This reset link is invalid or has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Choose a password you have not used before." } };
    return { error: "We could not update the password. Try a different one." };
  }
  redirect("/dashboard?password=updated");
}
