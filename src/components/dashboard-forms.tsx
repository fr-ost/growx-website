"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { startTrialAction, type FormState } from "@/app/dashboard/actions";

const initial: FormState = {};

export function StartTrialForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(startTrialAction, initial);
  return (
    <form action={action} className="space-y-3">
      {state.message ? <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice> : null}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending || disabled} aria-busy={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Starting..." : "Start my 30-day Premium trial"}
      </Button>
    </form>
  );
}
