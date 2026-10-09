"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Notice } from "@/components/ui/primitives";
import { saveXUsernameAction, startTrialAction, type FormState } from "@/app/dashboard/actions";

const initial: FormState = {};

export function XUsernameForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState(saveXUsernameAction, initial);
  return (
    <form action={action} className="space-y-3">
      <Field
        label="X username"
        id="x_username"
        defaultValue={current ?? ""}
        placeholder="yourhandle"
        autoComplete="off"
        maxLength={200}
        hint="Self-reported. GrowX does not verify that you own this account and does not ask for your X login."
      />
      {state.message ? <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice> : null}
      <Button type="submit" disabled={pending} aria-busy={pending}>
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
      <Button type="submit" disabled={pending || disabled} aria-busy={pending}>
        {pending ? "Starting..." : "Start 14-day Premium trial"}
      </Button>
    </form>
  );
}
