import "server-only";
import { headers } from "next/headers";
import { isLocalUrl, site } from "@/config/site";

/**
 * Pure origin resolution (exported for tests).
 *  - Normally the origin of the CURRENT request (www.growxapp.org, a preview
 *    URL, or http://localhost:3000 in development), so the PKCE cookie and the
 *    auth callback live on the same host.
 *  - In a Vercel production deployment the result is never localhost: it
 *    falls back to the canonical site URL.
 * Supabase still validates every redirect against its allowlist.
 */
export function resolveOrigin(
  h: { get(name: string): string | null },
  opts: { vercelEnv?: string; fallback: string },
): string {
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
  if (!host || !/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return opts.fallback;
  const local = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host);
  const fwdProto = (h.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  const proto = fwdProto === "http" || (!fwdProto && local) ? "http" : "https";
  const origin = `${proto}://${host}`;
  if (opts.vercelEnv === "production" && isLocalUrl(origin)) return opts.fallback;
  return origin;
}

export async function requestOrigin(): Promise<string> {
  return resolveOrigin(await headers(), { vercelEnv: process.env.VERCEL_ENV, fallback: site.url });
}
