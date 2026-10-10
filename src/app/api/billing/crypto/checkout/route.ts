import type { NextRequest } from "next/server";
import { cryptoCheckoutBodySchema, decimalToMinor, getProduct } from "@/lib/billing/catalog";
import { getNowPaymentsConfig, nowPaymentsStatus } from "@/lib/billing/config";
import { createNowPayment, getMinPaymentUsd } from "@/lib/billing/nowpayments";
import { createOrder } from "@/lib/billing/service";
import { errorResponse, jsonResponse, requireApiUser } from "@/lib/api/guards";
import { requestOrigin } from "@/lib/origin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ORDER_ERRORS: Record<string, [number, string]> = {
  already_owned: [409, "You already have lifetime Premium."],
  early_sold_out: [409, "The early-adopter offer is sold out."],
  early_unavailable: [409, "The early-adopter offer is temporarily unavailable. Try again shortly."],
  early_already_held: [409, "You already have an early-adopter purchase in progress or completed."],
};

/**
 * POST /api/billing/crypto/checkout  { product, payCurrency }
 * Amount, currency and asset allowlist are server-controlled. Crypto plans are
 * PREPAID periods (30 / 365 days) that must be paid again to renew: there is no
 * automatic wallet debit.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, { mutating: true, verifiedEmail: true });
  if (!auth.ok) return auth.response;

  const parsed = cryptoCheckoutBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request");
  const { product, payCurrency } = parsed.data;

  const status = nowPaymentsStatus();
  if (!status.available || !status.products.includes(product)) return errorResponse(503, "checkout_unavailable", "Crypto checkout is not available yet.");
  if (!status.payCurrencies.includes(payCurrency)) return errorResponse(400, "unsupported_asset", "That asset is not supported.");

  const admin = createAdminClient();
  const p = getProduct(product);

  // Each coin has a provider-side minimum; say so clearly instead of failing at creation.
  const min = await getMinPaymentUsd(payCurrency);
  if (min !== null && min > p.amountMinor / 100) {
    return errorResponse(409, "amount_below_minimum", `${payCurrency.toUpperCase()} requires a minimum payment of about $${(Math.ceil(min * 100) / 100).toFixed(2)}, which is more than this plan costs. Please choose another coin or plan.`);
  }
  const order = await createOrder(admin, { userId: auth.user.id, provider: "nowpayments", product, asset: payCurrency, ttlSeconds: 60 * 60 });
  if (!order.ok) {
    const [code, message] = ORDER_ERRORS[order.code] ?? [500, "Could not start checkout."];
    return errorResponse(code, order.code, message);
  }

  try {
    const callbackUrl = `${await requestOrigin()}/api/webhooks/nowpayments`;
    const pay = await createNowPayment({ orderId: order.orderId, productId: product, payCurrency, callbackUrl });

    // Never trust the provider response blindly: it must match what we asked for.
    const matches =
      pay.payment_id !== undefined && !!pay.pay_address && pay.order_id === order.orderId &&
      decimalToMinor(pay.price_amount) === p.amountMinor && String(pay.pay_currency ?? "").toLowerCase() === payCurrency;
    if (!matches) throw new Error("provider_response_mismatch");

    const exp = pay.expiration_estimate_date ? Date.parse(pay.expiration_estimate_date) : NaN;
    const expiresAt = new Date(Number.isFinite(exp) ? Math.min(exp, Date.now() + 48 * 3600_000) : Date.now() + 3600_000).toISOString();
    await admin.rpc("attach_order_ref", { p_order_id: order.orderId, p_ref: String(pay.payment_id), p_expires_at: expiresAt });

    return jsonResponse({
      orderId: order.orderId,
      payment: { address: pay.pay_address, amount: String(pay.pay_amount), currency: pay.pay_currency, network: pay.network ?? null, extraId: pay.payin_extra_id ?? null, expiresAt },
      environment: getNowPaymentsConfig().environment,
      prepaid: p.cryptoPeriodDays,
    });
  } catch (e) {
    await admin.rpc("close_checkout_order", { p_order_id: order.orderId, p_status: "failed" });
    const reason = e instanceof Error ? e.message.slice(0, 220) : "unknown";
    console.error(JSON.stringify({ event: "nowpayments_create_payment_failed", order_id: order.orderId, pay_currency: payCurrency, reason }));
    // A short diagnostic (HTTP status or mismatch) helps the owner; no payloads or secrets.
    const code = /HTTP (\d{3})/.exec(reason)?.[1] ?? (reason === "provider_response_mismatch" ? "mismatch" : "error");
    return errorResponse(502, "provider_error", `Could not start crypto checkout. Please try again. (ref: ${code})`);
  }
}
