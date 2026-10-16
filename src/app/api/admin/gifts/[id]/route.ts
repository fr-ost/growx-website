import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { GIFT_DURATION_IDS } from "@/lib/admin/durations";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("extend"), duration: z.enum(GIFT_DURATION_IDS), reason: z.string().max(500).optional() }).strict(),
  z.object({ action: z.literal("revoke"), reason: z.string().max(500).optional() }).strict(),
]);

const MESSAGES: Record<string, [number, string]> = {
  not_found: [404, "Gift not found."],
  revoked: [409, "This gift was revoked; grant a new one instead."],
  already_lifetime: [409, "This gift is already lifetime."],
  other_gift_active: [409, "The user has another running gift."],
  already_revoked: [409, "This gift is already revoked."],
  invalid_duration: [400, "Choose a duration."],
};

/** POST /api/admin/gifts/:id {action:"extend", duration, reason?} | {action:"revoke", reason?}. Admin only; audited. */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return errorResponse(404, "not_found");
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request");
  const admin = createAdminClient();
  const { data, error } =
    parsed.data.action === "extend"
      ? await admin.rpc("admin_extend_gift", { p_admin: auth.user.id, p_gift: id, p_duration: parsed.data.duration, p_reason: parsed.data.reason ?? null })
      : await admin.rpc("admin_revoke_gift", { p_admin: auth.user.id, p_gift: id, p_reason: parsed.data.reason ?? null });
  if (error) return errorResponse(error.code === "42501" ? 404 : 503, error.code === "42501" ? "not_found" : "unavailable", "The change was not saved.");
  const r = data as { status: string; expires_at?: string | null };
  if (r.status !== "extended" && r.status !== "revoked") {
    const [code, message] = MESSAGES[r.status] ?? [400, "The change was not saved."];
    return errorResponse(code, r.status, message);
  }
  if (r.status === "revoked" && parsed.data.action !== "revoke") return errorResponse(409, "revoked", MESSAGES.revoked[1]);
  return jsonResponse({ status: r.status, expiresAt: r.expires_at ?? null });
}
