// Pure, client-safe helpers (no database access).

/** Shown for a username linked to ANY other account. Reveals nothing about that account. */
export const X_USERNAME_TAKEN_MESSAGE = "This X username is already linked to another GrowX account.";

export const X_USERNAME_RE = /^[A-Za-z0-9_]{1,15}$/;

/** Mirrors public.x_username_display(): trim, drop ONE leading '@', validate. Normalized = lower case. */
export function normalizeXUsername(input: unknown): { username: string; normalizedUsername: string } | null {
  if (typeof input !== "string") return null;
  const v = input.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "").replace(/^@/, "");
  return X_USERNAME_RE.test(v) ? { username: v, normalizedUsername: v.toLowerCase() } : null;
}
