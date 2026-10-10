import type { NextRequest } from "next/server";
import { cryptoCheckoutBodySchema, decimalToMinor, getProduct } from "@/lib/billing/catalog";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { createNowInvoice, isNowPaymentsUrl } from "@/lib/billing/nowpayments";
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

/** How long an unpaid invoice order (and an early-adopter reservation) stays open. */
const ORDER_TTL_SECONDS = 60 * 60;

/**
 * POST /api/billing/crypto/checkout  { product }
 * Creates a server-owned order and a NOWPayments hosted invoice for the server's price.
 * The customer chooses the coin on the invoice page. Crypto plans are PREPAID periods
 * (30 / 365 days) with no automatic renewal. Premium is granted only by verified IPNs.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, { mutating: true, verifiedEmail: true });
  if (!auth.ok) return auth.response;

  const parsed = cryptoCheckoutBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request");
  const { product } = parsed.data;

  const status = nowPaymentsStatus();
  if (!status.available || !status.products.includes(product)) return errorResponse(503, "checkout_unavailable", "Crypto checkout is not available yet.");

  const admin = createAdminClient();
  const p = getProduct(product);
  const order = await createOrder(admin, { userId: auth.user.id, provider: "nowpayments", product, ttlSeconds: ORDER_TTL_SECONDS });
  if (!order.ok) {
    const [code, message] = ORDER_ERRORS[order.code] ?? [500, "Could not start checkout."];
    return errorResponse(code, order.code, message);
  }

  try {
    const origin = await requestOrigin();
    const invoice = await createNowInvoice({
      orderId: order.orderId,
      productId: product,
      callbackUrl: `${origin}/api/webhooks/nowpayments`,
      successUrl: `${origin}/checkout/${order.orderId}`,
      cancelUrl: `${origin}/checkout/${order.orderId}?canceled=1`,
    });

    // Never trust the provider response blindly: it must match what we asked for.
    const matches =
      invoice.id !== undefined && isNowPaymentsUrl(invoice.invoice_url) &&
      (invoice.order_id === undefined || invoice.order_id === order.orderId) &&
      (invoice.price_amount === undefined || decimalToMinor(invoice.price_amount) === p.amountMinor);
    if (!matches) throw new Error("provider_response_mismatch");

    // Order -> pending. The payment id and coin are bound later, from the first verified IPN.
    await admin.rpc("attach_order_ref", { p_order_id: order.orderId, p_ref: null, p_expires_at: null });
    return jsonResponse({ orderId: order.orderId, invoiceUrl: invoice.invoice_url });
  } catch (e) {
    await admin.rpc("close_checkout_order", { p_order_id: order.orderId, p_status: "failed" });
    const reason = e instanceof Error ? e.message.slice(0, 220) : "unknown";
    console.error(JSON.stringify({ event: "nowpayments_create_invoice_failed", order_id: order.orderId, reason }));
    const code = /HTTP (\d{3})/.exec(reason)?.[1] ?? (reason === "provider_response_mismatch" ? "mismatch" : "error");
    return errorResponse(502, "provider_error", `Could not start crypto checkout. Please try again. (ref: ${code})`);
  }
}
