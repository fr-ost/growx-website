/**
 * Environment access. Public values are read lazily so the site can still
 * build and render public pages without Supabase configured.
 */
const first = (...vals: Array<string | undefined>) => vals.map((v) => v?.trim()).find((v) => !!v);

/**
 * Accepts both the names in .env.example and the names the Vercel <-> Supabase
 * integration creates (NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_URL, ...).
 * NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them.
 */
export function getSupabasePublicConfig(): { url: string; key: string } | null {
  const url = first(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL);
  const key = first(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
  );
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

/** Server-only secret. Accepts the legacy service_role key or the new secret key. */
export function getSupabaseServiceKey(): string | null {
  return first(process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SECRET_KEY) ?? null;
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
