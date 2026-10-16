"use client";

import { EARLY_BIRD_LIMIT, getTier } from "@/config/pricing";
import { useBillingOptions } from "./use-billing-options";

/**
 * Lifetime price block. While early-bird spots remain the regular price is struck through and the
 * early price is shown with a progress bar of claimed spots. The numbers come from the server
 * (verified purchases in the database); nothing here is invented or animated to create urgency.
 */
export function LifetimePrice() {
  const tier = getTier("PRO_LIFETIME");
  const opts = useBillingOptions();
  const eb = opts?.earlyBird;
  const total = eb?.total ?? EARLY_BIRD_LIMIT;
  const remaining = eb?.remaining ?? null;
  const showEarly = eb?.state === "available" && tier.earlyBird;
  const claimed = remaining === null ? null : total - remaining;
  const pct = claimed === null ? 0 : Math.min(100, Math.round((claimed / total) * 100));

  return (
    <div>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
        {showEarly ? (
          <>
            <s className="text-xl font-bold text-muted" aria-label={`Regular price ${tier.priceLabel}`}>{tier.priceLabel}</s>
            <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight">{tier.earlyBird!.priceLabel}</span>
          </>
        ) : (
          <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight">{tier.priceLabel}</span>
        )}
        <span className="whitespace-nowrap text-sm text-muted">{tier.cadence}</span>
      </p>

      {showEarly ? (
        <div className="mt-3 rounded-xl border border-accent/25 bg-accent-soft p-3">
          <p className="text-sm font-semibold text-text">
            Early-bird price for the first {total} buyers
          </p>
          {remaining !== null ? (
            <>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-border"
                role="progressbar"
                aria-label="Early-bird spots taken"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={claimed ?? 0}
              >
                <div className="bg-brand h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-text-2">
                {remaining} of {total} spots left <span className="font-normal text-muted">· then {tier.priceLabel}</span>
              </p>
            </>
          ) : null}
        </div>
      ) : eb?.state === "temporarily_unavailable" ? (
        <p className="mt-3 rounded-xl border border-border bg-surface-2 p-3 text-xs text-text-2">
          Early-bird spots ({tier.earlyBird?.priceLabel}) are all reserved by people checking out right now. If a payment is not completed they open up again, so check back shortly.
        </p>
      ) : null}
    </div>
  );
}
