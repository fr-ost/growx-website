import type { NextRequest } from "next/server";
import { createPaddleClient } from "@/lib/billing/paddle";
import { paddleStatus } from "@/lib/billing/config";
import { errorResponse, jsonResponse, requireApiUser } from "@/lib/api/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/paddle/cancel : cancels the caller's own card subscription
 * at the end of the paid period. The subscription row is only changed when
 * Paddle's verified webhook confirms it.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request, { mutating: true });
  if (!auth.ok) return auth.response;
  if (!paddleStatus().available) return errorResponse(503, "billing_unavailable");

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", auth.user.id)
    .eq("provider", "paddle")
    .in("status", ["active", "past_due"])
    .is("access_revoked_at", null)
    .not("provider_subscription_id", "is", null)
    .limit(1)
    .maybeSingle();
  if (!sub?.provider_subscription_id) return errorResponse(404, "no_subscription", "No active card subscription found.");

  try {
    await createPaddleClient().subscriptions.cancel(sub.provider_subscription_id, { effectiveFrom: "next_billing_period" });
    return jsonResponse({ ok: true, message: "Cancellation requested. You keep Premium until the end of the paid period; this page updates when Paddle confirms." }, 202);
  } catch {
    return errorResponse(502, "provider_error", "Could not request cancellation. Please try again.");
  }
}
