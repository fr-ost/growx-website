/**
 * Single source of truth for pricing (display + the trusted server catalog in
 * src/lib/billing/catalog.ts). Whether checkout is actually available is a
 * server-side decision made from provider configuration, not a constant here.
 */
export type PaidPlanId = "PRO_MONTHLY" | "PRO_YEARLY" | "PRO_LIFETIME";
export type PricingTierId = "FREE" | "PRO_MONTHLY" | "PRO_YEARLY" | "PRO_LIFETIME" | "EARLY_ADOPTER_LIFETIME";

export interface PricingTier {
  id: PricingTierId;
  /** Entitlement plan this tier maps to once purchased. */
  entitlementPlan: "FREE" | PaidPlanId;
  name: string;
  /** Price in USD cents; null for free. */
  priceCents: number | null;
  currency: "USD";
  interval: "month" | "year" | "once" | null;
  priceLabel: string;
  cadence: string;
  blurb: string;
  /** Early-adopter tier only: purchase cap, enforced server-side in a later phase. */
  purchaseLimit?: number;
  highlight?: boolean;
}

export const pricingTiers: readonly PricingTier[] = [
  {
    id: "FREE",
    entitlementPlan: "FREE",
    name: "Free",
    priceCents: 0,
    currency: "USD",
    interval: null,
    priceLabel: "$0",
    cadence: "forever",
    blurb: "Useful core features for daily use.",
  },
  {
    id: "PRO_MONTHLY",
    entitlementPlan: "PRO_MONTHLY",
    name: "Premium Monthly",
    priceCents: 199,
    currency: "USD",
    interval: "month",
    priceLabel: "$1.99",
    cadence: "for 30 days",
    blurb: "30 days of Premium, prepaid. No automatic renewal.",
  },
  {
    id: "PRO_YEARLY",
    entitlementPlan: "PRO_YEARLY",
    name: "Premium Yearly",
    priceCents: 1499,
    currency: "USD",
    interval: "year",
    priceLabel: "$14.99",
    cadence: "for 365 days",
    blurb: "365 days of Premium for about $1.25 a month, prepaid. No automatic renewal.",
    highlight: true,
  },
  {
    id: "PRO_LIFETIME",
    entitlementPlan: "PRO_LIFETIME",
    name: "Premium Lifetime",
    priceCents: 2999,
    currency: "USD",
    interval: "once",
    priceLabel: "$29.99",
    cadence: "one-time",
    blurb: "Pay once. No renewal.",
  },
  {
    id: "EARLY_ADOPTER_LIFETIME",
    entitlementPlan: "PRO_LIFETIME",
    name: "Early Adopter Lifetime",
    priceCents: 99,
    currency: "USD",
    interval: "once",
    priceLabel: "$0.99",
    cadence: "one-time",
    blurb: "Planned launch offer: permanent Premium for the first 100 successful, verified purchases.",
    purchaseLimit: 100,
  },
] as const;

/**
 * Early-adopter offer state shown in the UI. It is decided by the SERVER
 * (database inventory + configuration), never by this file: "available" means
 * purchasable now, "unavailable" means not on sale, "sold_out" hides the tier.
 * No remaining-slot count is ever exposed.
 */
export type EarlyAdopterStatus = "unavailable" | "temporarily_unavailable" | "available" | "sold_out";

/** Tiers to display, honouring the early-adopter lifecycle. */
export function visibleTiers(status: EarlyAdopterStatus = "unavailable"): readonly PricingTier[] {
  return status === "sold_out" ? pricingTiers.filter((t) => t.id !== "EARLY_ADOPTER_LIFETIME") : pricingTiers;
}

export const TRIAL_DAYS = 14;

export function getTier(id: PricingTierId): PricingTier {
  const tier = pricingTiers.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown pricing tier: ${id}`);
  return tier;
}
