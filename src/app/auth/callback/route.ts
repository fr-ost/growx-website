import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validation/auth";

/**
 * OAuth and PKCE email-link callback: exchanges ?code= for a session cookie.
 * Redirects stay on the host that served this request, so the cookie that was
 * just set is visible on the next page.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = url.origin;
  const next = safeNextPath(url.searchParams.get("next"));

  // Supabase sends errors back as query params (e.g. an expired email link).
  const errCode = url.searchParams.get("error_code") ?? url.searchParams.get("error");
  if (errCode) {
    const reason = /expired/i.test(errCode) ? "link_expired" : "auth_callback";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }

  const code = url.searchParams.get("code");
  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    // Typical cause: link opened in a different browser than the one used to
    // sign up (PKCE verifier cookie missing). The email IS confirmed by then.
    return NextResponse.redirect(new URL("/login?error=link_other_browser", origin));
  }
  return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
}
