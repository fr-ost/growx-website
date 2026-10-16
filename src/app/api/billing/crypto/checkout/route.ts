import type { NextRequest } from "next/server";
import { cryptoCheckoutBodySchema, type ProductId } from "@/lib/billing/catalog";
import { getEarlyBird } from "@/lib/billing/early-bird";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { startInvoiceCheckout } from "@/lib/billing/invoice";
import { errorResponse, requireApiUser } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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
  const requested = parsed.data.product;

  const status = nowPaymentsStatus();
  if (!status.available || !status.products.includes(requested)) return errorResponse(503, "checkout_unavailable", "Crypto checkout is not available yet.");

  const admin = createAdminClient();
  // The SERVER decides the price: lifetime buyers get the early-bird order while spots remain.
  const product: ProductId = requested === "PRO_LIFETIME" && (await getEarlyBird(admin)).state === "available" ? "PRO_LIFETIME_EARLY" : requested;
  return startInvoiceCheckout(admin, auth.user.id, product);
}
