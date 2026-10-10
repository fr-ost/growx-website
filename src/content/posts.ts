/**
 * Blog content. Facts come from the GrowX extension v2.3.0 source (presets,
 * filters, scoring signals, cleanup rules). Anything not shipped is labelled
 * "planned". No statistics, testimonials or result promises are invented.
 *
 * Inline syntax in text: [label](/path) internal/external link, **bold**.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string };

export interface PostSection {
  id: string;
  heading: string;
  blocks: Block[];
}

export interface Post {
  slug: string;
  /** <title> text (without the " | GrowX" suffix). */
  seoTitle: string;
  /** On-page H1. */
  title: string;
  /** Meta description, 120-160 chars. */
  description: string;
  excerpt: string;
  category: "How it works" | "Features" | "Roadmap";
  keywords: string[];
  datePublished: string;
  dateModified: string;
  readMinutes: number;
  sections: PostSection[];
  /** Slugs of related posts. */
  related: string[];
}

export const posts: Post[] = [
  {
    slug: "how-growx-auto-follow-works",
    seoTitle: "How X Auto Follow Works: GrowX Engine Explained",
    title: "How GrowX Auto Follow Works: The Complete Guide to the X (Twitter) Follow Engine",
    description:
      "A step-by-step look at how the GrowX Chrome extension finds, scores and follows people on X (Twitter) at a human pace, with caps, breaks and safety stops.",
    excerpt:
      "From source profiles to scoring, pacing, safety stops and follow-back tracking: exactly what happens when you press Start in GrowX.",
    category: "How it works",
    keywords: [
      "how X auto follow works",
      "Twitter auto follow tool",
      "auto follow Chrome extension",
      "X follow limits",
      "safe Twitter auto follow",
      "Twitter follow back tool",
    ],
    datePublished: "2026-10-09",
    dateModified: "2026-10-09",
    readMinutes: 9,
    related: ["growx-features-guide-scoring-filters-cleanup", "growx-potential-best-practices-roadmap"],
    sections: [
      {
        id: "overview",
        heading: "What an X auto follow tool should (and should not) do",
        blocks: [
          {
            type: "p",
            text: "Searching for an **X auto follow** or **Twitter auto follow** tool usually leads to two kinds of products: aggressive scripts that follow as fast as possible, and careful assistants that behave more like a person. GrowX is built to be the second kind. It is a Chrome extension that works inside your own signed-in x.com session, follows accounts one at a time, and slows down or stops the moment X shows a warning.",
          },
          {
            type: "p",
            text: "This guide walks through the whole pipeline in the order GrowX runs it: choosing sources, harvesting candidates, filtering and scoring them, pacing the follows, protecting your account, and measuring who followed back. Everything described here reflects the current extension (version 2.3.0). For a feature-by-feature reference see the [GrowX features page](/features), and for the short version see [How it works](/how-it-works).",
          },
          {
            type: "note",
            text: "No tool can promise zero risk on X, and results depend on your niche, your content and your account. GrowX is designed to respect the limits X signals, but you remain responsible for following X's rules.",
          },
        ],
      },
      {
        id: "sources",
        heading: "Step 1: Pick source profiles in your niche",
        blocks: [
          {
            type: "p",
            text: "Everything starts with **source profiles**: accounts that your ideal audience already follows, such as creators, brands or communities in your niche. GrowX reads each source's **newest followers**, because people who followed an account recently are active right now and have already shown interest in your topic.",
          },
          {
            type: "ul",
            items: [
              "You add sources on the Sources page; GrowX checks each one and marks it as ready, private, unavailable or rate-limited.",
              "A fresh pass re-reads each source's newest followers every few hours (3 hours by default, 3 pages per pass), so the queue stays current.",
              "Candidates older than 72 hours are dropped by default so you do not follow stale accounts.",
              "GrowX learns which sources lead to follow-backs and shows you source performance in Analytics.",
            ],
          },
        ],
      },
      {
        id: "queue",
        heading: "Step 2: Harvest, filter and score into a queue",
        blocks: [
          {
            type: "p",
            text: "Harvested accounts do not go straight to follow. Each one passes through **hard filters** (rules that remove an account entirely) and then receives a **follow-back score from 1 to 99**. Only candidates that clear both steps enter the **queue**, which keeps a target number of ready accounts (250 by default).",
          },
          {
            type: "ul",
            items: [
              "Hard filters skip accounts you already follow, accounts that already follow you, private accounts, accounts without a profile photo and accounts that are too new, too inactive, too small or too large.",
              "The score estimates the chance of a follow-back from signals such as follow ratio, audience size, recent activity and profile quality (details in the [scoring guide](/blog/growx-features-guide-scoring-filters-cleanup)).",
              "A minimum score (55 by default) decides who is queued: raise it for quality, lower it for volume.",
              "You can review the queue, remove accounts, keep a never-follow list, or import your own list of usernames to follow first.",
            ],
          },
        ],
      },
      {
        id: "pacing",
        heading: "Step 3: Follow at a human pace",
        blocks: [
          {
            type: "p",
            text: "The autopilot follows **one account at a time** using X's own web requests, with randomised delays and regular breaks. Pacing is controlled by four presets. The numbers below come straight from the extension's current configuration.",
          },
          {
            type: "ul",
            items: [
              "**Safe**: 45-110 seconds between follows, a rest every 12 follows, up to 18 per hour and about 150 per day. Meant for new or warming-up accounts.",
              "**Balanced**: 30-75 seconds, a rest every 18 follows, up to 28 per hour and about 280 per day. The recommended default.",
              "**Turbo**: 18-45 seconds, up to 40 per hour and about 390 per day, for aged accounts with a clean record.",
              "**X Premium pace**: 12-32 seconds, up to 60 per hour and about 800 per day, intended for accounts that have X's own Premium subscription and therefore higher platform limits.",
            ],
          },
          {
            type: "p",
            text: "On top of the preset, GrowX adds occasional longer pauses (8% of follows by default), optional **active hours** (08:00-23:30 by default, with selectable days) so it never works around the clock, and an optional **warm-up** that raises the daily cap day by day for new accounts. Caps are rolling: the hourly cap looks at the last 60 minutes and the daily cap at the last 24 hours, not at calendar days.",
          },
        ],
      },
      {
        id: "safety",
        heading: "Step 4: Protection that slows down or stops",
        blocks: [
          {
            type: "p",
            text: "Safety logic is the heart of a trustworthy auto follow tool. GrowX reacts to what X tells it instead of pushing through:",
          },
          {
            type: "ul",
            items: [
              "**Adaptive slow-down**: after any warning or rate limit from X, GrowX throttles its daily and hourly limits and rests before continuing.",
              "**Follow verification**: every tenth follow is checked to confirm it actually stuck, which helps detect silent limits.",
              "**Following cap guard**: X lets everyone follow up to 5,000 accounts and then ties the limit to your follower count; GrowX pauses at the cap instead of hammering it.",
              "**Hard stops**: it halts completely when you are signed out, when the account is locked or suspended, or after repeated automation warnings, and never clicks through a challenge.",
              "**Emergency stop**: press Alt + Shift + S anywhere in Chrome to stop the autopilot immediately.",
            ],
          },
          {
            type: "p",
            text: "The engine runs in the extension's background service worker, so it keeps going when you close the popup or switch tabs, and it can resume after Chrome restarts. It does not need an X tab in the foreground: it uses an open x.com tab or a small pinned one.",
          },
        ],
      },
      {
        id: "measure",
        heading: "Step 5: Measure follow-backs and improve",
        blocks: [
          {
            type: "p",
            text: "GrowX tracks every follow it makes and checks, on a schedule (every 3 hours by default), who followed back. That data feeds:",
          },
          {
            type: "ul",
            items: [
              "**History** of the accounts it followed and whether they followed back.",
              "**Source performance**, so you can keep the sources that work and drop the ones that do not.",
              "A **growth chart** of your followers and following over time and a **monthly goal planner** that shows your pace against your target.",
            ],
          },
        ],
      },
      {
        id: "privacy",
        heading: "Where your data lives",
        blocks: [
          {
            type: "p",
            text: "Settings, sources, the queue and history are stored locally in your browser (`chrome.storage`). GrowX talks to x.com using your existing session and does not upload your X data. The extension can send anonymous usage counts (a random install ID, the version and a coarse bucket of follows done) which you can switch off in Settings. You can export a backup file at any time. Read the [privacy policy](/privacy) for the website's data handling.",
          },
        ],
      },
      {
        id: "next",
        heading: "Try it",
        blocks: [
          {
            type: "p",
            text: "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed. Compare the plans on the [pricing page](/pricing) or keep reading: the [features guide](/blog/growx-features-guide-scoring-filters-cleanup) covers scoring, filters, analytics and cleanup in depth.",
          },
        ],
      },
    ],
  },
  {
    slug: "growx-features-guide-scoring-filters-cleanup",
    seoTitle: "GrowX Features Guide: Scoring, Filters & Cleanup",
    title: "GrowX Features Guide: Follow-Back Scoring, Targeting Filters, Analytics and Cleanup Tools",
    description:
      "How GrowX scores accounts from 1 to 99, which targeting filters it offers, and how its analytics and cleanup tools find inactive and non-following accounts.",
    excerpt:
      "A deep dive into follow-back scoring, every targeting filter, growth analytics and the cleanup scan for unfollowing inactive accounts.",
    category: "Features",
    keywords: [
      "follow back score",
      "Twitter targeting filters",
      "Twitter unfollow tool",
      "mass unfollow Twitter",
      "find inactive Twitter accounts",
      "X growth analytics",
    ],
    datePublished: "2026-10-09",
    dateModified: "2026-10-09",
    readMinutes: 10,
    related: ["how-growx-auto-follow-works", "growx-potential-best-practices-roadmap"],
    sections: [
      {
        id: "intro",
        heading: "Quality over volume",
        blocks: [
          {
            type: "p",
            text: "Following thousands of random accounts is easy and rarely useful. The value of a **Twitter growth tool** is in choosing who to follow, tracking what works and cleaning up afterwards. This guide explains the decision-making parts of GrowX: the follow-back score, the targeting filters, the analytics and the cleanup tools. For the automation side (pacing, caps and safety) read [How GrowX auto follow works](/blog/how-growx-auto-follow-works).",
          },
        ],
      },
      {
        id: "score",
        heading: "The follow-back score (1-99)",
        blocks: [
          {
            type: "p",
            text: "Every candidate receives an **estimated follow-back probability** from 1 to 99. It starts from a neutral 50 and moves up or down based on signals that tend to predict a follow-back. It is an estimate built from public profile data, not a promise about any individual account.",
          },
          {
            type: "ul",
            items: [
              "**Follow ratio** (following divided by followers): accounts that follow many more people than follow them score higher; accounts that are followed far more than they follow score lower.",
              "**Audience size**: small and mid-sized accounts (up to a few thousand followers) score better than very large ones, and extremely tiny accounts are slightly penalised.",
              "**How many accounts they follow**: people who follow hundreds or thousands of accounts are more likely to follow back than people who follow almost nobody.",
              "**Follow-back language** in the bio or name, such as \"follow back\", \"f4f\" or \"mutuals\" (you can edit this keyword list).",
              "**Recent activity**: a recent post raises the score; long silence lowers it. When X does not provide a last-post time, GrowX estimates activity from posts per day.",
              "**Account age and profile quality**: very new accounts, accounts without a profile photo, without a bio or protected accounts score lower; verified accounts get a small bump.",
              "**Freshness**: being one of the source's newest followers adds a little.",
            ],
          },
          {
            type: "p",
            text: "The minimum score (55 by default) acts as a quality dial. Around 40 favours volume, around 70 favours quality. Results also show up as score bands in the queue (below 50, 50-59, 60-69, 70-79 and 80 and above) so you can see how your candidates are distributed.",
          },
        ],
      },
      {
        id: "filters",
        heading: "Targeting filters",
        blocks: [
          {
            type: "p",
            text: "Filters are hard rules applied before scoring. An account that fails any enabled filter is skipped and never queued.",
          },
          {
            type: "ul",
            items: [
              "**Relationship**: skip accounts you already follow and accounts that already follow you.",
              "**Audience**: minimum and maximum followers (15 and 8,000 by default), minimum following (40) and a minimum following-to-followers ratio (0.4).",
              "**Activity and age**: minimum number of posts (5), minimum account age in days (30) and a last-active window (45 days).",
              "**Profile**: require a profile photo, optionally require a bio, skip protected accounts, and either skip verified accounts or follow only verified ones.",
              "**Keywords**: exclude words (for example adult-content terms are excluded by default), require include words, and match location keywords against the profile.",
            ],
          },
          {
            type: "p",
            text: "Core filters are part of the free plan. Advanced filtering (keyword include/exclude lists, location, verified-only, account age and last-active rules) is a Premium feature; see the [Free vs Premium comparison](/pricing) and the [roadmap post](/blog/growx-potential-best-practices-roadmap).",
          },
        ],
      },
      {
        id: "analytics",
        heading: "Analytics: see what is actually working",
        blocks: [
          {
            type: "ul",
            items: [
              "**Follow history** with follow-back status for each account GrowX followed.",
              "**Source performance**: the follow-back rate of each source profile, so you can double down on the best ones.",
              "**Growth chart** of followers and following over time, recorded by periodic snapshots.",
              "**Goal planner**: set a monthly follower goal (5,000 by default) and see days left, the pace you need per day and where your current pace is heading.",
              "**Backup and restore**: export your settings, sources, never-follow list and history to a file and import it later or on another computer.",
            ],
          },
        ],
      },
      {
        id: "cleanup",
        heading: "Cleanup tools: unfollow inactive and non-following accounts",
        blocks: [
          {
            type: "p",
            text: "After growing, most people want to tidy their following list. The Cleanup page scans who you follow and who follows you, then lets you review the results before anything happens.",
          },
          {
            type: "ul",
            items: [
              "**Inactive accounts**: accounts whose latest post is older than a threshold (30, 90, 180 or 365 days). If X does not tell GrowX when an account last posted, it is labelled \"unknown\", never \"inactive\".",
              "**Not following back**: accounts you follow that do not follow you. If your followers list could not be read to the end, those accounts are marked \"unverified\" and bulk selection is turned off for that view.",
              "**Review first**: you filter, search, sort and select the accounts yourself. The unfollow runner only touches accounts you selected and confirmed.",
              "**Safe pace**: unfollows run one at a time with delays, breaks and rolling hourly and daily caps (Safe: up to 30 per hour and 200 per day; Balanced: 45 per hour and 320 per day), and each selection is re-checked with X right before it is unfollowed.",
              "**It stops** on a rate limit, an automation warning, a sign-out or a lock, and does not retry or work around them.",
            ],
          },
          {
            type: "p",
            text: "Cleanup scanning and manual selection stay free; large select-all batches are part of Premium. Details are in the [features overview](/features).",
          },
        ],
      },
      {
        id: "workflow",
        heading: "A sensible workflow",
        blocks: [
          {
            type: "ol",
            items: [
              "Start with 3-5 source profiles that closely match your audience.",
              "Use the Safe or Balanced pace, active hours and (for new accounts) warm-up.",
              "Leave the default filters on for a few days, then raise the minimum score if the queue is too noisy.",
              "Check Analytics weekly, keep the best sources and replace the weakest.",
              "After a week or two, run a Cleanup scan and manually unfollow accounts that never followed back, not on the same day as heavy following.",
            ],
          },
          {
            type: "p",
            text: "Questions about a setting? Read [How it works](/how-it-works) or [contact support](/contact).",
          },
        ],
      },
    ],
  },
  {
    slug: "growx-potential-best-practices-roadmap",
    seoTitle: "GrowX Roadmap: Premium, Accounts & What's Next",
    title: "Growing on X with GrowX: Potential, Best Practices and the Roadmap Ahead",
    description:
      "What GrowX can do for your X (Twitter) growth, best practices for staying safe, and what is live and next: accounts, Premium plans and the 30-day trial.",
    excerpt:
      "What GrowX is good at, how to use it responsibly, and an honest look at what is live and what is next: accounts, the 30-day trial, Premium plans and payments.",
    category: "Roadmap",
    keywords: [
      "grow X followers",
      "Twitter follower growth",
      "X growth strategy",
      "GrowX Premium",
      "GrowX roadmap",
      "safe Twitter growth",
    ],
    datePublished: "2026-10-09",
    dateModified: "2026-10-09",
    readMinutes: 8,
    related: ["how-growx-auto-follow-works", "growx-features-guide-scoring-filters-cleanup"],
    sections: [
      {
        id: "potential",
        heading: "What GrowX is good at",
        blocks: [
          {
            type: "p",
            text: "GrowX saves the repetitive part of building an audience on X: finding relevant, active people, following them at a safe pace, and measuring who responds. It does not write your content, and no tool can replace posting things people want to follow. Think of GrowX as the discovery and outreach layer that sits next to your content.",
          },
          {
            type: "ul",
            items: [
              "**Targeted outreach**: sources, filters and the follow-back score focus effort on accounts that fit your niche and are likely to engage.",
              "**Consistency**: it works in the background within your schedule, so growth does not depend on manual effort every day.",
              "**Learning**: history and source performance show what is working so you can refine your targeting.",
              "**Housekeeping**: Cleanup helps keep your following list healthy and your following-to-followers ratio sensible.",
            ],
          },
          {
            type: "note",
            text: "Results vary widely by niche, account age and content quality. GrowX does not guarantee any follower count, follow-back rate or outcome.",
          },
        ],
      },
      {
        id: "use-cases",
        heading: "Who gets the most out of it",
        blocks: [
          {
            type: "p",
            text: "GrowX is a good fit when you have a clear niche and something worth following. The same pipeline (sources, filters, score, pace, measure) adapts to different goals:",
          },
          {
            type: "ul",
            items: [
              "**Creators and writers** who post regularly and want relevant readers: pick a few sources that share your audience and keep the filters on so only active, real-looking profiles are queued.",
              "**Founders and indie makers** building in public: target the followers of tools, communities and peers in your space, then use the follow-back data to see which communities actually respond.",
              "**Small businesses and communities** that want local or topical reach: location and keyword filters (part of Premium) narrow the audience further.",
              "**Anyone with an overgrown following list**: Cleanup is useful on its own to find inactive accounts and people who never followed back, even if you never use the autopilot.",
            ],
          },
          {
            type: "p",
            text: "In every case the limiting factor is the value of your profile and content. GrowX gets you in front of the right people; whether they follow back is up to what they see when they arrive.",
          },
        ],
      },
      {
        id: "practices",
        heading: "Best practices for growing safely",
        blocks: [
          {
            type: "ol",
            items: [
              "**Start slow.** Use the Safe pace and warm-up on a new or quiet account; graduate to Balanced once things look healthy.",
              "**Keep active hours on.** Real people do not follow accounts around the clock.",
              "**Stay well under X's limits.** X allows roughly 400 follows a day on a typical account; higher presets are meant for aged accounts and X Premium subscribers.",
              "**Post and reply.** Accounts with real activity earn more follow-backs and draw less scrutiny.",
              "**Respect warnings.** If GrowX rests after a warning from X, let it. Do not restart at full speed.",
              "**Unfollow slowly.** Use Cleanup after 7-14 days and not on the same day as heavy following.",
              "**Read X's rules.** Automation rules change; you are responsible for following them.",
            ],
          },
        ],
      },
      {
        id: "today",
        heading: "Where GrowX is today",
        blocks: [
          {
            type: "ul",
            items: [
              "The Chrome extension is available on the Chrome Web Store with the autopilot, sources and queue, scoring and filters, analytics, backup and cleanup tools described across this site.",
              "This website offers free accounts, a free 30-day Premium trial (no credit card) and paid Premium plans.",
              "The extension signs in with your GrowX account, and Premium is available to buy on the [pricing page](/pricing).",
            ],
          },
        ],
      },
      {
        id: "roadmap",
        heading: "What is live and what is next",
        blocks: [
          {
            type: "p",
            text: "Most of the items below are live now. Anything marked as next is a direction, **not a promise with a date**.",
          },
          {
            type: "ul",
            items: [
              "**Freemium model with a 30-day Premium trial.** Core features stay free: the Safe and Balanced autopilot, sources and queue, core filters, history, analytics, backup, the cleanup scan and reasonable manual selection.",
              "**Premium plans.** $1.99 for 30 days or $14.99 for 365 days (prepaid, no automatic renewal), or $29.99 one-time lifetime. Premium is aimed at advanced automation, higher-volume bulk operations (such as the Turbo and X Premium paces and select-all cleanup), advanced filters and future premium tools.",
              "**Early Adopter Lifetime.** A $0.99 one-time offer with permanent Premium for the first 100 successful, verified purchases. When the 100 are gone the regular prices apply.",
              "**Account linking.** The extension signs in with your GrowX account so the server can tell it which plan you have. Entitlements are decided on the server, not by anything the browser claims.",
              "**Payments.** Cryptocurrency (Ethereum and BNB Smart Chain coins) through NOWPayments invoices, with verified notifications before any access is granted.",
              "**Next: clearer naming.** The extension's \"Premium\" speed preset means X Premium accounts, not GrowX Premium, and the wording will be made less confusing.",
            ],
          },
          {
            type: "p",
            text: "Follow the status on the [pricing page](/pricing), and read the [About page](/about) for the principles behind these decisions: safety first, local-first data and honest claims.",
          },
        ],
      },
      {
        id: "principles",
        heading: "Principles that will not change",
        blocks: [
          {
            type: "p",
            text: "As the product grows, a few commitments are meant to stay fixed. They are also the reasons the roadmap looks the way it does:",
          },
          {
            type: "ul",
            items: [
              "**Useful free tier.** A freemium model only works if the free plan is genuinely usable for daily growth, so core features, safety controls and your own data are not paywalled.",
              "**Safety is never a Premium feature.** The emergency stop, adaptive slow-down, follow verification, active hours and warm-up stay available to everyone.",
              "**Server-side decisions.** Plan checks are made by the server from verified records, never from a flag the browser sends. Paid access is only granted after a payment provider's verified confirmation.",
              "**No fake numbers.** No invented testimonials, counts or countdowns. When the Early Adopter offer exists, it will not show a made-up \"slots left\" ticker.",
              "**Your data stays yours.** The extension keeps your X data in your browser; account features on this site store only what accounts and billing need, as described in the [privacy policy](/privacy).",
            ],
          },
          {
            type: "p",
            text: "Because the extension runs on your computer, any restriction it enforces can in principle be bypassed by someone determined. The goal is a fair, honest model rather than an unbreakable lock: Premium should be worth paying for because it saves time and adds capability, not because the free version is crippled.",
          },
        ],
      },
      {
        id: "feedback",
        heading: "Shape what comes next",
        blocks: [
          {
            type: "p",
            text: "Feature requests and bug reports go straight to the developer. [Contact support](/contact) or [create a free account](/signup) and try Premium free for 30 days.",
          },
        ],
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const latestFirst = () => [...posts].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
