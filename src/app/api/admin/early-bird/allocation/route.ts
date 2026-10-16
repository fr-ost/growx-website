import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const body = z.object({ allocation: z.number().int().min(1).max(1000), reason: z.string().min(10).max(500) }).strict();

/** POST /api/admin/early-bird/allocation {allocation, reason}: exceptional, audited increase of the campaign allocation. Admin only. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { mutating: true });
  if (!auth.ok) return auth.response;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse(400, "invalid_request", "Enter a larger allocation and a reason of at least 10 characters.");
  const { data, error } = await createAdminClient().rpc("admin_increase_early_bird_allocation", {
    p_admin: auth.user.id,
    p_new_allocation: parsed.data.allocation,
    p_reason: parsed.data.reason,
  });
  if (error) return errorResponse(error.code === "42501" ? 404 : 503, error.code === "42501" ? "not_found" : "unavailable", "The change was not saved.");
  const r = data as { status: string; current?: number };
  if (r.status === "saved") return jsonResponse({ status: "saved" });
  if (r.status === "invalid_allocation") return errorResponse(400, "invalid_allocation", `The new allocation must be larger than ${r.current ?? "the current one"} and at most 1000.`);
  return errorResponse(400, r.status, "The change was not saved.");
}
