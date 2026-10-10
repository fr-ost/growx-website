"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ProductId } from "@/lib/billing/catalog";
import { CheckoutDialog } from "./checkout-dialog";
import { useBillingOptions } from "./use-billing-options";

/** Purchase controls for one product. Enabled only for methods the server reports as available. */
export function BuyButtons({ product, primary = false, early = false }: { product: ProductId; primary?: boolean; early?: boolean }) {
  const opts = useBillingOptions();
  const [open, setOpen] = useState(false);

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
    <>
      <div className="grid gap-2">
        <Button variant={primary ? "primary" : "secondary"} className="w-full" onClick={() => setOpen(true)}>Pay with crypto</Button>
        {opts.crypto.environment === "sandbox" ? <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-warn">Test mode: no real charges</p> : null}
      </div>
      {open ? <CheckoutDialog product={product} payCurrencies={opts.crypto.payCurrencies} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
