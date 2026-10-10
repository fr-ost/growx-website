"use client";

import { IconGift } from "@/components/icons";
import { Badge } from "@/components/ui/primitives";
import type { PricingTier } from "@/config/pricing";
import { BuyButtons } from "./buy-buttons";
import { useBillingOptions } from "./use-billing-options";

/**
 * Early-adopter offer. Its state comes from the server; the page never
 * shows a countdown or a remaining-slot number. When sold out it disappears
 * and the regular prices apply.
 */
export function EarlyAdopterBanner({ tier }: { tier: PricingTier }) {
  const opts = useBillingOptions();
  if (opts === undefined) return null; // never flash an offer that may turn out to be sold out
  const state = opts?.earlyAdopter ?? "unavailable";
  if (state === "sold_out") return null;

  const label =
    state === "available" ? "Limited offer" : state === "temporarily_unavailable" ? "Temporarily unavailable" : "Not on sale yet";

  return (
    <div className="reveal relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-r from-accent-soft via-white to-accent-soft p-6 sm:p-8">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <span className="bg-brand flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-red)]">
          <IconGift size={26} />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold">{tier.name}</h3>
            <Badge tone={state === "available" ? "solid" : "neutral"}>{label}</Badge>
          </div>
          <p className="mt-1.5 text-text-2">
            Permanent Premium for <strong>{tier.priceLabel}</strong> one-time, for the first {tier.purchaseLimit} successful purchases across card and crypto. Once they are gone, regular prices apply.
            {state === "temporarily_unavailable" ? " All remaining offers are currently reserved by customers who are checking out; check back shortly." : ""}
          </p>
        </div>
        <div className="w-full md:w-52">
          <BuyButtons product="PRO_LIFETIME_EARLY" early />
        </div>
      </div>
    </div>
  );
}
