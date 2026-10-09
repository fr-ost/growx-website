import type { GracePolicy } from "@/lib/entitlement/types";
import { DEFAULT_GRACE } from "@/lib/entitlement/resolve";

const parse = (v: string | undefined, fallback: number) => {
  if (v === undefined || v.trim() === "") return fallback;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 14 ? n : fallback;
};

/**
 * Configurable grace after a failed recurring payment.
 * BILLING_GRACE_DAYS_CARD   (default 3): Paddle / card subscriptions.
 * BILLING_GRACE_DAYS_CRYPTO (default 0): NOWPayments; only verified provider
 * events decide, so no card-style retry window is assumed.
 * Values outside 0-14 are ignored.
 */
export function getGracePolicy(env: Record<string, string | undefined> = process.env): GracePolicy {
  return {
    paddle: parse(env.BILLING_GRACE_DAYS_CARD, DEFAULT_GRACE.paddle),
    nowpayments: parse(env.BILLING_GRACE_DAYS_CRYPTO, DEFAULT_GRACE.nowpayments),
  };
}
