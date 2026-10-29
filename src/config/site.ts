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
  tagline: "The Ultimate X (Twitter) Growth Tool",
  /** Person shown in copyright, About and structured data. */
  author: "Shahriar Ahmed",
  authorUrl: "https://www.shahriarahmed.net",
  description:
    "GrowX is the all-in-one X (Twitter) growth tool for Chrome: smart auto follow, a post scheduler, an on-device AI writer, analytics, an unfollower tracker and cleanup.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV),
  /** Official Chrome Web Store listing (provided by the owner); override with the env var if it changes. */
  chromeStoreUrl:
    trim(process.env.NEXT_PUBLIC_CHROME_STORE_URL) ||
    "https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh",
  supportEmail: trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) || "support@growxapp.org",
  /** Google tag (Google Ads) ID, provided by the owner. Loaded only on the production deployment. */
  googleTagId: trim(process.env.NEXT_PUBLIC_GOOGLE_TAG_ID) || "AW-18494416712",
  /** Google Ads conversion actions ("AW-ID/label"). Sign-up is off until its label is provided. */
  googleConversions: {
    purchase: trim(process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE) || "AW-18494416712/XJfkCPCv4aEdEMjO6fJE",
    signup: trim(process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP),
  },
  /** Contact channel published by the extension itself (shared/config.js). */
  telegram: [
    { label: "Shahriar Ahmed", href: "https://t.me/igfrostt" },
  ],
  /** Shown in legal drafts. Provided by the owner. */
  legalName: "Shahriar Ahmed Tushar",
  legalAddress: "Rajshahi, Bangladesh",
} as const;
