import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { decimalToMinor, getProduct, isProductId, minorToDecimal, type ProductId } from "./catalog";
import { getNowPaymentsConfig, type Env } from "./config";
import type { BillingEffect, PaymentStatus } from "./effects";

// ---------------------------------------------------------- IPN signature
/** Recursively sorts object keys (arrays keep order), as NOWPayments does before signing. */
export function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, sortKeysDeep((v as Record<string, unknown>)[k])]));
  }
  return v;
}

export function computeIpnSignature(payload: unknown, ipnSecret: string): string {
  return createHmac("sha512", ipnSecret).update(JSON.stringify(sortKeysDeep(payload))).digest("hex");
}

/** Constant-time check of the `x-nowpayments-sig` header against the parsed IPN body. */
export function verifyIpnSignature(payload: unknown, signature: string | null, ipnSecret: string | undefined): boolean {
  if (!signature || !ipnSecret || !/^[0-9a-f]{128}$/i.test(signature.trim())) return false;
  const expected = Buffer.from(computeIpnSignature(payload, ipnSecret), "hex");
  const given = Buffer.from(signature.trim(), "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// -------------------------------------------------------------- API client
export interface NowPayment {
  payment_id?: string | number;
  payment_status?: string;
  pay_address?: string;
  price_amount?: string | number;
  price_currency?: string;
  pay_amount?: string | number;
  actually_paid?: string | number;
  pay_currency?: string;
  order_id?: string;
  network?: string;
  updated_at?: string;
  created_at?: string;
  expiration_estimate_date?: string;
  payin_extra_id?: string | null;
}

async function api<T>(path: string, init: RequestInit & { env?: Env } = {}): Promise<T> {
  const { env, ...rest } = init;
  const c = getNowPaymentsConfig(env ?? process.env);
  if (!c.apiKey) throw new Error("NOWPAYMENTS_API_KEY is not set");
  const res = await fetch(`${c.baseUrl}${path}`, {
    ...rest,
    headers: { "x-api-key": c.apiKey, "Content-Type": "application/json", ...(rest.headers ?? {}) },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) {
    // Provider error code/message only (never the request, headers or key); used for diagnosis.
    const body = (await res.json().catch(() => ({}))) as { code?: unknown; message?: unknown };
    const detail = [body.code, body.message].filter((x) => typeof x === "string").join(": ").slice(0, 160);
    throw new Error(`NOWPayments ${path.split("/")[1]} failed with HTTP ${res.status}${detail ? ` (${detail})` : ""}`);
  }
  return (await res.json()) as T;
}

export interface CreatePaymentInput {
  orderId: string;
  productId: ProductId;
  payCurrency: string;
  callbackUrl: string;
  env?: Env;
}

/** Creates the payment with SERVER-controlled amount/currency/order id. */
export async function createNowPayment(i: CreatePaymentInput): Promise<NowPayment> {
  const p = getProduct(i.productId);
  return api<NowPayment>("/payment", {
    method: "POST",
    env: i.env,
    body: JSON.stringify({
      price_amount: Number(minorToDecimal(p.amountMinor)),
      price_currency: "usd",
      pay_currency: i.payCurrency,
      ipn_callback_url: i.callbackUrl,
      order_id: i.orderId,
      order_description: `GrowX ${p.name}${p.cryptoPeriodDays ? ` (${p.cryptoPeriodDays} days, prepaid)` : ""}`,
    }),
  });
}

/** Minimum payment for a coin, expressed in USD (best effort: null when unknown). */
export async function getMinPaymentUsd(payCurrency: string, env?: Env): Promise<number | null> {
  try {
    const r = await api<{ fiat_equivalent?: number | string }>(`/min-amount?currency_from=${encodeURIComponent(payCurrency)}&fiat_equivalent=usd`, { env });
    const n = Number(r.fiat_equivalent);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export const getNowPayment = (paymentId: string, env?: Env) => api<NowPayment>(`/payment/${encodeURIComponent(paymentId)}`, { env });

// -------------------------------------------------------------- status map
const STATUS: Record<string, { status: PaymentStatus; fulfill: boolean; order?: "expired" | "failed" }> = {
  waiting: { status: "pending", fulfill: false },
  confirming: { status: "confirming", fulfill: false },
  confirmed: { status: "confirming", fulfill: false },
  sending: { status: "confirming", fulfill: false },
  partially_paid: { status: "partially_paid", fulfill: false },
  finished: { status: "succeeded", fulfill: true },
  failed: { status: "failed", fulfill: false, order: "failed" },
  expired: { status: "expired", fulfill: false, order: "expired" },
};

const dec = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** Deterministic idempotency key: the same provider state always yields the same id. */
export function nowEventId(p: NowPayment): string {
  return `${String(p.payment_id)}:${p.payment_status}:${p.actually_paid ?? 0}:${p.updated_at ?? ""}`;
}

/**
 * Maps a NOWPayments payment object (IPN body or reconciled API response) to
 * a billing effect. `finished` is the only status that fulfils: `confirmed` /
 * `sending` mean the chain confirmed but funds are not yet settled to the
 * merchant. A `finished` payment that received less than requested is treated
 * as partially paid and is NOT fulfilled.
 */
export function mapNowPayment(p: NowPayment, productHint?: string): BillingEffect {
  const status = String(p.payment_status ?? "").toLowerCase();
  const payment_id = p.payment_id === undefined ? "" : String(p.payment_id);
  if (!payment_id) return { kind: "noop" };

  if (status === "refunded") {
    return { kind: "adjustment", provider_payment_id: payment_id, adjustment_id: `refund:${payment_id}`, action: "refund", adj_type: "full", status: "approved", amount_minor: decimalToMinor(p.price_amount) ?? 0 };
  }
  const m = STATUS[status];
  if (!m) return { kind: "noop", reason: `unknown_status:${status}` };

  const product = productHint && isProductId(productHint) ? productHint : "PRO_MONTHLY";
  let { status: pay, fulfill } = m;
  const expected = dec(p.pay_amount);
  const received = dec(p.actually_paid);
  if (pay === "succeeded" && (expected === null || received === null || received + 1e-9 < expected)) {
    pay = "partially_paid";
    fulfill = false;
  }
  return {
    kind: "payment",
    provider_payment_id: payment_id,
    order_id: p.order_id,
    status: pay,
    fulfill,
    product,
    amount_minor: decimalToMinor(p.price_amount) ?? -1,
    currency: String(p.price_currency ?? "").toUpperCase(),
    asset: p.pay_currency,
    asset_expected: p.pay_amount === undefined ? undefined : String(p.pay_amount),
    asset_received: p.actually_paid === undefined ? undefined : String(p.actually_paid),
    provider_status: status,
    order_status: m.order,
  };
}
