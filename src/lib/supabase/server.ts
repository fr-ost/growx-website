import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/env";

/** Cookie-session Supabase client for Server Components, actions and route handlers. */
export async function createClient() {
  const cfg = getSupabasePublicConfig();
  if (!cfg) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();
  return createServerClient(cfg.url, cfg.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes sessions instead.
        }
      },
    },
  });
}
