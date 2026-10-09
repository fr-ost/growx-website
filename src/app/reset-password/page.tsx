import { AuthShell } from "@/components/auth-ui";
import { SimpleAuthForm } from "@/components/simple-auth-form";
import { pageMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/supabase/require-user";
import { resetPasswordAction } from "../login/actions";

export const metadata = pageMetadata({ title: "Choose a new password", description: "Set a new GrowX password.", path: "/reset-password", noindex: true });
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  await requireUser("/reset-password");
  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters.">
      <SimpleAuthForm field="password" action={resetPasswordAction} submit="Update password" />
    </AuthShell>
  );
}
