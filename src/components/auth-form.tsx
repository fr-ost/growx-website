"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Notice } from "@/components/ui/primitives";
import type { AuthState } from "@/app/login/actions";

export function AuthForm({
  mode,
  action,
  next,
  disabled,
}: {
  mode: "login" | "signup";
  action: (prev: AuthState, fd: FormData) => Promise<AuthState>;
  next?: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.success ? <Notice tone="success">{state.success}</Notice> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email" id="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <Field
        label="Password"
        id="password"
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        required
        minLength={8}
        hint={isLogin ? undefined : "At least 8 characters."}
        error={state.fieldErrors?.password}
      />
      <Button type="submit" className="w-full" disabled={pending || disabled} aria-busy={pending}>
        {pending ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Log in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-text-2">
        {isLogin ? (
          <>
            No account?{" "}
            <Link href="/signup" className="font-medium text-accent underline underline-offset-2">
              Sign up free
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" className="font-medium text-accent underline underline-offset-2">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
