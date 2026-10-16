import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const body = z
  .object({
    remaining: z.number().int().min(0).max(1000),
    enabled: z.boolean(),
    reason: z.string().max(500).optional(),
    expectedUpdatedAt: z.string().max(64).optional(),
  })
  .strict();

/**
 * POST /api/admin/early-bird {remaining, enabled, reason?, expectedUpdatedAt?}
 * Sets the remaining early-bird spots and/or enables/disables the offer. Successful sales are never reset; existing
 * lifetime owners and open (unexpired) reservations are unaffected. Admin only; audited in the database.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mutating: true });
  if (!auth.ok) return auth.response;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request", "Remaining must be a whole number of 0 or more.");
  const { data, error } = await createAdminClient().rpc("admin_set_early_bird", {
    p_admin: auth.user.id,
    p_remaining: parsed.data.remaining,
    p_enabled: parsed.data.enabled,
    p_reason: parsed.data.reason ?? null,
    p_expected_updated_at: parsed.data.expectedUpdatedAt ?? null,
  });
  if (error) return errorResponse(error.code === "42501" ? 404 : 503, error.code === "42501" ? "not_found" : "unavailable", "The change was not saved.");
  const r = data as { status: string; max_remaining?: number };
  if (r.status === "saved") return jsonResponse({ status: "saved" });
  if (r.status === "stale") return errorResponse(409, "stale", "Someone changed the offer meanwhile. Reload and try again.");
  if (r.status === "exceeds_allocation")
    return errorResponse(409, "exceeds_allocation", `At most ${r.max_remaining ?? 0} spots can remain within the campaign allocation. Increasing the allocation is a separate action.`);
  return errorResponse(400, r.status, "The change was not saved.");
}
