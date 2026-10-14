/**
 * Reads claims from a JWT WITHOUT verifying it. Only call this on a token that Supabase Auth has
 * just verified (auth.getUser(token) succeeded). Never use the result to authenticate anything.
 */
export interface TokenClaims {
  sub?: string;
  session_id?: string;
  exp?: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function decodeJwtClaims(token: string): TokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const c = JSON.parse(json) as Record<string, unknown>;
    return {
      sub: typeof c.sub === "string" ? c.sub : undefined,
      session_id: typeof c.session_id === "string" && UUID.test(c.session_id) ? c.session_id : undefined,
      exp: typeof c.exp === "number" ? c.exp : undefined,
    };
  } catch {
    return null;
  }
}
