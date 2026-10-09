"use server";

import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { googleAuthEnabled, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, safeNextPath } from "@/lib/validation/auth";

export interface AuthState {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  success?: string;
}

const NOT_CONFIGURED: AuthState = { error: "Authentication is not configured on this deployment." };

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { email: f.email?.[0], password: f.password?.[0] } };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // One generic message: do not reveal whether the email exists.
    const unconfirmed = error.code === "email_not_confirmed";
    return { error: unconfirmed ? "Please confirm your email first. Check your inbox for the link." : "Invalid email or password." };
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { email: f.email?.[0], password: f.password?.[0] } };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${site.url}/auth/callback` },
  });
  if (error) {
    return { error: "We could not create the account. Try a different email or a stronger password." };
  }
  if (data.session) redirect("/dashboard"); // email confirmation disabled in Supabase
  return { success: "Check your email for a confirmation link to finish creating your account." };
}

export async function googleAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured() || !googleAuthEnabled()) redirect("/login?error=google_unavailable");
  const supabase = await createClient();
  const next = safeNextPath(formData.get("next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=google_failed");
  redirect(data.url);
}
