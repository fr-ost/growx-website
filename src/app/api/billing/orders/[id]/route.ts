import type { NextRequest } from "next/server";
import { getNowPayment } from "@/lib/billing/nowpayments";
import { reconcileCryptoOrder } from "@/lib/billing/service";
import { errorResponse, jsonResponse, requireApiUser } from "@/lib/api/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const lastCheck = new Map<string, number>(); // per-instance throttle for provider API calls
const COLS = "id, provider, product, status, provider_ref, reservation_expires_at, fulfilled_at, created_at";

/**
 * GET /api/billing/orders/:id : status of the caller's OWN order (RLS enforced).
 * "fulfilled" is the only state that means Premium was granted, and it is set
 * exclusively by verified provider events.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser(request);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return errorResponse(404, "not_found");

  const supabase = await createClient(); // user-scoped: RLS only returns the caller's rows
  const read = async () => (await supabase.from("checkout_orders").select(COLS).eq("id", id).eq("user_id", auth.user.id).maybeSingle()).data;
  let order = await read();
  if (!order) return errorResponse(404, "not_found");

  let providerPayment: Awaited<ReturnType<typeof getNowPayment>> | null = null;
  if (order.provider === "nowpayments" && ["created", "pending"].includes(order.status) && order.provider_ref) {
    const now = Date.now();
    if (now - (lastCheck.get(order.id) ?? 0) > 15_000) {
      lastCheck.set(order.id, now);
      try {
        providerPayment = await reconcileCryptoOrder(createAdminClient(), order, getNowPayment);
        order = (await read()) ?? order;
      } catch {
        /* provider temporarily unreachable: report the stored state */
      }
    }
  }

  const { data: payment } = await supabase.from("payments").select("status, provider_status").eq("order_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return jsonResponse({
    id: order.id,
    provider: order.provider,
    product: order.product,
    status: order.status,
    paymentStatus: payment?.status ?? null,
    providerStatus: payment?.provider_status ?? null,
    expiresAt: order.reservation_expires_at,
    crypto: providerPayment
      ? { address: providerPayment.pay_address ?? null, amount: providerPayment.pay_amount ?? null, currency: providerPayment.pay_currency ?? null, actuallyPaid: providerPayment.actually_paid ?? null, network: providerPayment.network ?? null }
      : null,
  });
}
