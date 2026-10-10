import "server-only";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { isProductId, type ProductId } from "./catalog";
import { getPaddleConfig, paddleProductForPrice, type Env } from "./config";
import type { BillingEffect } from "./effects";

export function createPaddleClient(env: Env = process.env): Paddle {
  const c = getPaddleConfig(env);
  if (!c.apiKey) throw new Error("PADDLE_API_KEY is not set");
  return new Paddle(c.apiKey, { environment: c.environment === "production" ? Environment.production : Environment.sandbox });
}

/**
 * Verifies Paddle's signature over the EXACT raw request body using the
 * official SDK implementation (header `ts=<unix>;h1=<hmac-sha256 of "ts:body">`,
 * 5 second replay window). Returns false for a missing/invalid signature.
 */
export async function verifyPaddleSignature(rawBody: string, signature: string | null, secret: string | undefined): Promise<boolean> {
  if (!signature || !secret) return false;
  try {
    return await new Paddle("unused-for-signature-check").webhooks.isSignatureValid(rawBody, secret, signature);
  } catch {
    return false;
  }
}

// ------------------------------------------------------------ event mapping
/** Minimal shape of the (snake_case) JSON Paddle sends. Everything is treated as untrusted until verified. */
export interface PaddleEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: Record<string, unknown>;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown): string | undefined => (typeof v === "string" && v ? v : undefined);

function itemPriceIds(data: Obj): string[] {
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((i) => str(obj(obj(i).price).id) ?? str(obj(i).price_id)).filter((x): x is string => !!x);
}

/** The single product all items resolve to (server price map), or null when unknown/mixed. */
function productFromItems(data: Obj, env: Env): ProductId | null {
  const products = new Set(itemPriceIds(data).map((p) => paddleProductForPrice(p, env)));
  if (products.size !== 1) return null;
  const [only] = [...products];
  return only && isProductId(only) ? only : null;
}

const orderIdOf = (data: Obj) => str(obj(data.custom_data).order_id);

function totalMinor(data: Obj): number {
  const totals = obj(obj(data.details).totals);
  const n = Number(totals.grand_total ?? totals.total);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

const currencyOf = (data: Obj) => (str(data.currency_code) ?? str(obj(obj(data.details).totals).currency_code) ?? "USD").toUpperCase();

/**
 * Maps a VERIFIED Paddle event to a billing effect. Pure; no I/O.
 * Semantics (Paddle Billing):
 *  - transaction.paid       payment captured -> payment recorded as succeeded, no fulfilment
 *  - transaction.completed  captured AND fully processed -> fulfilment (one-time purchases)
 *  - transaction.payment_failed -> failed attempt recorded (not conclusive: Paddle allows retries)
 *  - transaction.canceled   conclusive for the order
 *  - subscription.*         authoritative for recurring access (status + billing period)
 *  - adjustment.*           refunds / chargebacks (acted on only when approved)
 */
export function mapPaddleEvent(evt: PaddleEvent, env: Env = process.env): BillingEffect {
  const data = obj(evt.data);
  const t = evt.event_type;

  if (t.startsWith("transaction.")) {
    const base = {
      kind: "payment" as const,
      provider_payment_id: str(data.id) ?? "",
      order_id: orderIdOf(data),
      subscription_ref: str(data.subscription_id),
      customer_ref: str(data.customer_id),
      amount_minor: totalMinor(data),
      currency: currencyOf(data),
    };
    const product = productFromItems(data, env);
    if (!base.provider_payment_id) return { kind: "noop" };
    if (!product) return { kind: "noop", reason: "unknown_price" };
    const common = { ...base, product, price_product: product };
    switch (t) {
      case "transaction.paid":
        return { ...common, status: "succeeded", fulfill: false, provider_status: str(data.status) ?? "paid" };
      case "transaction.completed":
        return { ...common, status: "succeeded", fulfill: true, provider_status: str(data.status) ?? "completed" };
      case "transaction.payment_failed":
        return { ...common, status: "failed", fulfill: false, provider_status: "payment_failed" };
      case "transaction.canceled":
        return { ...common, status: "failed", fulfill: false, provider_status: "canceled", order_status: "canceled" };
      default:
        return { kind: "noop" }; // created, ready, billed, updated, past_due, revised: informational
    }
  }

  if (t.startsWith("subscription.")) {
    const product = productFromItems(data, env);
    const status = t === "subscription.canceled" ? "canceled" : str(data.status);
    const period = obj(data.current_billing_period);
    const sched = obj(data.scheduled_change);
    if (!str(data.id) || !status) return { kind: "noop" };
    return {
      kind: "subscription_sync",
      provider_subscription_id: str(data.id)!,
      order_id: orderIdOf(data),
      customer_ref: str(data.customer_id),
      plan: product === "PRO_MONTHLY" || product === "PRO_YEARLY" ? product : undefined,
      status,
      period_end: str(period.ends_at) ?? str(data.next_billed_at),
      cancel_at_period_end: sched.action === "cancel",
    };
  }

  if (t === "adjustment.created" || t === "adjustment.updated") {
    const totals = obj(data.totals);
    const n = Number(totals.total);
    return {
      kind: "adjustment",
      adjustment_id: str(data.id),
      provider_payment_id: str(data.transaction_id) ?? "",
      subscription_ref: str(data.subscription_id),
      action: str(data.action) ?? "",
      adj_type: str(data.type) ?? "",
      status: str(data.status) ?? "",
      amount_minor: Number.isFinite(n) && n >= 0 ? Math.round(n) : 0,
    };
  }

  return { kind: "noop" };
}
