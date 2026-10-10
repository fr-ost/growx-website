import type { NextRequest } from "next/server";
import { createPaddleClient } from "@/lib/billing/paddle";
import { paddleStatus } from "@/lib/billing/config";
import { errorResponse, jsonResponse, requireApiUser } from "@/lib/api/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET /api/billing/paddle/manage : Paddle-hosted "update payment method" link for the caller's own subscription. */
export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  if (!paddleStatus().available) return errorResponse(503, "billing_unavailable");

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", auth.user.id)
    .eq("provider", "paddle")
    .not("provider_subscription_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sub?.provider_subscription_id) return errorResponse(404, "no_subscription");

  try {
    const s = await createPaddleClient().subscriptions.get(sub.provider_subscription_id);
    return jsonResponse({ updatePaymentMethodUrl: s.managementUrls?.updatePaymentMethod ?? null });
  } catch {
    return errorResponse(502, "provider_error");
  }
}
