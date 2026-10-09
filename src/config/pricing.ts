/**
 * Single source of truth for pricing. UI, docs and (later) checkout code read
 * from here. Prices are the planned launch prices supplied by the owner.
 *
 * Payments are NOT live. `CHECKOUT_AVAILABLE` stays false until the Paddle /
 * NOWPayments integrations, verified webhooks and server-side enforcement of
 * the early-adopter limit exist. Do not flip it for a demo.
 */
export const CHECKOUT_AVAILABLE = false;

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
    cadence: "per month",
    blurb: "Flexible. Cancel any time once billing launches.",
  },
  {
    id: "PRO_YEARLY",
    entitlementPlan: "PRO_YEARLY",
    name: "Premium Yearly",
    priceCents: 1499,
    currency: "USD",
    interval: "year",
    priceLabel: "$14.99",
    cadence: "per year",
    blurb: "About $1.25 a month, billed yearly.",
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
    blurb: "Planned launch offer for the first 100 successful purchases.",
    purchaseLimit: 100,
  },
] as const;

/** The early-adopter offer is never purchasable until server-side enforcement ships. */
export const EARLY_ADOPTER_PURCHASABLE = false;

export const TRIAL_DAYS = 14;

export function getTier(id: PricingTierId): PricingTier {
  const tier = pricingTiers.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown pricing tier: ${id}`);
  return tier;
}
