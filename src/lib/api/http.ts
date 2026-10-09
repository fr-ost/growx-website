import { NextResponse } from "next/server";
import { getAllowedExtensionOrigins } from "@/lib/env";

const BASE_HEADERS = { "Cache-Control": "no-store", Vary: "Origin, Authorization, Cookie" } as const;

/** CORS headers only for explicitly allowlisted extension origins. Never `*`, never credentials. */
export function corsHeaders(origin: string | null): Record<string, string> {
  if (origin && getAllowedExtensionOrigins().includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "600",
    };
  }
  return {};
}

export function json(body: unknown, init: { status?: number; origin?: string | null } = {}) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { ...BASE_HEADERS, ...corsHeaders(init.origin ?? null) },
  });
}

export function apiError(status: number, code: string, message: string, origin: string | null = null) {
  return json({ error: { code, message } }, { status, origin });
}

/** Extracts a bearer token without logging or echoing it. */
export function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const m = header.match(/^Bearer\s+([A-Za-z0-9._~+/=-]+)$/);
  return m ? m[1] : null;
}
