import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decimalToMinor, getBillable, type BillableId } from "./catalog";
import { createNowInvoice, isNowPaymentsUrl } from "./nowpayments";
import { createOrder } from "./service";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { requestOrigin } from "@/lib/origin";

/** How long an unpaid invoice order (and an early-adopter reservation) stays open. */
export const ORDER_TTL_SECONDS = 60 * 60;

export const ORDER_ERRORS: Record<string, [number, string]> = {
  already_owned: [409, "You already have lifetime Premium."],
  // The early-bird price changed between viewing the page and clicking: never silently charge a different price.
  early_sold_out: [409, "The early-bird spots just sold out. Reload the pricing page to see the current price."],
  early_unavailable: [409, "The remaining early-bird spots are reserved by other buyers right now. Reload the pricing page and try again shortly."],
  early_already_held: [409, "You already have an early-bird payment in progress. Finish it, or wait up to an hour for it to expire, then try again."],
  early_disabled: [409, "The early-bird offer just ended. Reload the pricing page to see the current price."],
  too_many_open_orders: [409, "You already have unpaid slot payments open. Finish one, or wait up to an hour for them to expire, then try again."],
};

/**
 * Creates a server-owned order for `product` (tied to the authenticated `userId`) and a NOWPayments hosted
 * invoice for the SERVER's price. Nothing is granted here: only a verified IPN (billing_apply) fulfils the order.
 */
export async function startInvoiceCheckout(admin: SupabaseClient, userId: string, product: BillableId) {
  const p = getBillable(product);
  const order = await createOrder(admin, { userId, provider: "nowpayments", product, ttlSeconds: ORDER_TTL_SECONDS });
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
    console.error(JSON.stringify({ event: "nowpayments_create_invoice_failed", order_id: order.orderId, product, reason }));
    const code = /HTTP (\d{3})/.exec(reason)?.[1] ?? (reason === "provider_response_mismatch" ? "mismatch" : "error");
    return errorResponse(502, "provider_error", `Could not start crypto checkout. Please try again. (ref: ${code})`);
  }
}
