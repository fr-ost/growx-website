import { site } from "@/config/site";

/** Serialises structured data safely for an inline <script> (escapes "<" so content can't close the tag). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export const abs = (path: string) => `${site.url}${path === "/" ? "" : path}`;

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export const authorLd = { "@type": "Person", name: site.author, url: site.authorUrl };

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.png`,
  email: site.supportEmail,
  founder: authorLd,
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  name: site.name,
  url: site.url,
  description: site.description,
  inLanguage: "en",
  publisher: { "@id": `${site.url}/#organization` },
};

/** Only truthful facts: a free extension. No ratings, reviews or user counts. */
export const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${site.url}/#software`,
  name: "GrowX: The Ultimate X (Twitter) Growth Tool",
  alternateName: "GrowX",
  description: site.description,
  applicationCategory: "BrowserApplication",
  applicationSubCategory: "Social media growth tool",
  softwareVersion: "2.4.4",
  operatingSystem: "Chrome (Windows, macOS, Linux, ChromeOS)",
  browserRequirements: "Requires Google Chrome 116 or newer",
  url: site.url,
  ...(site.chromeStoreUrl ? { downloadUrl: site.chromeStoreUrl, installUrl: site.chromeStoreUrl } : {}),
  author: authorLd,
  publisher: { "@id": `${site.url}/#organization` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free plan with core features" },
  featureList: [
    "Smart auto follow from source profiles with a follow-back score from 1 to 99",
    "Human-like pacing with hourly and daily caps, warm-up and automatic slow-down",
    "Post and thread scheduler with queue slots and best time to post",
    "GrowX AI writer that runs on your computer",
    "Post analytics, topics and formats that work",
    "Unfollower tracker: who followed and who unfollowed you",
    "Reply targets to reply early to fresh posts in your niche",
    "Cleanup of non-followers and inactive accounts",
  ],
};
