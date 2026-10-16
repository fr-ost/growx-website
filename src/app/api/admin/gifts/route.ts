import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { GIFT_DURATION_IDS } from "@/lib/admin/durations";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const body = z
  .object({
    userId: z.string().uuid(),
    duration: z.enum(GIFT_DURATION_IDS),
    reason: z.string().max(500).optional(),
  })
  .strict();

const MESSAGES: Record<string, [number, string]> = {
  user_not_found: [404, "That account no longer exists."],
  active_gift_exists: [409, "This user already has a running gift. Extend it instead."],
  invalid_duration: [400, "Choose a duration."],
};

/** POST /api/admin/gifts {userId, duration, reason?} : grant complimentary Premium now. Admin only; audited in the database. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mutating: true });
  if (!auth.ok) return auth.response;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request");
  const { data, error } = await createAdminClient().rpc("admin_grant_gift", {
    p_admin: auth.user.id,
    p_user: parsed.data.userId,
    p_duration: parsed.data.duration,
    p_reason: parsed.data.reason ?? null,
  });
  if (error) return errorResponse(error.code === "42501" ? 404 : 503, error.code === "42501" ? "not_found" : "unavailable", "Could not grant the gift.");
  const r = data as { status: string; gift_id?: string; expires_at?: string | null };
  if (r.status !== "granted") {
    const [code, message] = MESSAGES[r.status] ?? [400, "Could not grant the gift."];
    return errorResponse(code, r.status, message);
  }
  return jsonResponse({ status: "granted", giftId: r.gift_id, expiresAt: r.expires_at ?? null }, 201);
}
