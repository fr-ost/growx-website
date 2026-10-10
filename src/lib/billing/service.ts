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
  // Invoice orders learn their payment id and coin from VERIFIED payments; the database's strict
  // order checks (reference, amount, asset, product) then apply to every event.
  const moneyMoved = MONEY_STATUSES.has(String(payment.payment_status ?? "").toLowerCase());
  if (orderId && payment.pay_currency) await bindInvoiceOrder(deps.admin, orderId, paymentId, payment.pay_currency, moneyMoved);
  const product = orderId ? await productForOrder(deps.admin, orderId) : undefined;
  const effect = mapNowPayment({ ...payment, order_id: orderId }, product);
  const result = await applyBillingEffect(deps.admin, "nowpayments", nowEventId(payment), `payment.${String(payment.payment_status)}`, payment.updated_at ?? null, effect);
  log("nowpayments_ipn_processed", { payment_id: paymentId, status: payment.payment_status, result });
  if (moneyMoved && result.startsWith("rejected:")) {
    // Funds arrived but cannot be applied automatically (e.g. a customer paid twice on one invoice). Needs a manual refund/review.
    console.error(JSON.stringify({ event: "nowpayments_payment_needs_review", payment_id: paymentId, order_id: orderId ?? null, status: payment.payment_status, result }));
  }
  return { status: 200, body: { ok: true, result } };
}

/** Provider statuses meaning funds were (at least partly) sent. */
const MONEY_STATUSES = new Set(["confirming", "confirmed", "sending", "partially_paid", "finished", "refunded"]);
/** Our payment statuses meaning no funds were received. */
const NO_MONEY = new Set(["pending", "expired", "failed"]);
/** Orders that may still be (re)bound to a provider payment. Never fulfilled / refund_required / canceled ones. */
const BINDABLE = ["created", "pending", "expired", "failed"];

/**
 * Binds an invoice order to a provider payment + the coin the customer chose.
 * - An unbound order binds to the first verified payment.
 * - A bound order is re-bound ONLY when funds arrived on a new payment while the bound one has
 *   received nothing (the customer switched coins on the invoice page). A payment without funds
 *   never takes over, so a stray "waiting" notification cannot detach the paying payment.
 * The update is compare-and-set on the previous reference, so concurrent notifications cannot both win.
 */
async function bindInvoiceOrder(admin: SupabaseClient, orderId: string, paymentId: string, payCurrency: string, moneyMoved: boolean): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !/^[a-z0-9]{2,24}$/i.test(payCurrency)) return;
  const { data: order, error } = await admin.from("checkout_orders").select("provider_ref, status").eq("id", orderId).eq("provider", "nowpayments").maybeSingle();
  if (error) throw new Error(`bind_invoice_order read failed: ${error.code ?? "unknown"}`);
  const o = order as { provider_ref: string | null; status: string } | null;
  if (!o || o.provider_ref === paymentId || !BINDABLE.includes(o.status)) return;

  if (o.provider_ref) {
    if (!moneyMoved) return;
    const { data: prev, error: pe } = await admin.from("payments").select("status").eq("provider", "nowpayments").eq("provider_payment_id", o.provider_ref).maybeSingle();
    if (pe) throw new Error(`bind_invoice_order read failed: ${pe.code ?? "unknown"}`);
    const prevStatus = (prev as { status?: string } | null)?.status;
    if (prevStatus && !NO_MONEY.has(prevStatus)) return; // the bound payment already received funds: keep it
  }

  let q = admin
    .from("checkout_orders")
    .update({ provider_ref: paymentId, asset: payCurrency.toLowerCase(), status: "pending" })
    .eq("id", orderId)
    .eq("provider", "nowpayments")
    .in("status", BINDABLE);
  q = o.provider_ref ? q.eq("provider_ref", o.provider_ref) : q.is("provider_ref", null);
  const { error: ue } = await q;
  if (ue && ue.code !== "23505") throw new Error(`bind_invoice_order failed: ${ue.code ?? "unknown"}`);
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
