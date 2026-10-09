import { AuthShell } from "@/components/auth-ui";
import { SimpleAuthForm } from "@/components/simple-auth-form";
import { isSupabaseConfigured } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { forgotPasswordAction } from "../login/actions";

export const metadata = pageMetadata({ title: "Reset password", description: "Reset your GrowX password.", path: "/forgot-password", noindex: true });

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Enter your account email and we will send a reset link.">
      <SimpleAuthForm field="email" action={forgotPasswordAction} submit="Send reset link" disabled={!isSupabaseConfigured()} />
    </AuthShell>
  );
}
