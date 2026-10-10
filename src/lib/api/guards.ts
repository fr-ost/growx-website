import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/user";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export const jsonResponse = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });
export const errorResponse = (status: number, code: string, message?: string) => jsonResponse({ error: { code, message: message ?? code } }, status);

/** State-changing browser calls must come from our own origin (defence in depth on top of SameSite cookies). */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return !!host && new URL(origin).host === host.split(",")[0].trim();
  } catch {
    return false;
  }
}

export type AuthResult = { ok: true; user: User } | { ok: false; response: NextResponse };

/** Verified session user (Supabase getUser). The user id is NEVER read from the request. */
export async function requireApiUser(request: NextRequest, opts: { mutating?: boolean; verifiedEmail?: boolean } = {}): Promise<AuthResult> {
  if (opts.mutating && !isSameOrigin(request)) return { ok: false, response: errorResponse(403, "bad_origin") };
  if (!isSupabaseConfigured()) return { ok: false, response: errorResponse(503, "not_configured") };
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: errorResponse(401, "unauthenticated") };
  if (opts.verifiedEmail && !user.email_confirmed_at) return { ok: false, response: errorResponse(403, "email_not_verified", "Confirm your email address before purchasing.") };
  return { ok: true, user };
}
