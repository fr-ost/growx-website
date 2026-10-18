import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, jsonResponse } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/x-accounts?email= : a user's linked X usernames (active and released) and their change history. Admin only. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const email = (request.nextUrl.searchParams.get("email") ?? "").trim();
  if (!email || email.length > 320 || !email.includes("@")) return errorResponse(400, "invalid_email", "Enter a full email address.");
  const admin = createAdminClient();
  const found = await admin.rpc("admin_find_user", { p_admin: auth.user.id, p_email: email });
  if (found.error) return errorResponse(503, "unavailable", "Lookup failed. Try again.");
  const u = found.data as { status: string; user_id?: string; email?: string };
  if (u.status !== "ok" || !u.user_id) return errorResponse(404, "user_not_found", "No GrowX account uses that email.");

  const [b, e] = await Promise.all([
    admin.from("x_account_bindings").select("id, username, normalized_username, status, linked_by, created_at, released_at, released_by, release_reason").eq("user_id", u.user_id).order("created_at", { ascending: true }),
    admin.from("x_account_binding_events").select("id, action, username, actor, reason, created_at").eq("user_id", u.user_id).order("id", { ascending: false }).limit(50),
  ]);
  if (b.error || e.error) return errorResponse(503, "unavailable", "X accounts could not be loaded.");
  return jsonResponse({ userId: u.user_id, email: u.email, bindings: b.data ?? [], events: e.data ?? [] });
}
