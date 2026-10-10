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
    <AuthShell title="Create your free account" subtitle="No credit card needed. Start your 30-day Premium trial (every Premium feature, no commitment) from the dashboard whenever you are ready.">
      <GoogleButton />
      <AuthForm mode="signup" action={signupAction} disabled={!isSupabaseConfigured()} />
    </AuthShell>
  );
}
