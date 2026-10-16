import "server-only";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api/guards";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Administrators are the users listed in public.admins (editable only in the Supabase SQL Editor). The check always
 * runs on the server with the VERIFIED session user id; nothing from the browser (flags, hidden controls, body
 * fields) is trusted. The database functions behind every admin action check the same table again.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
    return !error && !!data;
  } catch {
    return false;
  }
}

export type AdminAuth = { ok: true; user: User } | { ok: false; response: NextResponse };

/** Session (active, same-origin for writes) + admin. Non-admins get 404 so the endpoints are not discoverable. */
export async function requireAdmin(request: NextRequest, opts: { mutating?: boolean } = {}): Promise<AdminAuth> {
  const auth = await requireApiUser(request, { mutating: opts.mutating, verifiedEmail: true });
  if (!auth.ok) return auth;
  if (!(await isAdmin(auth.user.id))) return { ok: false, response: errorResponse(404, "not_found") };
  return { ok: true, user: auth.user };
}
