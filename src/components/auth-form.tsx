"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Notice } from "@/components/ui/primitives";
import type { AuthState } from "@/app/login/actions";

export function Spinner() {
  return <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

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
  const [show, setShow] = useState(false);
  const isLogin = mode === "login";

  if (state.success) {
    return (
      <div className="animate-pop space-y-4 text-center">
        <div className="bg-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-[var(--shadow-red)]">✉</div>
        <h2 className="text-xl font-bold">Check your inbox</h2>
        <p className="text-text-2">{state.success}</p>
        <p className="text-sm text-muted">Didn&apos;t get it? Check spam, or wait a minute and try signing up again.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field
        label="Email"
        id="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        required
        defaultValue={state.email}
        key={state.email ?? "email"}
        error={state.fieldErrors?.email}
      />
      <div className="relative">
        <Field
          label="Password"
          id="password"
          type={show ? "text" : "password"}
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder={isLogin ? "Your password" : "Create a password"}
          required
          minLength={8}
          hint={isLogin ? undefined : "At least 8 characters."}
          error={state.fieldErrors?.password}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-[2.35rem] rounded-md px-2 py-1 text-xs font-semibold text-muted hover:text-accent"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {isLogin ? (
        <p className="text-right text-sm">
          <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
            Forgot password?
          </Link>
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending || disabled} aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Log in" : "Create free account"}
      </Button>
      {!isLogin ? (
        <p className="text-center text-xs text-muted">
          By creating an account you agree to the{" "}
          <Link href="/terms" className="underline hover:text-accent">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-accent">
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}
      <p className="border-t border-border pt-4 text-center text-sm text-text-2">
        {isLogin ? (
          <>
            New to GrowX?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Create a free account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
