# SEO guide

What is implemented in code, the keyword strategy, and the steps only the site owner can do (search-console setup, listing alignment, link building). Nothing here guarantees a ranking: rankings depend on competition, content quality, backlinks and time.

## Target keywords (by page)
| Page | Primary | Secondary |
|---|---|---|
| `/` | X auto follow Chrome extension | Twitter auto follow tool, increase X followers, follow back score, Twitter unfollow tool |
| `/features` | X auto follow features | Twitter targeting filters, follow back score, Twitter cleanup tool, X growth analytics |
| `/how-it-works` | how X auto follow works | how to grow followers on X, X follow limits per day, safe Twitter auto follow |
| `/pricing` | GrowX pricing | free X auto follow, GrowX Premium, Twitter growth tool pricing |
| `/about` | about GrowX | GrowX developer, Shahriar Ahmed |
| `/blog/how-growx-auto-follow-works` | how X auto follow works | Twitter auto follow tool, X follow limits, Twitter follow back tool |
| `/blog/growx-features-guide-scoring-filters-cleanup` | follow back score | Twitter targeting filters, Twitter unfollow tool, mass unfollow Twitter, find inactive Twitter accounts |
| `/blog/growx-potential-best-practices-roadmap` | grow X followers | Twitter follower growth, X growth strategy, GrowX roadmap |

Both "X" and "Twitter" are used on purpose: many users still search "Twitter". Keywords are used naturally in titles, H1/H2s, first paragraphs and internal link text; no keyword stuffing, no hidden text.

## Implemented
- **Metadata** (`src/lib/seo.ts`): unique title (<=65 chars with suffix) and description (110-165 chars) per page, keywords, canonical URL, Open Graph (with image), Twitter `summary_large_image`, robots with large-snippet/image hints. Private pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/dashboard`, `/account`) are `noindex`.
- **Structured data** (JSON-LD, `src/components/json-ld.tsx`): `Organization` + `WebSite` (sitewide), `SoftwareApplication` (home, free offer only, **no fabricated ratings or review counts**), `FAQPage` (home, pricing, features, how-it-works), `HowTo` (how-it-works), `BreadcrumbList` (inner pages), `Blog` + `BlogPosting` with author (blog), `AboutPage` + `Person` (about).
- **Pages**: `/features` (detailed), `/how-it-works` (7 steps + pace table + FAQ), `/about`, `/blog` with 3 long-form articles (1,000+ words each), contact.
- **Technical**: `sitemap.xml` (all public pages + posts, per-post `lastModified`), `robots.txt` (blocks private areas, points at the sitemap), RSS feed `/blog/feed.xml`, web manifest, per-post Open Graph images (`/blog/<slug>/opengraph-image`), default social card, `lang="en"`, semantic headings (one H1 per page), breadcrumbs, internal linking between related pages, static prerendering (fast TTFB), security headers, `www` as canonical host.
- **Tests**: unit tests (`tests/seo.test.ts`) and a browser audit (`npm run test:e2e`) check every public page for title/description length, canonical, Open Graph/Twitter tags, valid JSON-LD, one H1, image alt text, noindex on private pages, sitemap/robots/feed, and per-post social images.

## Do this yourself (cannot be done from code)
1. **Google Search Console**: add `https://www.growxapp.org` as a URL-prefix property (or a Domain property via DNS). For the HTML-tag method set the env var `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel to the token (the `content` value), redeploy, then Verify. Submit `https://www.growxapp.org/sitemap.xml`.
2. **Bing Webmaster Tools**: import from Search Console, or set `NEXT_PUBLIC_BING_SITE_VERIFICATION` (the `msvalidate.01` value) and submit the sitemap.
3. **One canonical host**: in Vercel > Domains make `www.growxapp.org` primary and redirect `growxapp.org` to it (301).
4. **Request indexing** for `/`, `/features`, `/how-it-works`, `/pricing`, `/blog` and the three posts in Search Console's URL Inspection.
5. **Chrome Web Store listing**: reuse the same wording as the site (title "GrowX: X (Twitter) Auto Follow ...", description with the same keywords), add the website URL `https://www.growxapp.org`, and make sure the privacy text matches the extension's behaviour. The store page is itself a high-ranking result for these terms and links to the site.
6. **Check the live result** after deploy: Rich Results Test (search.google.com/test/rich-results) on `/`, `/how-it-works` and a blog post; PageSpeed Insights for Core Web Vitals; `curl -I https://www.growxapp.org/sitemap.xml`.
7. **Link building / distribution** (the biggest ranking lever, outside the codebase): share the guides on communities where X growth is discussed, list the extension on relevant directories, ask for genuine reviews on the Chrome Web Store, and publish new guides regularly.

## Content roadmap (suggested, not yet written)
Ideas that match real search intent and the product's actual capabilities: "X follow limits explained (per hour / per day)", "How to clean up your X following list safely", "Choosing source profiles that follow back", "X (Twitter) warm-up schedule for new accounts", "Free vs Premium: what you get". To add a post, append an entry to `src/content/posts.ts`; it appears in the blog, sitemap, RSS feed and gets its own social image automatically.

## Guardrails (keep these)
- No fake reviews, ratings, user counts, testimonials or "guaranteed results" in text or structured data (tests enforce the structured-data part).
- Label planned features as planned; keep claims consistent with the extension's actual behaviour.
- Do not add the paid prices as purchasable `Offer`s in structured data until checkout exists.
