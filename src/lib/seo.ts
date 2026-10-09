import type { Metadata } from "next";
import { site } from "@/config/site";

/** Sitewide keyword set; pages add their own on top. */
export const baseKeywords = [
  "X auto follow",
  "Twitter auto follow",
  "auto follow Chrome extension",
  "grow X followers",
  "grow Twitter followers",
  "X growth tool",
  "Twitter growth tool",
  "follow back tool",
  "GrowX",
];

export const DEFAULT_OG_IMAGE = "/opengraph-image";

export interface PageSeo {
  /** <title> without the site suffix (the layout template adds " | GrowX"). Keep under ~55 chars. */
  title: string;
  /** Meta description, 120-160 chars. */
  description: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
  /** "article" adds published/modified times and the author. */
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Overrides the "| GrowX" suffix handling (home page). */
  absoluteTitle?: boolean;
  /** Pages with their own opengraph-image route (blog posts) set false; everything else gets the default card. */
  defaultImage?: boolean;
}

export function pageMetadata(opts: PageSeo): Metadata {
  const fullTitle = opts.absoluteTitle ? opts.title : `${opts.title} | ${site.name}`;
  // A page-level openGraph replaces the root one, so the default image must be repeated here.
  const images = opts.defaultImage === false ? undefined : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "GrowX: X (Twitter) auto follow Chrome extension" }];
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    keywords: [...new Set([...(opts.keywords ?? []), ...baseKeywords])],
    alternates: { canonical: opts.path },
    authors: [{ name: site.author, url: site.authorUrl }],
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url: opts.path,
      siteName: site.name,
      locale: "en_US",
      type: opts.type ?? "website",
      ...(images ? { images } : {}),
      ...(opts.type === "article"
        ? { publishedTime: opts.publishedTime, modifiedTime: opts.modifiedTime ?? opts.publishedTime, authors: [site.author] }
        : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: opts.description, ...(images ? { images: [DEFAULT_OG_IMAGE] } : {}) },
    robots: opts.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}
