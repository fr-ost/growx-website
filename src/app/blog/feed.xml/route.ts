import { latestFirst } from "@/content/posts";
import { site } from "@/config/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const dynamic = "force-static";

export function GET() {
  const items = latestFirst()
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${p.datePublished}T00:00:00Z`).toUTCString()}</pubDate><category>${esc(p.category)}</category><description>${esc(p.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>GrowX Blog</title><link>${site.url}/blog</link><description>Guides on X (Twitter) growth, auto follow, targeting and cleanup from the GrowX developer.</description><language>en</language><atom:link href="${site.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
