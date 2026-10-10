import type { NextRequest } from "next/server";
import { checkoutBodySchema } from "@/lib/billing/catalog";
import { getPaddleConfig, paddleStatus } from "@/lib/billing/config";
import { createPaddleClient } from "@/lib/billing/paddle";
import { createOrder } from "@/lib/billing/service";
import { errorResponse, jsonResponse, requireApiUser } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ORDER_ERRORS: Record<string, [number, string]> = {
  already_owned: [409, "You already have lifetime Premium."],
  already_subscribed: [409, "You already have an active subscription. Manage it on your account page."],
  early_sold_out: [409, "The early-adopter offer is sold out."],
  early_unavailable: [409, "The early-adopter offer is temporarily unavailable. Try again shortly."],
  early_already_held: [409, "You already have an early-adopter purchase in progress or completed."],
};

/**
 * POST /api/billing/paddle/checkout  { product }
 * The server (not the browser) chooses the Paddle price from its own config,
 * creates the transaction, and binds it to a server-created order owned by the
 * verified session user. The browser only receives a transaction id to open.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, { mutating: true, verifiedEmail: true });
  if (!auth.ok) return auth.response;

  const parsed = checkoutBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request");
  const { product } = parsed.data;

  const status = paddleStatus();
  const cfg = getPaddleConfig();
  const priceId = cfg.prices[product];
  if (!status.available || !status.products.includes(product) || !priceId) return errorResponse(503, "checkout_unavailable", "Card checkout is not available yet.");

  const admin = createAdminClient();
  const order = await createOrder(admin, { userId: auth.user.id, provider: "paddle", product, ttlSeconds: 30 * 60 });
  if (!order.ok) {
    const [code, message] = ORDER_ERRORS[order.code] ?? [500, "Could not start checkout."];
    return errorResponse(code, order.code, message);
  }

  try {
    const txn = await createPaddleClient().transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { order_id: order.orderId },
    });
    await admin.rpc("attach_order_ref", { p_order_id: order.orderId, p_ref: txn.id, p_expires_at: null });
    return jsonResponse({ orderId: order.orderId, transactionId: txn.id, clientToken: cfg.clientToken, environment: cfg.environment });
  } catch {
    await admin.rpc("close_checkout_order", { p_order_id: order.orderId, p_status: "failed" });
    console.error(JSON.stringify({ event: "paddle_create_transaction_failed", order_id: order.orderId }));
    return errorResponse(502, "provider_error", "Could not start card checkout. Please try again.");
  }
}
