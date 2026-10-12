/**
 * Single source of truth for pricing (display + the trusted server catalog in
 * src/lib/billing/catalog.ts). Whether checkout is actually available is a
 * server-side decision made from provider configuration, not a constant here.
 */
export type PaidPlanId = "PRO_MONTHLY" | "PRO_YEARLY" | "PRO_LIFETIME";
export type PricingTierId = "FREE" | "PRO_MONTHLY" | "PRO_YEARLY" | "PRO_LIFETIME";

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
  /** Lifetime tier only: early-bird price for the first `earlyBird.limit` successful purchases (enforced in the database). */
  earlyBird?: { priceCents: number; priceLabel: string; limit: number };
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
    priceCents: 5999,
    currency: "USD",
    interval: "once",
    priceLabel: "$59.99",
    cadence: "one-time",
    blurb: "Pay once. No renewal.",
    earlyBird: { priceCents: 2999, priceLabel: "$29.99", limit: 100 },
  },
] as const;

/** Early-bird lifetime price: the first EARLY_BIRD_LIMIT successful lifetime purchases pay this instead of the regular price. */
export const EARLY_BIRD_LIMIT = 100;

export const TRIAL_DAYS = 30;

export function getTier(id: PricingTierId): PricingTier {
  const tier = pricingTiers.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown pricing tier: ${id}`);
  return tier;
}
