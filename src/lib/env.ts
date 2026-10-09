/**
 * Environment access. Public values are read lazily so the site can still
 * build and render public pages without Supabase configured.
 */
export function getSupabasePublicConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export const isSupabaseConfigured = () => getSupabasePublicConfig() !== null;

export const googleAuthEnabled = () => process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

/** Exact origins (e.g. chrome-extension://<id>) allowed to call the API cross-origin. */
export function getAllowedExtensionOrigins(): string[] {
  return (process.env.ALLOWED_EXTENSION_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => /^chrome-extension:\/\/[a-p]{32}$/.test(o));
}
