import type { MetadataRoute } from "next";
import { site } from "@/config/site";

const paths = ["/", "/features", "/pricing", "/contact", "/login", "/signup", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.6 }));
}
