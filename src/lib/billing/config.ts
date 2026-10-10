import { PRODUCT_IDS, type ProductId } from "./catalog";

export type Env = Record<string, string | undefined>;
export type ProviderEnvironment = "sandbox" | "production";

const val = (v: string | undefined) => v?.trim() || undefined;

/** Live mode needs BOTH the provider env set to production AND an explicit approval flag. */
function resolveEnvironment(raw: string | undefined, env: Env): { environment: ProviderEnvironment; liveBlocked: boolean } {
  const environment: ProviderEnvironment = raw === "production" ? "production" : "sandbox";
  const liveBlocked = environment === "production" && env.BILLING_LIVE_APPROVED !== "true";
  return { environment, liveBlocked };
}

// ---------------------------------------------------------------- Paddle
const PRICE_ENV: Record<ProductId, string> = {
  PRO_MONTHLY: "PADDLE_PRICE_ID_MONTHLY",
  PRO_YEARLY: "PADDLE_PRICE_ID_YEARLY",
  PRO_LIFETIME: "PADDLE_PRICE_ID_LIFETIME",
  PRO_LIFETIME_EARLY: "PADDLE_PRICE_ID_EARLY_ADOPTER",
};

export interface PaddleConfig {
  environment: ProviderEnvironment;
  apiKey: string | undefined;
  webhookSecret: string | undefined;
  clientToken: string | undefined;
  /** product -> Paddle price id (pri_...) taken ONLY from server env. */
  prices: Partial<Record<ProductId, string>>;
}

export function getPaddleConfig(env: Env = process.env): PaddleConfig & { liveBlocked: boolean } {
  const { environment, liveBlocked } = resolveEnvironment(env.PADDLE_ENV, env);
  const prices: PaddleConfig["prices"] = {};
  for (const id of PRODUCT_IDS) {
    const v = val(env[PRICE_ENV[id]]);
    if (v && /^pri_[a-z0-9]+$/i.test(v)) prices[id] = v;
  }
  return {
    environment,
    liveBlocked,
    apiKey: val(env.PADDLE_API_KEY),
    webhookSecret: val(env.PADDLE_WEBHOOK_SECRET),
    clientToken: val(env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) ?? val(env.PADDLE_CLIENT_TOKEN),
    prices,
  };
}

/** Sandbox keys/tokens must not be mixed with live ones (a common, costly mistake). */
export function paddleKeyMismatch(c: PaddleConfig): string | null {
  const live = (s: string | undefined) => !!s && /(^live_|_live_)/.test(s);
  const sbx = (s: string | undefined) => !!s && /(^test_|_sdbx_|_sandbox_)/.test(s);
  if (c.environment === "sandbox" && (live(c.apiKey) || live(c.clientToken))) return "live credentials configured while PADDLE_ENV is sandbox";
  if (c.environment === "production" && (sbx(c.apiKey) || sbx(c.clientToken))) return "sandbox credentials configured while PADDLE_ENV is production";
  return null;
}

export interface ProviderStatus {
  available: boolean;
  environment: ProviderEnvironment;
  /** Product ids purchasable with this provider right now. */
  products: ProductId[];
  /** Names of missing/invalid settings (never values). */
  problems: string[];
}

export function paddleStatus(env: Env = process.env): ProviderStatus {
  const c = getPaddleConfig(env);
  const problems: string[] = [];
  if (!c.apiKey) problems.push("PADDLE_API_KEY");
  if (!c.webhookSecret) problems.push("PADDLE_WEBHOOK_SECRET");
  if (!c.clientToken) problems.push("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
  if (c.liveBlocked) problems.push("BILLING_LIVE_APPROVED (live mode not approved)");
  const mismatch = paddleKeyMismatch(c);
  if (mismatch) problems.push(mismatch);
  const products = PRODUCT_IDS.filter((p) => !!c.prices[p] && (p !== "PRO_LIFETIME_EARLY" || env.EARLY_ADOPTER_ENABLED === "true"));
  if (!products.length) problems.push("PADDLE_PRICE_ID_*");
  const available = problems.length === 0;
  return { available, environment: c.environment, products: available ? products : [], problems };
}

/** Price id -> product, built from server env only. Unknown price ids map to null. */
export function paddleProductForPrice(priceId: string | undefined | null, env: Env = process.env): ProductId | null {
  if (!priceId) return null;
  const c = getPaddleConfig(env);
  for (const id of PRODUCT_IDS) if (c.prices[id] === priceId) return id;
  return null;
}

// ----------------------------------------------------------- NOWPayments
export interface NowPaymentsConfig {
  environment: ProviderEnvironment;
  liveBlocked: boolean;
  apiKey: string | undefined;
  ipnSecret: string | undefined;
  baseUrl: string;
  /** Server allowlist of pay_currency codes (asset + network), lowercase. */
  payCurrencies: string[];
}

export const DEFAULT_PAY_CURRENCIES = ["usdttrc20", "usdterc20", "usdcerc20"];

export function getNowPaymentsConfig(env: Env = process.env): NowPaymentsConfig {
  const { environment, liveBlocked } = resolveEnvironment(env.NOWPAYMENTS_ENV, env);
  const list = (val(env.NOWPAYMENTS_PAY_CURRENCIES) ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[a-z0-9]{2,24}$/.test(s));
  return {
    environment,
    liveBlocked,
    apiKey: val(env.NOWPAYMENTS_API_KEY),
    ipnSecret: val(env.NOWPAYMENTS_IPN_SECRET),
    baseUrl: environment === "sandbox" ? "https://api-sandbox.nowpayments.io/v1" : "https://api.nowpayments.io/v1",
    payCurrencies: list.length ? [...new Set(list)] : DEFAULT_PAY_CURRENCIES,
  };
}

export function nowPaymentsStatus(env: Env = process.env): ProviderStatus & { payCurrencies: string[] } {
  const c = getNowPaymentsConfig(env);
  const problems: string[] = [];
  if (!c.apiKey) problems.push("NOWPAYMENTS_API_KEY");
  if (!c.ipnSecret) problems.push("NOWPAYMENTS_IPN_SECRET");
  if (c.liveBlocked) problems.push("BILLING_LIVE_APPROVED (live mode not approved)");
  const available = problems.length === 0;
  const products = PRODUCT_IDS.filter((p) => p !== "PRO_LIFETIME_EARLY" || env.EARLY_ADOPTER_ENABLED === "true");
  return { available, environment: c.environment, products: available ? [...products] : [], problems, payCurrencies: available ? c.payCurrencies : [] };
}
