import type { SupabaseClient } from "@supabase/supabase-js";
import { getBillable, isBillableId } from "@/lib/billing/catalog";

/**
 * Invoices are generated from the verified payment records (public.payments) written by billing_apply, so every
 * past and future confirmed payment has one and nothing is invented. Only confirmed payments get an invoice:
 * succeeded, refunded (shows the refund) and disputed. Pending, failed and expired attempts never do.
 */
export const INVOICE_STATUSES = ["succeeded", "refunded", "disputed"] as const;

export const SELLER = {
  name: "GrowX",
  person: "Shahriar Ahmed",
  roles: ["Founder, GrowX", "Co-founder, Unique Labs"],
  address: "Rajshahi, Bangladesh 6205",
  email: "support@growxapp.org",
  website: "www.growxapp.org",
};

const DAY = 86_400_000;

/** Stable, human-readable invoice number derived from the payment (date + first 8 characters of its id). */
export function invoiceNumber(paymentId: string, createdAt: string): string {
  const d = new Date(createdAt);
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `GX-${ymd}-${paymentId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  provider: string;
  provider_payment_id: string;
  product: string;
  amount_minor: number;
  currency: string;
  status: string;
  refunded_minor: number;
  asset: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  number: string;
  paymentId: string;
  issuedAt: string;
  customerEmail: string | null;
  productName: string;
  description: string;
  amountMinor: number;
  currency: string;
  refundedMinor: number;
  amountDueMinor: number;
  status: "paid" | "refunded" | "partially_refunded" | "disputed";
  method: string;
  transactionRef: string;
  orderRef: string | null;
  servicePeriod: string;
  expires: string | null;
  expiresLabel: string;
  refundedAt: string | null;
}

export const PAYMENT_COLUMNS = "id, user_id, provider, provider_payment_id, product, amount_minor, currency, status, refunded_minor, asset, order_id, created_at, updated_at";

const methodLabel = (provider: string, asset: string | null) =>
  provider === "nowpayments" ? `Cryptocurrency via NOWPayments${asset ? ` (${asset.toUpperCase()})` : ""}` : provider === "paddle" ? "Card via Paddle" : provider;

/** Builds the invoice for one payment. `client` is user-scoped (RLS: own rows only) or the admin client. */
export async function loadInvoice(client: SupabaseClient, paymentId: string, customerEmail: string | null): Promise<Invoice | null> {
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return null;
  const { data: p } = await client.from("payments").select(PAYMENT_COLUMNS).eq("id", paymentId).in("status", [...INVOICE_STATUSES]).maybeSingle();
  if (!p) return null;
  const pay = p as PaymentRow;
  const [order, sub] = await Promise.all([
    pay.order_id ? client.from("checkout_orders").select("period_days").eq("id", pay.order_id).maybeSingle() : Promise.resolve({ data: null }),
    client.from("subscriptions").select("current_period_end").eq("source_payment_id", pay.id).maybeSingle(),
  ]);
  return buildInvoice(pay, customerEmail, (order.data as { period_days?: number | null } | null)?.period_days ?? null, (sub.data as { current_period_end?: string | null } | null)?.current_period_end ?? null);
}

/** Pure: payment (+ period days and the subscription end it produced, when known) -> invoice. */
export function buildInvoice(pay: PaymentRow, customerEmail: string | null, periodDays: number | null, subscriptionEnd: string | null): Invoice {
  const billable = isBillableId(pay.product) ? getBillable(pay.product) : null;
  const productName = billable?.name ?? pay.product;
  const lifetime = pay.product === "PRO_LIFETIME" || pay.product === "PRO_LIFETIME_EARLY";
  const slot = pay.product === "X_ACCOUNT_SLOT";
  const days = periodDays ?? billable?.cryptoPeriodDays ?? (pay.product === "PRO_YEARLY" ? 365 : pay.product === "PRO_MONTHLY" ? 30 : null);
  const refunded = Number(pay.refunded_minor ?? 0);
  const status: Invoice["status"] = pay.status === "disputed" ? "disputed" : pay.status === "refunded" || refunded >= pay.amount_minor ? "refunded" : refunded > 0 ? "partially_refunded" : "paid";

  let servicePeriod: string;
  let expires: string | null = null;
  let expiresLabel: string;
  if (lifetime) {
    servicePeriod = "Lifetime access, one-time payment";
    expiresLabel = "Never (lifetime)";
  } else if (slot) {
    servicePeriod = "One extra X account slot, one-time payment";
    expiresLabel = "Permanent add-on";
  } else {
    servicePeriod = `${days ?? "-"} days of Premium, prepaid (does not renew automatically)`;
    expires = subscriptionEnd ?? (days ? new Date(Date.parse(pay.created_at) + days * DAY).toISOString() : null);
    expiresLabel = expires ? "" : "-";
  }
  if (status === "refunded" || status === "disputed") expiresLabel = status === "refunded" ? "Access ended (refunded)" : "Access ended (disputed)";

  return {
    number: invoiceNumber(pay.id, pay.created_at),
    paymentId: pay.id,
    issuedAt: pay.created_at,
    customerEmail,
    productName,
    description: lifetime ? "GrowX Premium, lifetime" : slot ? "GrowX X account slot add-on" : `GrowX Premium, ${days ?? ""} days`,
    amountMinor: Number(pay.amount_minor),
    currency: pay.currency,
    refundedMinor: refunded,
    amountDueMinor: 0,
    status,
    method: methodLabel(pay.provider, pay.asset),
    transactionRef: pay.provider_payment_id,
    orderRef: pay.order_id,
    servicePeriod,
    expires: status === "refunded" || status === "disputed" ? null : expires,
    expiresLabel,
    refundedAt: refunded > 0 || status === "refunded" ? pay.updated_at : null,
  };
}

export const money = (minor: number, currency: string) => `${(minor / 100).toFixed(2)} ${currency}`;
