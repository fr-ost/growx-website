const trim = (v: string | undefined) => (v ?? "").trim();

export const site = {
  name: "GrowX",
  tagline: "Auto follow for X (Twitter), at a human pace",
  description:
    "GrowX is a Chrome extension that helps you grow on X with targeted auto-follow, follow-back scoring, safe pacing and account cleanup tools. Core features are free.",
  url: trim(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, "") || "https://www.growxapp.org",
  /** Official Chrome Web Store listing (provided by the owner); override with the env var if it changes. */
  chromeStoreUrl:
    trim(process.env.NEXT_PUBLIC_CHROME_STORE_URL) ||
    "https://chromewebstore.google.com/detail/ofiancichfcakbdgekhcahflpoglfgbh",
  supportEmail: trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) || "support@growxapp.org",
  /** Contact channels already published by the extension itself (shared/config.js). */
  telegram: [
    { label: "Shahriar Ahmed", href: "https://t.me/igfrostt" },
    { label: "Mahfuz Allum", href: "https://t.me/mahfuzallum" },
  ],
  /** Shown in legal drafts. Provided by the owner. */
  legalName: "Shahriar Ahmed Tushar",
  legalAddress: "Rajshahi, Bangladesh",
} as const;
