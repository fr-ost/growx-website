import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/env";

const PROTECTED_PREFIXES = ["/dashboard", "/account"];

export const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Refreshes the Supabase session cookies and redirects signed-out visitors away
 * from protected pages. This is an optimisation and a UX redirect only: every
 * protected page and API route re-verifies the user on the server.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    if (isProtectedPath(request.nextUrl.pathname)) return redirectToLogin(request);
    return response;
  }

  const supabase = createServerClient(cfg.url, cfg.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && isProtectedPath(request.nextUrl.pathname)) {
    const redirect = redirectToLogin(request);
    // Preserve any cookies Supabase just cleared/refreshed.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  const next = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}
