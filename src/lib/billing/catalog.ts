import { z } from "zod";
import { getTier, type PricingTierId } from "@/config/pricing";

/**
 * Trusted server-side product catalog. Prices come from the shared pricing
 * config; nothing from the browser (amount, price id, plan) is ever used.
 */
export const PRODUCT_IDS = ["PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME", "PRO_LIFETIME_EARLY"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];
export type PaidPlan = "PRO_MONTHLY" | "PRO_YEARLY" | "PRO_LIFETIME";

export interface Product {
  id: ProductId;
  plan: PaidPlan;
  name: string;
  /** Exact integer minor units (cents). */
  amountMinor: number;
  currency: "USD";
  recurring: boolean;
  /** Days of access one crypto payment buys (prepaid, non-renewing). Null for lifetime. */
  cryptoPeriodDays: number | null;
  isEarlyAdopter: boolean;
}

const tierFor: Record<ProductId, PricingTierId> = {
  PRO_MONTHLY: "PRO_MONTHLY",
  PRO_YEARLY: "PRO_YEARLY",
  PRO_LIFETIME: "PRO_LIFETIME",
  PRO_LIFETIME_EARLY: "EARLY_ADOPTER_LIFETIME",
};

const meta: Record<ProductId, { plan: PaidPlan; recurring: boolean; days: number | null }> = {
  PRO_MONTHLY: { plan: "PRO_MONTHLY", recurring: true, days: 30 },
  PRO_YEARLY: { plan: "PRO_YEARLY", recurring: true, days: 365 },
  PRO_LIFETIME: { plan: "PRO_LIFETIME", recurring: false, days: null },
  PRO_LIFETIME_EARLY: { plan: "PRO_LIFETIME", recurring: false, days: null },
};

export function getProduct(id: ProductId): Product {
  const tier = getTier(tierFor[id]);
  if (tier.priceCents === null || tier.priceCents <= 0) throw new Error(`Product ${id} has no price`);
  const m = meta[id];
  return {
    id,
    plan: m.plan,
    name: tier.name,
    amountMinor: tier.priceCents,
    currency: "USD",
    recurring: m.recurring,
    cryptoPeriodDays: m.days,
    isEarlyAdopter: id === "PRO_LIFETIME_EARLY",
  };
}

export const isProductId = (v: unknown): v is ProductId => typeof v === "string" && (PRODUCT_IDS as readonly string[]).includes(v);

/** Request bodies accept ONLY a product id. Any extra field (amount, priceId, ...) is rejected. */
export const checkoutBodySchema = z.object({ product: z.enum(PRODUCT_IDS) }).strict();
export const cryptoCheckoutBodySchema = z.object({ product: z.enum(PRODUCT_IDS), payCurrency: z.string().min(2).max(24).regex(/^[a-z0-9]+$/) }).strict();

/** Exact decimal string -> minor units. Rejects floats with >2 decimals and anything non-numeric. */
export function decimalToMinor(value: unknown): number | null {
  const s = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  const m = s.match(/^(\d{1,9})(?:\.(\d{1,2}))?$/);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
}

export const minorToDecimal = (minor: number) => (minor / 100).toFixed(2);
