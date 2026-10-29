import { featurePages } from "@/content/feature-pages";
import { latestFirst } from "@/content/posts";
import { pricingTiers, TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";

export const dynamic = "force-static";

/** /llms.txt: a plain-text map of the site for AI assistants and answer engines (llmstxt.org). */
export function GET() {
  const prices = pricingTiers.filter((t) => t.priceCents).map((t) => `${t.name}: ${t.priceLabel} ${t.cadence}`).join("; ");
  const body = [
    `# ${site.name}: ${site.tagline}`,
    "",
    `> ${site.description}`,
    "",
    `GrowX is a Chrome extension (desktop Chrome 116+) by ${site.author}. It works inside the user's own signed-in x.com session and never asks for the X password. Data stays in the browser; the GrowX AI writer runs on the user's computer with the AI model built into Chrome. Free plan forever; ${TRIAL_DAYS}-day Premium trial with no credit card. Premium: ${prices}. Prepaid, no automatic renewal.`,
    "",
    "## Features",
    ...featurePages.map((f) => `- [${f.nav}](${site.url}/features/${f.slug}): ${f.blurb}`),
    "",
    "## Key pages",
    `- [Home](${site.url}/)`,
    `- [All features](${site.url}/features)`,
    `- [How it works](${site.url}/how-it-works)`,
    `- [Pricing](${site.url}/pricing)`,
    `- [Free tools](${site.url}/tools): tweet character counter, Twitter thread maker`,
    `- [Chrome Web Store](${site.chromeStoreUrl})`,
    "",
    "## Guides",
    ...latestFirst().map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.description}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
