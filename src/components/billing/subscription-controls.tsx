"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";

/** Card-subscription controls. State only changes when Paddle's verified webhook confirms it. */
export function SubscriptionControls({ canCancel, pastDue }: { canCancel: boolean; pastDue: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"cancel" | "manage" | null>(null);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const cancel = async () => {
    if (!window.confirm("Cancel your subscription at the end of the current paid period? You keep Premium until then.")) return;
    setBusy("cancel");
    const res = await fetch("/api/billing/paddle/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) {
      setMsg({ tone: "success", text: json.message ?? "Cancellation requested." });
      setTimeout(() => router.refresh(), 4000);
    } else setMsg({ tone: "error", text: json.error?.message ?? "Could not request cancellation." });
  };

  const manage = async () => {
    setBusy("manage");
    const res = await fetch("/api/billing/paddle/manage", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok && json.updatePaymentMethodUrl) window.location.assign(json.updatePaymentMethodUrl);
    else setMsg({ tone: "error", text: "Could not open the billing page. Please try again." });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button variant={pastDue ? "primary" : "secondary"} size="sm" onClick={manage} disabled={busy !== null}>
          {busy === "manage" ? <Spinner /> : null} Update payment method
        </Button>
        {canCancel ? (
          <Button variant="ghost" size="sm" onClick={cancel} disabled={busy !== null}>
            {busy === "cancel" ? <Spinner /> : null} Cancel at period end
          </Button>
        ) : null}
      </div>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
    </div>
  );
}
