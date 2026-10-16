import type { NextRequest } from "next/server";
import { slotCheckoutBodySchema } from "@/lib/billing/catalog";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { startInvoiceCheckout } from "@/lib/billing/invoice";
import { errorResponse, requireApiUser } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/x-accounts/slots/checkout  {}
 * Buys ONE extra X account slot ($0.99, one-time) through a NOWPayments hosted invoice. The order is created
 * by the server for the session user with the server's price; the body must be empty (no quantity, amount or
 * slot count is accepted). The slot is granted only when a verified IPN reports the payment finished.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, { mutating: true, verifiedEmail: true });
  if (!auth.ok) return auth.response;
  if (!slotCheckoutBodySchema.safeParse(await request.json().catch(() => null)).success) return errorResponse(400, "invalid_request");
  if (!nowPaymentsStatus().available) return errorResponse(503, "checkout_unavailable", "Crypto checkout is not available right now.");
  return startInvoiceCheckout(createAdminClient(), auth.user.id, "X_ACCOUNT_SLOT");
}
