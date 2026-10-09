import "server-only";
import { headers } from "next/headers";
import { site } from "@/config/site";

/**
 * Origin of the CURRENT request (e.g. https://www.growxapp.org, a Vercel
 * preview URL, or http://localhost:3000). Used for auth redirect URLs so that
 * the session cookie and the redirect always live on the same host, whatever
 * domain the deployment is served from. Supabase still checks every redirect
 * against its allowlist, so a forged Host header cannot redirect users away.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host || !/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return site.url;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto === "http" ? "http" : "https"}://${host}`;
}
