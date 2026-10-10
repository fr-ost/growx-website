"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import type { ProductId } from "@/lib/billing/catalog";

/** Creates the order + invoice on the server, then sends the browser to the NOWPayments invoice page. */
export function StartCryptoCheckout({ product }: { product: ProductId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/crypto/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/checkout?plan=${product}`)}`);
        return;
      }
      if (res.ok && typeof json.invoiceUrl === "string" && json.invoiceUrl.startsWith("https://")) {
        window.location.assign(json.invoiceUrl);
        return; // keep the button busy while the browser leaves
      }
      setError(json.error?.message ?? "Could not start checkout. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button size="lg" className="w-full" onClick={start} disabled={busy}>
        {busy ? (
          <>
            <Spinner /> Opening secure payment page…
          </>
        ) : (
          "Continue to payment"
        )}
      </Button>
    </div>
  );
}
