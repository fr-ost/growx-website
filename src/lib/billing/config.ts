import { PRODUCT_IDS, type ProductId } from "./catalog";

export type Env = Record<string, string | undefined>;
export type ProviderEnvironment = "sandbox" | "production";

const val = (v: string | undefined) => v?.trim() || undefined;

/**
 * Live is the default environment (NOWPAYMENTS_ENV=sandbox opts into NOWPayments' sandbox).
 * Taking real payments additionally needs the explicit approval flag BILLING_LIVE_APPROVED=true.
 */
function resolveEnvironment(raw: string | undefined, env: Env): { environment: ProviderEnvironment; liveBlocked: boolean } {
  const environment: ProviderEnvironment = raw === "sandbox" ? "sandbox" : "production";
  const liveBlocked = environment === "production" && env.BILLING_LIVE_APPROVED !== "true";
  return { environment, liveBlocked };
}

export interface ProviderStatus {
  available: boolean;
  environment: ProviderEnvironment;
  /** Product ids purchasable with this provider right now. */
  products: ProductId[];
  /** Names of missing/invalid settings (never values). */
  problems: string[];
}

// ----------------------------------------------------------- NOWPayments
export interface NowPaymentsConfig {
  environment: ProviderEnvironment;
  liveBlocked: boolean;
  apiKey: string | undefined;
  ipnSecret: string | undefined;
  baseUrl: string;
}

export function getNowPaymentsConfig(env: Env = process.env): NowPaymentsConfig {
  const { environment, liveBlocked } = resolveEnvironment(env.NOWPAYMENTS_ENV, env);
  return {
    environment,
    liveBlocked,
    apiKey: val(env.NOWPAYMENTS_API_KEY),
    ipnSecret: val(env.NOWPAYMENTS_IPN_SECRET),
    baseUrl: environment === "sandbox" ? "https://api-sandbox.nowpayments.io/v1" : "https://api.nowpayments.io/v1",
  };
}

export function nowPaymentsStatus(env: Env = process.env): ProviderStatus {
  const c = getNowPaymentsConfig(env);
  const problems: string[] = [];
  if (!c.apiKey) problems.push("NOWPAYMENTS_API_KEY");
  if (!c.ipnSecret) problems.push("NOWPAYMENTS_IPN_SECRET");
  if (c.liveBlocked) problems.push("BILLING_LIVE_APPROVED (live mode not approved)");
  const available = problems.length === 0;
  const products = PRODUCT_IDS.filter((p) => p !== "PRO_LIFETIME_EARLY" || env.EARLY_ADOPTER_ENABLED === "true");
  return { available, environment: c.environment, products: available ? [...products] : [], problems };
}
