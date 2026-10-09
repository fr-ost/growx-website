import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { posts, getPost } from "@/content/posts";
import { serializeJsonLd, faqLd, breadcrumbLd, softwareLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as feed } from "@/app/blog/feed.xml/route";
import { site } from "@/config/site";

const appDir = path.resolve(import.meta.dirname, "../src/app");
const routeExists = (p: string) => {
  const clean = p.split("#")[0].replace(/\/$/, "") || "/";
  if (clean === "/") return true;
  const blog = clean.match(/^\/blog\/([^/]+)$/);
  if (blog) return !!getPost(blog[1]);
  return existsSync(path.join(appDir, clean, "page.tsx")) || existsSync(path.join(appDir, clean, "route.ts"));
};

const linksIn = (text: string) => [...text.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);

describe("blog content", () => {
  it("has 2-3+ posts with unique slugs", () => {
    expect(posts.length).toBeGreaterThanOrEqual(3);
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
  });

  it.each(posts.map((p) => [p.slug, p] as const))("%s has SEO-sized metadata and valid structure", (_s, p) => {
    expect(p.seoTitle.length).toBeLessThanOrEqual(60);
    expect(p.description.length).toBeGreaterThanOrEqual(110);
    expect(p.description.length).toBeLessThanOrEqual(160);
    expect(p.title.length).toBeGreaterThan(30);
    expect(p.keywords.length).toBeGreaterThanOrEqual(4);
    expect(p.sections.length).toBeGreaterThanOrEqual(5);
    expect(new Set(p.sections.map((s) => s.id)).size).toBe(p.sections.length);
    const words = JSON.stringify(p.sections).split(/\s+/).length;
    expect(words).toBeGreaterThan(700);
    expect(p.related.every((r) => !!getPost(r) && r !== p.slug)).toBe(true);
  });

  it("every internal link in posts points to an existing route", () => {
    const bad: string[] = [];
    for (const p of posts) for (const l of linksIn(JSON.stringify(p.sections))) if (!routeExists(l)) bad.push(`${p.slug} -> ${l}`);
    expect(bad).toEqual([]);
  });

  it("makes no fabricated claims (ratings, user counts, guarantees)", () => {
    const text = JSON.stringify(posts).toLowerCase();
    for (const bad of ["guaranteed followers", "10,000 users", "5-star", "rated 4", "trusted by", "join thousands", "mahfuz", "allum"]) expect(text).not.toContain(bad);
  });
});

describe("pageMetadata", () => {
  it("builds title, canonical, OG, Twitter large card and merges keywords", () => {
    const m = pageMetadata({ title: "Test", description: "d", path: "/x", keywords: ["custom"] });
    expect(m.title).toBe("Test");
    expect(m.alternates?.canonical).toBe("/x");
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(m.keywords).toContain("custom");
    expect(m.keywords).toContain("X auto follow");
  });
  it("noindex pages are excluded; articles carry dates and author", () => {
    expect(pageMetadata({ title: "t", description: "d", path: "/p", noindex: true }).robots).toEqual({ index: false, follow: false });
    const a = pageMetadata({ title: "t", description: "d", path: "/p", type: "article", publishedTime: "2026-10-09" });
    expect(a.openGraph).toMatchObject({ type: "article", publishedTime: "2026-10-09", authors: [site.author] });
  });
  it("repeats the default social image on every normal page (page openGraph replaces the root one)", () => {
    const m = pageMetadata({ title: "t", description: "d", path: "/p" });
    expect(JSON.stringify(m.openGraph)).toContain("/opengraph-image");
    expect(JSON.stringify(m.twitter)).toContain("/opengraph-image");
    expect(JSON.stringify(pageMetadata({ title: "t", description: "d", path: "/b", defaultImage: false }).openGraph)).not.toContain("images");
  });
  it("absolute title skips the template", () => {
    expect(pageMetadata({ title: "Home", absoluteTitle: true, description: "d", path: "/" }).title).toEqual({ absolute: "Home" });
  });
});

describe("sitemap, robots and feed", () => {
  const urls = sitemap().map((s) => s.url);
  it("lists public pages and every post, but no private or noindex pages", () => {
    for (const p of ["", "/features", "/how-it-works", "/pricing", "/blog", "/about", "/contact"]) expect(urls).toContain(`${site.url}${p}`);
    for (const p of posts) expect(urls).toContain(`${site.url}/blog/${p.slug}`);
    for (const bad of ["/dashboard", "/account", "/login", "/signup", "/reset-password", "/api"]) expect(urls.some((u) => u.includes(bad))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
  it("every sitemap URL maps to a real route", () => {
    for (const u of urls) expect(routeExists(new URL(u).pathname)).toBe(true);
  });
  it("robots allows crawling, blocks private areas and points at the sitemap", () => {
    const r = robots();
    expect(JSON.stringify(r.rules)).toContain("/dashboard");
    expect(r.sitemap).toBe(`${site.url}/sitemap.xml`);
  });
  it("RSS feed is valid-looking XML with all posts", async () => {
    const xml = await feed().text();
    expect(xml.startsWith("<?xml")).toBe(true);
    for (const p of posts) expect(xml).toContain(`${site.url}/blog/${p.slug}`);
  });
});

describe("structured data", () => {
  it("escapes < so content cannot break out of the script tag", () => {
    const s = serializeJsonLd({ a: "</script><script>alert(1)</script>" });
    expect(s).not.toContain("</script>");
    expect(JSON.parse(s).a).toContain("</script>");
  });
  it("software markup is free-only with no ratings or review counts", () => {
    const text = JSON.stringify(softwareLd);
    expect(text).not.toMatch(/aggregateRating|ratingValue|reviewCount|review"/);
    expect(softwareLd.offers.price).toBe("0");
  });
  it("faq and breadcrumb builders produce schema.org shapes", () => {
    expect(faqLd([{ q: "Q", a: "A" }]).mainEntity[0]).toMatchObject({ "@type": "Question", name: "Q" });
    expect(breadcrumbLd([{ name: "Home", path: "/" }, { name: "B", path: "/b" }]).itemListElement[1].position).toBe(2);
  });
});

describe("no leftovers", () => {
  it("source contains no references to removed people", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const full = path.join(dir, f);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(tsx?|md)$/.test(f) && /mahfuz|allum/i.test(require_text(full))) hits.push(full);
      }
    };
    walk(path.resolve(import.meta.dirname, "../src"));
    expect(hits).toEqual([]);
  });
});

import { readFileSync } from "node:fs";
function require_text(f: string) {
  return readFileSync(f, "utf8");
}
