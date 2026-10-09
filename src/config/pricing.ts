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
    blurb: "Planned launch offer: permanent Premium for the first 100 successful, verified purchases.",
    purchaseLimit: 100,
  },
] as const;

/**
 * Early-adopter offer lifecycle:
 *   planned   - not on sale (current state; no checkout, no enforcement yet)
 *   available - on sale; set only once checkout + verified webhooks exist and
 *               the DB function `early_adopter_available()` backs this value
 *   sold_out  - all 100 verified purchases claimed: the tier is hidden and the
 *               regular prices apply
 * No remaining-slot count is ever shown; only this status.
 */
export type EarlyAdopterStatus = "planned" | "available" | "sold_out";
export const EARLY_ADOPTER_STATUS: EarlyAdopterStatus = "planned";

export const EARLY_ADOPTER_PURCHASABLE = CHECKOUT_AVAILABLE && (EARLY_ADOPTER_STATUS as EarlyAdopterStatus) === "available";

/** Tiers to display, honouring the early-adopter lifecycle. */
export function visibleTiers(status: EarlyAdopterStatus = EARLY_ADOPTER_STATUS): readonly PricingTier[] {
  return status === "sold_out" ? pricingTiers.filter((t) => t.id !== "EARLY_ADOPTER_LIFETIME") : pricingTiers;
}

export const TRIAL_DAYS = 14;

export function getTier(id: PricingTierId): PricingTier {
  const tier = pricingTiers.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown pricing tier: ${id}`);
  return tier;
}
