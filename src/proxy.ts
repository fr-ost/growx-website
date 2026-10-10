import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only pages that need a session. Public pages stay static; /api/* does its own auth.
  matcher: ["/dashboard/:path*", "/account/:path*", "/checkout/:path*", "/checkout"],
};
