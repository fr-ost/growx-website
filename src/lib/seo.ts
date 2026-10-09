import type { Metadata } from "next";
import { site } from "@/config/site";

export function pageMetadata(opts: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: `${opts.title} | ${site.name}`,
      description: opts.description,
      url: opts.path,
      siteName: site.name,
      type: "website",
    },
    twitter: { card: "summary", title: `${opts.title} | ${site.name}`, description: opts.description },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}
