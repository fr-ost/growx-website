const trim = (v: string | undefined) => (v ?? "").trim();

export const site = {
  name: "GrowX",
  tagline: "Auto follow for X (Twitter), at a human pace",
  description:
    "GrowX is a Chrome extension that helps you grow on X with targeted auto-follow, follow-back scoring, safe pacing and account cleanup tools. Core features are free.",
  url: trim(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, "") || "http://localhost:3000",
  /** Null until a real Chrome Web Store URL is configured. Never invent one. */
  chromeStoreUrl: trim(process.env.NEXT_PUBLIC_CHROME_STORE_URL) || null,
  supportEmail: trim(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) || null,
  /** Contact channels already published by the extension itself (shared/config.js). */
  telegram: [
    { label: "Shahriar Ahmed", href: "https://t.me/igfrostt" },
    { label: "Mahfuz Allum", href: "https://t.me/mahfuzallum" },
  ],
  /** Shown in legal drafts. Real legal identity is a pending business decision. */
  legalName: null as string | null,
} as const;
