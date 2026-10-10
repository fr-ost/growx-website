import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProduct, isProductId, type ProductId } from "./catalog";
import { getNowPaymentsConfig, type Env } from "./config";
import type { BillingEffect } from "./effects";
import { mapNowPayment, nowEventId, verifyIpnSignature, type NowPayment } from "./nowpayments";

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

const log = (event: string, fields: Record<string, unknown>) =>
  // Never log payload bodies, emails, addresses or secrets: ids and outcomes only.
  console.log(JSON.stringify({ event, ...fields }));

/** Applies one normalised event atomically + idempotently in Postgres. Throws on DB error (-> HTTP 500 -> provider retries). */
export async function applyBillingEffect(
  admin: SupabaseClient,
  provider: "paddle" | "nowpayments",
  eventId: string,
  eventType: string,
  occurredAt: string | null,
  effect: BillingEffect,
): Promise<string> {
  const { data, error } = await admin.rpc("billing_apply", {
    p_provider: provider,
    p_event_id: eventId,
    p_event_type: eventType,
    p_occurred_at: occurredAt,
    p_effect: effect,
  });
  if (error) throw new Error(`billing_apply failed: ${error.code ?? "unknown"}`);
  return String((data as { result?: string } | null)?.result ?? "unknown");
}

// ------------------------------------------------------------ NOWPayments
export async function handleNowPaymentsIpn(
  rawBody: string,
  signature: string | null,
  deps: {
    admin: SupabaseClient;
    env?: Env;
    /** Fetches the payment from the provider API (reconciliation). Injected for tests. */
    fetchPayment?: (paymentId: string) => Promise<NowPayment>;
  },
): Promise<HandlerResult> {
  const env = deps.env ?? process.env;
  const cfg = getNowPaymentsConfig(env);
  if (!cfg.ipnSecret) return { status: 503, body: { error: "not_configured" } };

  let body: NowPayment;
  try {
    body = JSON.parse(rawBody) as NowPayment;
  } catch {
    return { status: 400, body: { error: "invalid_json" } };
  }
  if (!verifyIpnSignature(body, signature, cfg.ipnSecret)) {
    log("nowpayments_ipn_rejected", { reason: "invalid_signature" });
    return { status: 401, body: { error: "invalid_signature" } };
  }

  const paymentId = body.payment_id === undefined ? "" : String(body.payment_id);
  if (!paymentId) return { status: 400, body: { error: "invalid_event" } };

  // Reconcile: the provider API is the source of truth for the payment's state,
  // so a forged-but-correctly-signed replay cannot move a payment backwards or sideways.
  let payment = body;
  if (deps.fetchPayment) {
    try {
      const api = await deps.fetchPayment(paymentId);
      if (String(api.payment_id) !== paymentId || (body.order_id && api.order_id && api.order_id !== body.order_id)) {
        log("nowpayments_ipn_rejected", { reason: "reconcile_mismatch", payment_id: paymentId });
        return { status: 200, body: { ok: true, result: "rejected:reconcile_mismatch" } };
      }
      payment = api;
    } catch {
      // API unreachable: ask the provider to retry rather than trusting an unverified state change.
      return { status: 503, body: { error: "reconcile_unavailable" } };
    }
  }

  const orderId = payment.order_id ?? body.order_id;
  const product = orderId ? await productForOrder(deps.admin, orderId) : undefined;
  const effect = mapNowPayment({ ...payment, order_id: orderId }, product);
  const result = await applyBillingEffect(deps.admin, "nowpayments", nowEventId(payment), `payment.${String(payment.payment_status)}`, payment.updated_at ?? null, effect);
  log("nowpayments_ipn_processed", { payment_id: paymentId, status: payment.payment_status, result });
  return { status: 200, body: { ok: true, result } };
}

async function productForOrder(admin: SupabaseClient, orderId: string): Promise<ProductId | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return undefined;
  const { data } = await admin.from("checkout_orders").select("product").eq("id", orderId).maybeSingle();
  const p = (data as { product?: string } | null)?.product;
  return p && isProductId(p) ? p : undefined;
}

// ------------------------------------------------------------------ orders
export type CreateOrderError = "already_owned" | "already_subscribed" | "early_unavailable" | "early_sold_out" | "early_already_held";

export async function createOrder(
  admin: SupabaseClient,
  input: { userId: string; provider: "paddle" | "nowpayments"; product: ProductId; asset?: string; ttlSeconds: number },
): Promise<{ ok: true; orderId: string } | { ok: false; code: CreateOrderError | "error" }> {
  const p = getProduct(input.product);
  const { data, error } = await admin.rpc("create_checkout_order", {
    p_user_id: input.userId,
    p_provider: input.provider,
    p_product: p.id,
    p_plan: p.plan,
    p_amount_minor: p.amountMinor,
    p_currency: p.currency,
    p_asset: input.asset ?? null,
    p_period_days: input.provider === "nowpayments" ? p.cryptoPeriodDays : null,
    p_ttl_seconds: input.ttlSeconds,
  });
  if (error) return { ok: false, code: "error" };
  const r = data as { status: string; order_id?: string; code?: CreateOrderError };
  if (r.status === "ok" && r.order_id) return { ok: true, orderId: r.order_id };
  return { ok: false, code: r.code ?? "error" };
}

// ---------------------------------------------------------- reconciliation
/**
 * Pulls the current state of a pending crypto payment from the provider and
 * applies it through the SAME idempotent path as an IPN (identical event id),
 * so polling can never double-apply what an IPN already applied.
 */
export async function reconcileCryptoOrder(
  admin: SupabaseClient,
  order: { id: string; product: string; provider_ref: string | null },
  fetchPayment: (paymentId: string) => Promise<NowPayment>,
): Promise<NowPayment | null> {
  if (!order.provider_ref) return null;
  const payment = await fetchPayment(order.provider_ref);
  if (String(payment.payment_id) !== order.provider_ref || (payment.order_id && payment.order_id !== order.id)) return null;
  const effect = mapNowPayment({ ...payment, order_id: order.id }, order.product);
  await applyBillingEffect(admin, "nowpayments", nowEventId(payment), `payment.${String(payment.payment_status)}`, payment.updated_at ?? null, effect);
  return payment;
}
