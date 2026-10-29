# SEO guide

What is implemented in code, the keyword strategy, and the steps only the site owner can do (search-console setup, listing alignment, link building). Nothing here guarantees a ranking: rankings depend on competition, content quality, backlinks and time.

## Target keywords (by page)
Positioning since extension v2.4.4: **GrowX: The Ultimate X (Twitter) Growth Tool** (not only auto follow). Product facts for all copy: `docs/PRODUCT_FACTS.md`.

| Page | Primary | Secondary |
|---|---|---|
| `/` | X (Twitter) growth tool | how to grow on Twitter, Twitter auto follow, Twitter scheduler, AI tweet writer, Twitter analytics |
| `/features` | GrowX features | X growth tool features, Free vs Premium |
| `/features/twitter-auto-follow` | Twitter auto follow | X auto follow tool, auto follow Chrome extension, follow-back score |
| `/features/twitter-post-scheduler` | Twitter scheduler | schedule tweets, schedule posts on X free, thread scheduler |
| `/features/ai-tweet-writer` | AI tweet writer | AI tweet generator, AI for Twitter posts |
| `/features/twitter-analytics` | Twitter analytics | X analytics tool, best time to post on Twitter |
| `/features/twitter-unfollower-tracker` | Twitter unfollower tracker | who unfollowed me on Twitter, see who unfollowed you on X |
| `/features/twitter-unfollow-tool` | Twitter unfollow tool | mass unfollow Twitter, unfollow non-followers, unfollow inactive accounts |
| `/features/twitter-reply-targets` | Twitter engagement tool | reply to big accounts early, reply guy tool |
| `/tools/tweet-character-counter` | tweet character counter | Twitter character counter, X character count, 280 characters |
| `/tools/twitter-thread-maker` | Twitter thread maker | thread maker, split text into tweets |
| `/tools/twitter-engagement-rate-calculator` | Twitter engagement rate calculator | X engagement rate, tweet engagement rate |
| `/tools/twitter-follower-ratio-calculator` | Twitter follower ratio calculator | following to followers ratio, Twitter follow limit 5000 |
| `/tools/twitter-bold-text-generator` | Twitter bold text generator | bold text for Twitter, italic text Twitter, Twitter font generator |
| `/press` | GrowX press kit | GrowX logo, GrowX screenshots |
| `/how-it-works` | how to grow on Twitter with GrowX | Twitter growth routine, X follow limits per day |
| `/pricing` | GrowX pricing | free Twitter growth tool, free Twitter scheduler |
| `/blog` | Twitter growth blog | X growth guides, Twitter tips |
| Blog posts (28) | see each post's `keywords` in `src/content/posts*.ts` | how to schedule tweets, best time to post on Twitter, who unfollowed me on Twitter, Twitter analytics guide, Twitter reply strategy, how to increase Twitter engagement, how to write a Twitter thread, AI tweet generator, Twitter algorithm, how to go viral on Twitter, how often to post on Twitter, tweet ideas, Twitter hashtags, Twitter bio ideas, Twitter shadowban, follow for follow, Twitter follower ratio, Twitter Lists, plus the growth guides |

Both "X" and "Twitter" are used on purpose: many users still search "Twitter". Keywords are used naturally in titles, H1/H2s, first paragraphs and internal link text; no keyword stuffing, no hidden text.

## Implemented
- **Metadata** (`src/lib/seo.ts`): unique title (<=65 chars with suffix) and description (110-165 chars) per page, keywords, canonical URL, Open Graph (with image), Twitter `summary_large_image`, robots with large-snippet/image hints. Private pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/dashboard`, `/account`) are `noindex`.
- **Structured data** (JSON-LD, `src/components/json-ld.tsx`): `Organization` + `WebSite` (sitewide), `SoftwareApplication` (home, free offer only, **no fabricated ratings or review counts**), `FAQPage` (home, pricing, features, how-it-works), `HowTo` (how-it-works), `BreadcrumbList` (inner pages), `Blog` + `BlogPosting` with author (blog), `AboutPage` + `Person` (about).
- **Pages**: `/features` plus 7 feature landing pages (`/features/<slug>`, content in `src/content/feature-pages.ts`, WebPage + FAQPage + Breadcrumb JSON-LD), 5 free web tools (`/tools/...`, WebApplication JSON-LD) that attract links, a press kit (`/press`), `/how-it-works` (8 steps + pace table + FAQ), `/about`, `/blog` with 28 long-form articles (1,000+ words each, FAQPage when a post has `faq`), contact, and `/llms.txt` (a plain-text site map for AI assistants).
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
