import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-ui";
import { GoogleButton } from "@/components/google-button";
import { isSupabaseConfigured } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/supabase/user";
import { signupAction } from "../login/actions";

export const metadata = pageMetadata({ title: "Sign up", description: "Create a free GrowX account.", path: "/signup", noindex: true });

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell title="Create your account" subtitle="Free. No payment details needed. A 14-day Premium trial can be started later from your dashboard.">
      <GoogleButton />
      <AuthForm mode="signup" action={signupAction} disabled={!isSupabaseConfigured()} />
    </AuthShell>
  );
}
