import { z } from "zod";

// Paths on x.com that are not profiles (mirrors the extension's cleanHandle).
const RESERVED = new Set([
  "home", "explore", "notifications", "messages", "settings", "i", "search",
  "compose", "intent", "share", "login", "logout", "signup", "tos", "privacy",
]);

/**
 * Accepts "name", "@name" or an x.com / twitter.com profile URL.
 * The result is SELF-REPORTED: it is never proof the user controls that account.
 */
export function parseXUsername(raw: string): { username: string; normalized: string } | null {
  let h = String(raw ?? "").trim();
  const m = h.match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter|x)\.com\/@?([A-Za-z0-9_]{1,15})(?:[/?#].*)?$/i);
  if (m) h = m[1];
  h = h.replace(/^@+/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(h)) return null;
  if (RESERVED.has(h.toLowerCase())) return null;
  return { username: h, normalized: h.toLowerCase() };
}

export const xUsernameSchema = z
  .string()
  .max(200)
  .transform((v, ctx) => {
    const parsed = parseXUsername(v);
    if (!parsed) {
      ctx.addIssue({ code: "custom", message: "Enter a valid X username (letters, numbers, underscore; max 15)." });
      return z.NEVER;
    }
    return parsed;
  });
