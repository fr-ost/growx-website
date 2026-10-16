import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/users?email=  : exact (case-insensitive) lookup of a GrowX account by email. Admin only. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const email = (request.nextUrl.searchParams.get("email") ?? "").trim();
  if (!email || email.length > 320 || !email.includes("@")) return errorResponse(400, "invalid_email", "Enter a full email address.");
  const { data, error } = await createAdminClient().rpc("admin_find_user", { p_admin: auth.user.id, p_email: email });
  if (error) return errorResponse(503, "unavailable", "Lookup failed. Try again.");
  const r = data as { status: string; user_id?: string; email?: string; created_at?: string };
  if (r.status !== "ok") return errorResponse(404, "user_not_found", "No GrowX account uses that email.");
  return jsonResponse({ userId: r.user_id, email: r.email, createdAt: r.created_at });
}
