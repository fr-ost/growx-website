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
  auth_callback: "That sign-in link is invalid. Please log in or request a new link.",
  link_expired: "That link has expired or was already used. Please log in, or request a new link.",
  link_other_browser: "Your email is confirmed. Please log in to continue (the link was opened in a different browser).",
  google_unavailable: "Google sign-in is not available.",
  google_failed: "Google sign-in failed. Please try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  if (await getCurrentUser()) redirect(next);
  const err = sp.error ? ERRORS[sp.error] : undefined;
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your GrowX account.">
      {err ? <Notice tone={sp.error === "link_other_browser" ? "success" : "error"}>{err}</Notice> : null}
      <GoogleButton next={next} />
      <AuthForm mode="login" action={loginAction} next={next} disabled={!isSupabaseConfigured()} />
    </AuthShell>
  );
}
