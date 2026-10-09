"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Notice } from "@/components/ui/primitives";
import type { AuthState } from "@/app/login/actions";

export function SimpleAuthForm({
  field,
  action,
  submit,
  disabled = false,
}: {
  field: "email" | "password";
  action: (prev: AuthState, fd: FormData) => Promise<AuthState>;
  submit: string;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  if (state.success) return <Notice tone="success">{state.success}</Notice>;
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {field === "email" ? (
        <Field label="Email" id="email" type="email" autoComplete="email" placeholder="you@example.com" required defaultValue={state.email} key={state.email ?? "e"} error={state.fieldErrors?.email} />
      ) : (
        <Field label="New password" id="password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." error={state.fieldErrors?.password} />
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending || disabled} aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Please wait..." : submit}
      </Button>
    </form>
  );
}
