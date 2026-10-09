const trim = (v: string | undefined) => (v ?? "").trim();

export const PRODUCTION_URL = "https://www.growxapp.org";

const isLocal = (u: string) => /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(u);

/**
 * Canonical site URL. In a Vercel production deployment a localhost value
 * (e.g. copied from .env.example) is ignored, so production metadata and auth
 * links can never point at localhost. Local development keeps localhost.
 */
export function resolveSiteUrl(raw: string | undefined, vercelEnv: string | undefined): string {
  const v = trim(raw).replace(/\/$/, "");
  if (!v || !/^https?:\/\//i.test(v)) return PRODUCTION_URL;
  if (vercelEnv === "production" && isLocal(v)) return PRODUCTION_URL;
  return v;
}

export const isLocalUrl = isLocal;

export const site = {
  name: "GrowX",
  tagline: "X (Twitter) Auto Follow Chrome Extension",
  /** Person shown in copyright, About and structured data. */
  author: "Shahriar Ahmed",
  authorUrl: "https://www.shahriarahmed.net",
  description:
    "GrowX is a free X (Twitter) auto follow Chrome extension. Find people likely to follow back, follow at a human pace with safety limits, track growth and clean up your account.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV),
  /** Official Chrome Web Store listing (provided by the owner); override with the env var if it changes. */
  chromeStoreUrl:
    trim(process.env.NEXT_PUBLIC_CHROME_STORE_URL) ||
    "https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh",
  supportEmail: trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) || "support@growxapp.org",
  /** Contact channel published by the extension itself (shared/config.js). */
  telegram: [
    { label: "Shahriar Ahmed", href: "https://t.me/igfrostt" },
  ],
  /** Shown in legal drafts. Provided by the owner. */
  legalName: "Shahriar Ahmed Tushar",
  legalAddress: "Rajshahi, Bangladesh",
} as const;
