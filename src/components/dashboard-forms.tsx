"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Notice } from "@/components/ui/primitives";
import { saveXUsernameAction, startTrialAction, type FormState } from "@/app/dashboard/actions";

const initial: FormState = {};

export function XUsernameForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState(saveXUsernameAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div className="relative">
        <Field
          label="Your X username"
          id="x_username"
          defaultValue={current ?? ""}
          placeholder="yourhandle"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={200}
          className="[&_input]:pl-9"
          hint="Paste @handle or your x.com profile link. Self-reported and not verified; we never ask for your X login."
        />
        <span aria-hidden="true" className="pointer-events-none absolute left-4 top-[2.45rem] font-semibold text-muted">
          @
        </span>
      </div>
      {state.message ? <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice> : null}
      <Button type="submit" variant={current ? "secondary" : "primary"} disabled={pending} aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Saving..." : current ? "Update username" : "Save username"}
      </Button>
    </form>
  );
}

export function StartTrialForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(startTrialAction, initial);
  return (
    <form action={action} className="space-y-3">
      {state.message ? <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice> : null}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending || disabled} aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Starting..." : "Start my 14-day Premium trial"}
      </Button>
    </form>
  );
}
