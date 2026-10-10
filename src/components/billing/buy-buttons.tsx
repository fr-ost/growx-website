"use client";

import { Button, LinkButton } from "@/components/ui/button";
import type { ProductId } from "@/lib/billing/catalog";
import { useBillingOptions } from "./use-billing-options";

/** Purchase control for one product. Enabled only when the server reports crypto checkout as available. */
export function BuyButtons({ product, primary = false, early = false }: { product: ProductId; primary?: boolean; early?: boolean }) {
  const opts = useBillingOptions();

  if (opts === undefined) return <Button variant="secondary" className="w-full" disabled>Checking…</Button>;
  const crypto = !!opts?.crypto.products.includes(product);
  const blockedByOffer = early && opts?.earlyAdopter !== "available";

  if (!opts || !crypto || blockedByOffer) {
    return (
      <Button variant="secondary" className="w-full" disabled aria-disabled="true" title="Not available right now">
        {early && opts?.earlyAdopter === "temporarily_unavailable" ? "Temporarily unavailable" : "Coming soon"}
      </Button>
    );
  }
  return (
    <div className="grid gap-2">
      <LinkButton href={`/checkout?plan=${product}`} variant={primary ? "primary" : "secondary"} className="w-full">
        Pay with crypto
      </LinkButton>
      {opts.crypto.environment === "sandbox" ? <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-warn">Test mode: no real charges</p> : null}
    </div>
  );
}
