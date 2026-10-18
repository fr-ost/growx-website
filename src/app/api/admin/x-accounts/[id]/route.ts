import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("replace"), newUsername: z.string().min(1).max(64), reason: z.string().min(10).max(500) }).strict(),
  z.object({ action: z.literal("release"), reason: z.string().min(10).max(500) }).strict(),
]);

const MESSAGES: Record<string, [number, string]> = {
  not_found: [404, "That linked username no longer exists."],
  not_active: [409, "This username was already changed or unlinked."],
  invalid_username: [400, "Enter a valid X username: 1 to 15 letters, numbers or underscores."],
  unchanged: [409, "That is already the linked username."],
  taken: [409, "This X username is already linked to another GrowX account."],
  reason_required: [400, "Give a reason of at least 10 characters."],
};

/**
 * POST /api/admin/x-accounts/:bindingId {action:"replace", newUsername, reason} | {action:"release", reason}
 * Corrects or unlinks a user's linked X username. Atomic, globally unique, audited with the admin and reason. Admin only.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request, { mutating: true });
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return errorResponse(404, "not_found");
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request", "Enter the new username (for a change) and a reason of at least 10 characters.");
  const { data, error } = await createAdminClient().rpc("admin_change_x_account", {
    p_admin: auth.user.id,
    p_binding_id: id,
    p_action: parsed.data.action,
    p_reason: parsed.data.reason,
    p_new_username: parsed.data.action === "replace" ? parsed.data.newUsername : null,
  });
  if (error) return errorResponse(error.code === "42501" ? 404 : 503, error.code === "42501" ? "not_found" : "unavailable", "The change was not saved.");
  const r = data as { status: string };
  if (r.status === "replaced" || r.status === "released") return jsonResponse({ status: r.status });
  const [code, message] = MESSAGES[r.status] ?? [400, "The change was not saved."];
  return errorResponse(code, r.status, message);
}
