import type { FeatureSlug } from "./feature-slugs";

export type FeatureIcon = "target" | "calendar" | "wand" | "chart" | "users" | "userX" | "message";

/** A feature landing page at /features/<slug>. Inline text supports **bold**, `code` and [label](/path). */
export interface FeaturePage {
  slug: FeatureSlug;
  /** Short label for menus and cards, e.g. "Post scheduler". */
  nav: string;
  /** One line for menus and cards. */
  blurb: string;
  icon: FeatureIcon;
  /** <title> without the " | GrowX" suffix, at most 55 characters. */
  seoTitle: string;
  /** Meta description, 110-160 characters. */
  description: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  /** 1-2 sentences under the H1. */
  lead: string;
  image: { src: string; alt: string };
  /** Six short benefit cards. */
  highlights: { title: string; text: string; premium?: boolean }[];
  /** Three "how it works" steps. */
  steps: { title: string; text: string }[];
  /** Three or four deeper sections. */
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  plans: { free: string[]; premium: string[] };
  faq: { q: string; a: string }[];
  /** Blog post slugs to recommend. */
  relatedPosts: string[];
  /** Other feature pages to recommend. */
  related: FeatureSlug[];
}
