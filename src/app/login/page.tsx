import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-ui";
import { GoogleButton } from "@/components/google-button";
import { Notice } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/supabase/user";
import { safeNextPath } from "@/lib/validation/auth";
import { loginAction } from "./actions";

export const metadata = pageMetadata({ title: "Log in", description: "Log in to your GrowX account.", path: "/login", noindex: true });

const ERRORS: Record<string, string> = {
  auth_callback: "That sign-in link is invalid or has expired. Please try again.",
  google_unavailable: "Google sign-in is not available.",
  google_failed: "Google sign-in failed. Please try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  if (await getCurrentUser()) redirect(next);
  const err = sp.error ? ERRORS[sp.error] : undefined;
  return (
    <AuthShell title="Log in" subtitle="Welcome back to GrowX.">
      {err ? <Notice tone="error">{err}</Notice> : null}
      <GoogleButton next={next} />
      <AuthForm mode="login" action={loginAction} next={next} disabled={!isSupabaseConfigured()} />
    </AuthShell>
  );
}
