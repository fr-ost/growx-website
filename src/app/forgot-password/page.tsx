import Link from "next/link";
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
      <p className="border-t border-border pt-4 text-center text-sm text-text-2">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
