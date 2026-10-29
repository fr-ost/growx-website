/**
 * Blog content. Facts come from docs/PRODUCT_FACTS.md (GrowX extension v2.4.4:
 * Grow, Create, GrowX AI, Engage, Insights, Cleanup, plans). Nothing unreleased
 * is described as live. No statistics, testimonials or result promises are invented.
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
  category: "How it works" | "Features" | "Roadmap" | "Guides" | "Create" | "Insights" | "Engage";
  keywords: string[];
  datePublished: string;
  dateModified: string;
  readMinutes: number;
  sections: PostSection[];
  /** Slugs of related posts. */
  related: string[];
  /** Optional questions and answers, rendered after the sections and as FAQPage structured data. */
  faq?: { q: string; a: string }[];
}

import { createPosts } from "./posts-create";
import { growthPosts } from "./posts-growth";
import { insightPosts } from "./posts-insights";
import { profilePosts } from "./posts-profile";
import { strategyPosts } from "./posts-strategy";

const corePosts: Post[] = [
  {
    slug: "how-growx-auto-follow-works",
    seoTitle: "How X Auto Follow Works: GrowX Smart Follow Engine",
    title: "How GrowX Auto Follow Works: The Complete Guide to Smart Following on X (Twitter)",
    description:
      "How smart auto follow in GrowX, the X (Twitter) growth tool for Chrome, finds, scores and follows people at a human pace, with caps, breaks and safety stops.",
    excerpt:
      "From source profiles and recent followers first to scoring, pacing, safety stops and the source leaderboard: exactly what happens when you press Start in GrowX.",
    category: "How it works",
    keywords: [
      "how X auto follow works",
      "Twitter auto follow tool",
      "smart auto follow",
      "X (Twitter) growth tool",
      "X follow limits",
      "safe Twitter auto follow",
      "GrowX",
    ],
    datePublished: "2026-10-09",
    dateModified: "2026-10-29",
    readMinutes: 9,
    related: ["growx-features-guide-scoring-filters-cleanup", "twitter-follow-back-score-growx", "bulk-follow-twitter-safely"],
    sections: [
      {
        id: "overview",
        heading: "What a smart X auto follow tool should (and should not) do",
        blocks: [
          {
            type: "p",
            text: "Searching for an **X auto follow** or **Twitter auto follow** tool usually leads to two kinds of products: aggressive scripts that follow as fast as possible, and careful assistants that behave more like a person. GrowX is built to be the second kind. It is an X (Twitter) growth tool for Chrome with a post scheduler, an on-device AI writer, analytics, an unfollower tracker and cleanup tools, and at its core is **smart auto follow**: it works inside your own signed-in x.com session, follows accounts one at a time, and slows down or stops the moment X shows a warning.",
          },
          {
            type: "p",
            text: "This guide walks through the **Grow** pipeline in the order GrowX runs it: choosing sources, following each source's newest followers first, filtering and scoring everyone else, pacing the follows, protecting your account, and measuring who followed back. Everything described here reflects the current extension (version 2.4.4). For the short version see [How it works](/how-it-works) or the [Twitter auto follow](/features/twitter-auto-follow) page.",
          },
          {
            type: "note",
            text: "No tool can promise zero risk on X, and results depend on your niche, your content and your account. GrowX is designed to respect the limits X signals, but you remain responsible for following X's rules.",
          },
        ],
      },
      {
        id: "sources",
        heading: "Step 1: Pick source profiles (or let GrowX find them)",
        blocks: [
          {
            type: "p",
            text: "Everything starts with **source profiles**: accounts that your ideal audience already follows, such as creators, brands or communities in your niche. GrowX reads each source's **newest followers**, because people who followed an account recently are active right now and have already shown interest in your topic.",
          },
          {
            type: "ul",
            items: [
              "You add sources in the Grow area of the dashboard. **Find sources for me** suggests them automatically from the accounts you already follow, ranked by how active, mid-sized and follow-back-prone their audience is.",
              "**Find people now** harvests candidates immediately; after that, GrowX re-reads every source **every hour** (3 pages per pass), so the queue stays current.",
              "Candidates older than 72 hours are dropped so you do not follow stale accounts.",
              "On Premium, sources are not limited to profiles: you can also use a post's reposts, replies or likes, searches and #hashtags, and X Lists.",
            ],
          },
        ],
      },
      {
        id: "recent",
        heading: "Step 2: Recent followers first",
        blocks: [
          {
            type: "p",
            text: "Each source's newest followers (the top 50 of its follower list by default) are followed **first**. Someone who followed a niche account minutes or hours ago is the most likely to be online and receptive, so these accounts skip the follow-back score.",
          },
          {
            type: "p",
            text: "They do not skip the safety checks. GrowX still leaves out private accounts, accounts without a profile photo, accounts with zero posts, giant accounts and anyone matching your exclude keywords. Everyone else harvested from the source goes through the full filter and scoring step below.",
          },
        ],
      },
      {
        id: "queue",
        heading: "Step 3: Filter and score everyone else into a queue",
        blocks: [
          {
            type: "p",
            text: "The rest of the harvested accounts do not go straight to follow. Each one passes through **hard filters** (rules that remove an account entirely) and then receives a **follow-back score from 1 to 99**. Only candidates that clear both steps enter the **queue**, which keeps around 250 ready accounts.",
          },
          {
            type: "ul",
            items: [
              "Hard filters skip accounts you already follow, accounts that already follow you, private accounts, accounts without a profile photo, and accounts that are too new, too inactive, too small or too large, plus anyone matching your exclude keywords.",
              "The score estimates the chance of a follow-back from signals such as follow ratio, audience size, how many accounts they follow, follow-back words in the bio, recent activity, account age and profile quality (details in the [follow-back score guide](/blog/twitter-follow-back-score-growx)).",
              "A minimum score (55 by default) decides who is queued: raise it for quality, lower it for volume.",
              "You can review the queue, remove accounts and keep a never-follow list. On Premium you can also import your own list of usernames to follow first.",
            ],
          },
          {
            type: "p",
            text: "**Smart score (Premium).** Once you have enough history (about 80 settled follows, with at least 12 follow-backs and 12 non-follow-backs), GrowX trains a small model on your own follow-backs, checks it on a holdout set and blends it into the score at up to 60% weight, but only when it clearly beats chance. Until then, the standard score is used.",
          },
        ],
      },
      {
        id: "pacing",
        heading: "Step 4: Follow at a human pace",
        blocks: [
          {
            type: "p",
            text: "The autopilot follows **one account at a time** using X's own web requests, with randomised delays and regular breaks. Pacing is controlled by presets. The numbers below come straight from the extension's current configuration.",
          },
          {
            type: "ul",
            items: [
              "**Safe**: 45-110 seconds between follows, a rest every 12 follows, up to 18 per hour and about 150 per day. Meant for new or warming-up accounts.",
              "**Balanced**: 30-75 seconds, a rest every 18 follows, up to 28 per hour and about 280 per day. The recommended default.",
              "**Turbo** (Premium): 18-45 seconds, a rest every 25 follows, up to 40 per hour and about 390 per day, for aged accounts with a clean record.",
              "**X Premium pace** (Premium): 12-32 seconds, a rest every 35 follows, up to 60 per hour and about 800 per day, only for accounts that have X's own Premium subscription and therefore higher platform limits.",
              "**Custom**: set your own delays and caps; anything faster than Balanced needs Premium.",
            ],
          },
          {
            type: "p",
            text: "On top of the preset, GrowX adds occasional longer pauses (on about 8% of follows) and supports an optional **session target**. **Active hours are off by default**: turn them on if you want the autopilot to keep a daily rhythm, and it will only follow between 08:00 and 23:30 (the default window when enabled) on the days you choose. An optional **warm-up** starts a new account at a daily cap of 60 and raises it by 20 a day. Caps are rolling: the hourly cap looks at the last 60 minutes and the daily cap at the last 24 hours, not at calendar days.",
          },
        ],
      },
      {
        id: "safety",
        heading: "Step 5: Protection that slows down or stops",
        blocks: [
          {
            type: "p",
            text: "Safety logic is the heart of a trustworthy auto follow tool. GrowX reacts to what X tells it instead of pushing through:",
          },
          {
            type: "ul",
            items: [
              "**Adaptive slow-down**: after any warning or rate limit from X, GrowX throttles its limits and rests before continuing.",
              "**Follow verification**: GrowX checks that follows actually stuck, which helps detect silent (shadow) limits.",
              "**Following-cap guard**: X lets everyone follow up to 5,000 accounts and then ties the limit to your follower count. GrowX pauses at 5,000 or about 10% above your follower count instead of hammering the limit.",
              "**Hard stops**: it halts when you are signed out, when the account is locked, when X shows a challenge, or after repeated automation warnings, and never clicks through a challenge.",
              "**Emergency stop**: press Alt + Shift + S anywhere in Chrome to stop the autopilot immediately.",
            ],
          },
          {
            type: "p",
            text: "The engine runs in the extension's background service worker, so it keeps going when you close the popup or switch tabs. While it runs it keeps the computer awake, and it resumes after Chrome restarts. Chrome must be open and you must be signed in to X.",
          },
        ],
      },
      {
        id: "measure",
        heading: "Step 6: Measure follow-backs with the source leaderboard",
        blocks: [
          {
            type: "p",
            text: "GrowX tracks every follow it makes and checks on a schedule who followed back. That data feeds:",
          },
          {
            type: "ul",
            items: [
              "**History** of the accounts it followed and whether they followed back.",
              "The **source leaderboard**, with the follow-back rate, retention and cost of each source, so you can keep the sources that work and drop the ones that do not.",
              "**Auto-replace weak sources** (Premium): after a fair trial, weak sources are retired and replaced with the best auto-found one. Retired sources can be restored.",
              "**Automatic cleanup** (Premium): GrowX's own follows that did not follow back can be unfollowed after 2, 5 or 7 days, only during autopilot breaks and within safe caps.",
              "A **growth chart**, daily goals with streaks and milestones, and a **monthly goal planner** in Insights.",
            ],
          },
        ],
      },
      {
        id: "beyond",
        heading: "Auto follow is one part of growing",
        blocks: [
          {
            type: "p",
            text: "Following brings people to your profile; what they find there decides whether they follow back. That is why GrowX grew from an auto follow extension into a full growth tool. The **Create** area schedules posts and threads into queue slots at your best times (see the [Twitter post scheduler](/features/twitter-post-scheduler)), **Engage** lists fresh posts to reply to early, and **Insights** tracks post analytics and who unfollowed you.",
          },
          {
            type: "p",
            text: "Run the autopilot in the background, keep a few posts in the queue, and spend your own time on replies and conversations. That combination tends to do more than any follow setting on its own.",
          },
        ],
      },
      {
        id: "privacy",
        heading: "Where your data lives",
        blocks: [
          {
            type: "p",
            text: "Settings, sources, the queue, history, posts and analytics are stored locally in your browser (`chrome.storage`). GrowX talks to x.com using your existing session, never asks for your X password and does not upload your X data. Optional Chrome sync of settings, sources and lists uses Chrome's own sync storage, not a GrowX server. The extension can send anonymous usage counts (a random install ID, the version and coarse counts, no X data), which you can switch off. You can export a backup file at any time. Read the [privacy policy](/privacy) for the website's data handling.",
          },
        ],
      },
      {
        id: "next",
        heading: "Try it",
        blocks: [
          {
            type: "p",
            text: "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed. Compare the plans on the [pricing page](/pricing) or keep reading: the [features guide](/blog/growx-features-guide-scoring-filters-cleanup) covers scoring, filters, Insights and Cleanup in depth.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Does GrowX auto follow keep running when the popup is closed?",
        a: "Yes. It runs in Chrome's background service worker, keeps the computer awake while it runs and resumes after Chrome restarts. Chrome must be open and you must be signed in to X.",
      },
      {
        q: "Are active hours on by default?",
        a: "No. Active hours are optional and off by default. When you turn them on, the autopilot only follows inside a daily window (08:00 to 23:30 by default) on the days you choose.",
      },
      {
        q: "Which pace should I start with?",
        a: "Safe for new or quiet accounts, ideally with warm-up turned on. Balanced is the recommended default once the account has a clean history. Turbo and the X Premium pace are Premium presets for aged accounts.",
      },
      {
        q: "Is smart auto follow free?",
        a: "Yes. Source profiles, recent followers first, the follow-back score, core filters and the Safe and Balanced paces are free. Premium adds faster paces, the smart score, more source types, list import, advanced filters and auto-replace for weak sources.",
      },
    ],
  },
  {
    slug: "growx-features-guide-scoring-filters-cleanup",
    seoTitle: "GrowX Features Guide: Scoring, Filters, Insights",
    title: "GrowX Features Guide: Follow-Back Scoring, Targeting Filters, Insights and Cleanup Tools",
    description:
      "How GrowX scores accounts 1-99, how the Premium smart score learns, which filters are free, and how Insights and Cleanup work in this X (Twitter) growth tool.",
    excerpt:
      "A deep dive into the follow-back score and smart score, sources, every targeting filter, Insights analytics and the Cleanup tools for unfollowing inactive and non-following accounts.",
    category: "Features",
    keywords: [
      "follow back score",
      "Twitter targeting filters",
      "X (Twitter) growth tool",
      "Twitter analytics",
      "Twitter unfollow tool",
      "find inactive Twitter accounts",
      "GrowX",
    ],
    datePublished: "2026-10-09",
    dateModified: "2026-10-29",
    readMinutes: 8,
    related: ["how-growx-auto-follow-works", "twitter-follow-back-score-growx", "unfollow-non-followers-twitter"],
    sections: [
      {
        id: "intro",
        heading: "Quality over volume",
        blocks: [
          {
            type: "p",
            text: "Following thousands of random accounts is easy and rarely useful. The value of a **Twitter growth tool** is in choosing who to follow, tracking what works and cleaning up afterwards. GrowX, the X (Twitter) growth tool for Chrome, organises its dashboard into Home, Grow, Create, Engage, Insights, Cleanup and Settings. This guide explains the decision-making parts: the follow-back score and smart score, sources, targeting filters, Insights and Cleanup.",
          },
          {
            type: "p",
            text: "For the automation side (pacing, caps and safety) read [How GrowX auto follow works](/blog/how-growx-auto-follow-works). For posts and threads, see the [Twitter post scheduler](/features/twitter-post-scheduler). Everything here reflects extension version 2.4.4.",
          },
        ],
      },
      {
        id: "score",
        heading: "The follow-back score (1-99)",
        blocks: [
          {
            type: "p",
            text: "Every candidate that is not among a source's freshest followers receives an **estimated follow-back probability** from 1 to 99. It is an estimate built from public profile data, not a promise about any individual account.",
          },
          {
            type: "ul",
            items: [
              "**Follow ratio** (following divided by followers): accounts that follow many more people than follow them score higher; accounts that are followed far more than they follow score lower.",
              "**Audience size**: small and mid-sized accounts score better than very large ones.",
              "**How many accounts they follow**: people who follow hundreds or thousands of accounts are more likely to follow back than people who follow almost nobody.",
              "**Follow-back words** in the bio, such as \"follow back\" or \"mutuals\". You can edit these boost words.",
              "**Recent activity**: a recent post raises the score; long silence lowers it.",
              "**Account age and profile quality**: very new accounts and profiles without a photo or bio score lower. Verified status is also taken into account.",
              "**Recency**: being one of the source's newest followers adds a little.",
            ],
          },
          {
            type: "p",
            text: "The minimum score (55 by default) acts as a quality dial. Around 40 favours volume, around 70 favours quality. A longer explanation with examples is in the [follow-back score guide](/blog/twitter-follow-back-score-growx).",
          },
        ],
      },
      {
        id: "smart",
        heading: "Smart score: learning from your own follow-backs (Premium)",
        blocks: [
          {
            type: "p",
            text: "The standard score uses the same signals for everyone, but audiences differ. The **smart score** on Premium adds a small model (a logistic regression) trained on **your own** results: which of the accounts GrowX followed for you actually followed back.",
          },
          {
            type: "ul",
            items: [
              "It needs enough data first: about 80 settled follows, with at least 12 follow-backs and 12 non-follow-backs.",
              "It is checked on a holdout set (follows it was not trained on) before it is used.",
              "It is blended into the standard score at up to 60% weight, and only when it clearly beats chance. Otherwise GrowX keeps using the standard score.",
            ],
          },
        ],
      },
      {
        id: "sources",
        heading: "Sources: where candidates come from",
        blocks: [
          {
            type: "ul",
            items: [
              "**Source profiles**: accounts in your niche whose newest followers GrowX reads, re-read every hour (3 pages per pass).",
              "**Find sources for me**: auto-finds sources from the accounts you follow, ranked by how active, mid-sized and follow-back-prone their audience is. **Find people now** harvests immediately.",
              "**Recent followers first**: each source's newest followers (top 50 by default) are followed first. They skip the score but keep the safety checks: no private, photo-less, zero-post or giant accounts, and nobody matching your exclude keywords.",
              "**More source types** (Premium): a post's reposts, replies or likes; searches and #hashtags; and X Lists.",
              "**Source leaderboard**: the follow-back rate, retention and cost of each source.",
              "**Auto-replace weak sources** (Premium): after a fair trial, weak sources are retired and replaced with the best auto-found one. Retired sources can be restored.",
            ],
          },
        ],
      },
      {
        id: "filters",
        heading: "Targeting filters",
        blocks: [
          {
            type: "p",
            text: "Filters are hard rules applied before scoring. An account that fails any enabled filter is skipped and never queued. The **core filters** are free:",
          },
          {
            type: "ul",
            items: [
              "**Relationship**: skip accounts you already follow and accounts that already follow you.",
              "**Profile**: skip private accounts and accounts without a profile photo; optionally require a bio.",
              "**Audience**: minimum and maximum followers (15 and 8,000 by default), minimum following (40) and a minimum following-to-followers ratio (0.4).",
              "**Activity and age**: minimum number of posts (5), minimum account age (30 days) and a last-active window (45 days).",
              "**Keywords**: exclude words (adult-content terms are excluded by default) and follow-back boost words.",
            ],
          },
          {
            type: "p",
            text: "**Advanced filters** (Premium) add include keywords, location keywords, verified-only or skip-verified rules, and more control over account-age and last-active rules. Premium also adds **list import**, so you can paste usernames to follow first. The **never-follow list** keeps specific accounts out of every run. Compare plans on the [pricing page](/pricing).",
          },
        ],
      },
      {
        id: "insights",
        heading: "Insights: see what is actually working",
        blocks: [
          {
            type: "ul",
            items: [
              "**Post analytics**: views, likes, reposts, replies, bookmarks and engagement rate of your recent posts, refreshed every 3 hours while x.com is open. The free plan covers your latest 30 posts.",
              "**What works**: topics and formats (questions, images, text, threads, links) compared by engagement.",
              "**Which posts brought followers** (Premium, part of full analytics): posts followed by more new followers than your usual pace in the next 24 hours.",
              "**Follower tracker**: once a day, who followed and who unfollowed you. Free keeps 7 days of history; Premium keeps the full history and adds one-click unfollow back. See the [unfollower tracker](/features/twitter-unfollower-tracker).",
              "**Follower quality** (Premium): your newest followers grouped as real and active, inactive (90+ days), likely bot or private, on request.",
              "**Top fans**, a **weekly report** (Premium) comparing this week with last week, a growth chart, daily goals with **streaks and milestones**, and a monthly goal planner.",
            ],
          },
          {
            type: "p",
            text: "Everything is read through an x.com tab that is already open, one small step per minute at most, and stays in your browser. You can export a backup file of your data at any time. More on the [Twitter analytics](/features/twitter-analytics) page.",
          },
        ],
      },
      {
        id: "cleanup",
        heading: "Cleanup tools: unfollow inactive and non-following accounts",
        blocks: [
          {
            type: "p",
            text: "After growing, most people want to tidy their following list. The Cleanup area scans who you follow and who follows you, then lets you review the results before anything happens.",
          },
          {
            type: "ul",
            items: [
              "**Not following back**: accounts you follow that do not follow you. If your followers list could not be read to the end, those accounts are marked \"unverified\" and bulk selection is turned off for that view.",
              "**Inactive accounts**: accounts whose latest post is older than a threshold (30, 90, 180 or 365 days). Unknown activity is never called inactive.",
              "**Review first**: you filter, search, sort and select the accounts yourself, and each one is re-checked with X right before it is unfollowed.",
              "**Safe pace**: one at a time, up to 30 per hour and 200 per day. The free plan unfollows up to 200 accounts per run.",
              "**Premium**: select-all bulk unfollow of up to 5,000 in one run, and a Balanced unfollow pace of 45 per hour and 320 per day.",
              "**Automatic cleanup** (Premium): unfollows GrowX's own follows that did not follow back after 2, 5 or 7 days, only during autopilot breaks, 40-90 seconds apart and within the same caps. It never touches accounts you followed yourself or imported.",
            ],
          },
          {
            type: "p",
            text: "The [Twitter unfollow tool](/features/twitter-unfollow-tool) page summarises the options, and the [unfollow guide](/blog/unfollow-non-followers-twitter) covers a safe routine.",
          },
        ],
      },
      {
        id: "plans",
        heading: "What is free and what is Premium",
        blocks: [
          {
            type: "ul",
            items: [
              "**Free forever**: the Safe and Balanced paces, source profiles, recent followers first, the follow-back score, core filters, the never-follow list, the post scheduler with up to 10 posts or threads waiting, analytics for your latest 30 posts, 7 days of follower history, Reply targets and cleanup of up to 200 per run. Safety features such as the emergency stop, adaptive slow-down, active hours and warm-up are on every plan.",
              "**Premium**: the Turbo and X Premium paces, custom pacing above Balanced, advanced filters, list import, the smart score, more source types, auto-replace for weak sources, unlimited scheduling, evergreen recycling, auto-plug, GrowX AI, full analytics, full follower history, VIP alerts, a workspace per X account, bulk unfollow of up to 5,000, the Balanced unfollow pace and automatic cleanup.",
            ],
          },
          {
            type: "p",
            text: "Every GrowX account can start one free 30-day Premium trial from the website dashboard, with no credit card.",
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
              "Start with 3-5 source profiles that closely match your audience, or let Find sources for me suggest them.",
              "Use the Safe or Balanced pace and, for new accounts, warm-up. Turn on active hours if you want a daily rhythm; they are off by default.",
              "Leave the default filters on for a few days, then raise the minimum score if the queue is too noisy.",
              "Check the source leaderboard and Insights weekly, keep the best sources and replace the weakest.",
              "After a week or two, run a Cleanup scan and unfollow accounts that never followed back, not on the same day as heavy following.",
            ],
          },
          {
            type: "p",
            text: "Questions about a setting? Read [How it works](/how-it-works) or [contact support](/contact).",
          },
        ],
      },
    ],
    faq: [
      {
        q: "What is the difference between the follow-back score and the smart score?",
        a: "The follow-back score (1-99) uses the same public-profile signals for everyone. The smart score, part of Premium, learns from your own follow-backs once you have about 80 settled follows and is blended in only when it clearly beats chance.",
      },
      {
        q: "Which targeting filters are free?",
        a: "The core filters: relationship, private and photo checks, optional bio, follower and following limits, ratio, minimum posts, account age, last active, exclude keywords and boost words. Include keywords, location, verified rules and list import are Premium.",
      },
      {
        q: "Does Cleanup unfollow anything without my approval?",
        a: "No. You select and confirm every manual run. The only exception is Premium automatic cleanup, which you turn on yourself and which only unfollows GrowX's own follows that did not follow back after 2, 5 or 7 days.",
      },
    ],
  },
  {
    slug: "growx-potential-best-practices-roadmap",
    seoTitle: "GrowX 2.4.4: What's Live, Best Practices & What's Next",
    title: "Growing on X with GrowX 2.4.4: What Is Live Today, Best Practices and What Comes Next",
    description:
      "What is live in GrowX 2.4.4, the X (Twitter) growth tool: Grow, Create, GrowX AI, Engage, Insights and Cleanup, plus best practices, Premium and the trial.",
    excerpt:
      "GrowX is now a complete X (Twitter) growth tool. Here is what is live in version 2.4.4, how to use it responsibly, how accounts, Premium and the free trial work, and how we think about what comes next.",
    category: "Roadmap",
    keywords: [
      "GrowX 2.4.4",
      "GrowX roadmap",
      "X (Twitter) growth tool",
      "grow X followers",
      "GrowX Premium",
      "safe Twitter growth",
      "GrowX",
    ],
    datePublished: "2026-10-09",
    dateModified: "2026-10-29",
    readMinutes: 10,
    related: ["how-growx-auto-follow-works", "growx-features-guide-scoring-filters-cleanup", "best-twitter-growth-tools"],
    sections: [
      {
        id: "potential",
        heading: "From auto follow extension to X growth tool",
        blocks: [
          {
            type: "p",
            text: "GrowX started as a careful **auto follow Chrome extension** for X (Twitter). Version 2.4.4 is something bigger: **GrowX: The Ultimate X (Twitter) Growth Tool**, an all-in-one Chrome extension with smart auto follow, a post scheduler, an on-device AI writer, analytics, an unfollower tracker, Reply targets and cleanup tools. Underneath, it still works the same way: inside your own signed-in x.com session, without asking for your X password and without X OAuth.",
          },
          {
            type: "p",
            text: "The dashboard is organised into **Home, Grow, Create, Engage, Insights, Cleanup and Settings**, plus Help, and the popup gives you a pace switch, Start, Pause and Stop, and a quick post box. This post walks through what is live in each area today, how to use it responsibly, and how we think about what comes next. For a page-by-page tour, see [all features](/features).",
          },
          {
            type: "note",
            text: "Results vary widely by niche, account age and content quality. GrowX does not guarantee any follower count, follow-back rate or outcome, and no tool can promise zero risk on X.",
          },
        ],
      },
      {
        id: "grow",
        heading: "Grow: smart auto follow",
        blocks: [
          {
            type: "p",
            text: "Grow is the part GrowX is known for. You add **source profiles** in your niche, or press **Find sources for me**, and GrowX follows their newest followers at a human pace.",
          },
          {
            type: "ul",
            items: [
              "**Recent followers first**: each source's newest followers are followed first, with safety checks; everyone else is ranked by a **follow-back score from 1 to 99** and your filters.",
              "**Pace presets**: Safe (about 150 a day) and Balanced (about 280 a day) on every plan; Turbo (about 390) and the X Premium pace (about 800, only for accounts with X's own Premium) on GrowX Premium.",
              "**Safety**: random delays and breaks, optional active hours (off by default) and warm-up, a following-cap guard, adaptive slow-down after warnings, follow verification, hard stops and the Alt + Shift + S emergency stop.",
              "**Source leaderboard** with follow-back rate, retention and cost per source.",
              "**Premium extras**: the smart score that learns from your own follow-backs, more source types (a post's reposts, replies or likes, searches and #hashtags, X Lists), auto-replace for weak sources, advanced filters and list import.",
            ],
          },
          {
            type: "p",
            text: "The full pipeline is explained in [how GrowX auto follow works](/blog/how-growx-auto-follow-works).",
          },
        ],
      },
      {
        id: "create",
        heading: "Create: posts, threads and the scheduler",
        blocks: [
          {
            type: "p",
            text: "Create is where you write. The composer handles single posts and **threads of up to 25 parts**, up to 4 images per post, and counts characters the way X does (links count as 23, most emoji and CJK characters as 2). Accounts with X Premium can write long posts of up to 25,000 characters.",
          },
          {
            type: "ul",
            items: [
              "**Post now, schedule, or add to queue**: the queue fills time slots (09:00, 13:00 and 18:30 every day by default) that you can change.",
              "**Best time to post**: a week-by-24-hour heat map built from your own posts' engagement and when your followers are active.",
              "**Calendar, drafts and 52 templates** (hooks, threads, lists, stories and more), your own templates and a \"Thread it\" splitter.",
              "**Posting safety**: a daily cap (20 by default), a minimum gap of 5 minutes, and a pause on any X warning. A post that is more than 6 hours late (for example because the computer was off) is never posted by itself; it waits as \"missed\".",
              "**Free vs Premium**: free keeps up to 10 posts or threads waiting in the queue. Premium adds unlimited scheduling, **evergreen recycling** of your best posts and **auto-plug**, which replies to a post with your call to action once it takes off.",
            ],
          },
          {
            type: "p",
            text: "See the [Twitter post scheduler](/features/twitter-post-scheduler) page for details.",
          },
        ],
      },
      {
        id: "ai",
        heading: "GrowX AI: a private writing assistant (Premium)",
        blocks: [
          {
            type: "p",
            text: "GrowX AI helps you **write, improve, find hooks, turn a draft into a thread, get reply ideas and read a weekly summary**. It runs on your own computer using the AI model built into Chrome, so there is no API key, no extra cost and nothing is sent to GrowX. It uses your niche and voice settings and does not invent facts: where it needs a detail it does not know, it leaves a placeholder for you to fill in.",
          },
          {
            type: "p",
            text: "It needs a recent desktop Chrome with enough memory and disk space, and Chrome downloads the model once. If your browser cannot run it, the AI buttons fall back to templates and the plain thread splitter, so Create keeps working. Read more on the [AI tweet writer](/features/ai-tweet-writer) page.",
          },
        ],
      },
      {
        id: "engage",
        heading: "Engage: Reply targets and people",
        blocks: [
          {
            type: "p",
            text: "Replies are one of the best ways for a small account to be seen, and timing matters. **Reply targets** collects fresh posts (younger than 120 minutes by default) from your sources, your VIPs and anyone you add, ranked by freshness and by how fast they are taking off, so you can reply early. You can reply and like from GrowX, but nothing is sent unless you press the button. Premium adds AI reply ideas.",
          },
          {
            type: "p",
            text: "**People** keeps tags, notes, VIP and watch flags, your mutuals and the fans you do not follow back yet. With Premium, **VIP alerts** notify you when a VIP posts. See [Reply targets](/features/twitter-reply-targets).",
          },
        ],
      },
      {
        id: "insights",
        heading: "Insights: analytics, unfollowers and goals",
        blocks: [
          {
            type: "ul",
            items: [
              "**Post analytics**: views, likes, reposts, replies, bookmarks and engagement rate, refreshed every 3 hours while x.com is open. Free covers your latest 30 posts; Premium full analytics adds which posts brought followers.",
              "**What works**: topics and formats compared by engagement.",
              "**Follower tracker**: once a day, who followed and who unfollowed you. Free keeps 7 days of history; Premium keeps the full history and adds one-click unfollow back.",
              "**Follower quality** and a **weekly report** on Premium; **top fans**, a growth chart, daily goals with streaks and milestones, and a monthly goal planner.",
            ],
          },
          {
            type: "p",
            text: "Insights reads everything through an x.com tab that is already open, at most one small step per minute. Details on the [Twitter analytics](/features/twitter-analytics) page.",
          },
        ],
      },
      {
        id: "cleanup",
        heading: "Cleanup: review first, then unfollow slowly",
        blocks: [
          {
            type: "p",
            text: "Cleanup scans who you follow and who follows you, then lists accounts that are **not following back** and accounts that are **inactive** (latest post older than 30, 90, 180 or 365 days). Unknown activity is never called inactive, and partial scans are marked unverified with bulk select turned off. You review and select; GrowX re-checks each account right before it unfollows it, at a safe pace of up to 30 an hour and 200 a day.",
          },
          {
            type: "p",
            text: "Free covers up to 200 unfollows per run. Premium adds select-all bulk unfollow of up to 5,000 in one run, a Balanced unfollow pace (45 an hour, 320 a day) and **automatic cleanup**, which unfollows GrowX's own follows that did not follow back after 2, 5 or 7 days, only during autopilot breaks, and never touches accounts you followed yourself or imported. The [unfollow guide](/blog/unfollow-non-followers-twitter) covers a safe routine.",
          },
        ],
      },
      {
        id: "accounts",
        heading: "Accounts, Premium and the free trial",
        blocks: [
          {
            type: "ul",
            items: [
              "**Free forever.** The free plan is meant for daily use: Safe and Balanced paces, core filters, the scheduler with up to 10 queued posts, analytics for your latest 30 posts, 7 days of follower history and cleanup of up to 200 per run.",
              "**30-day Premium trial.** Free, no credit card, once per account, started from your dashboard on this website after you [create an account](/signup).",
              "**Premium plans.** $1.99 for 30 days, $14.99 for 365 days, or $59.99 for lifetime access ($29.99 for the first 100 lifetime buyers). Plans are prepaid and do not renew automatically. Payment is in cryptocurrency through NOWPayments.",
              "**X accounts and workspaces.** Every GrowX account can link 2 X usernames for free, with extra slots at $0.99 each (one-time). Premium gives each X account its own workspace.",
              "**Server-side plans.** The extension signs in with your GrowX account, and your plan is decided on the server from verified records, not by anything the browser claims.",
            ],
          },
          {
            type: "p",
            text: "Compare everything on the [pricing page](/pricing).",
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
              "**Start slow.** Use the Safe pace and warm-up on a new or quiet account; move to Balanced once things look healthy.",
              "**Give the autopilot a rhythm.** Active hours are off by default. Turning them on (08:00 to 23:30 by default when enabled) keeps following to the hours a real person is awake.",
              "**Stay well under X's limits.** X sets and changes its own limits. The faster presets are for aged accounts, and the X Premium pace only for accounts with X Premium.",
              "**Post and reply.** Keep a steady queue of posts and reply early to fresh posts in your niche. Accounts with real activity earn more follow-backs and draw less scrutiny.",
              "**Respect warnings.** If GrowX rests after a warning from X, let it. Do not restart at full speed.",
              "**Unfollow slowly.** Use Cleanup after 7-14 days and not on the same day as heavy following.",
              "**Read X's rules.** Automation rules change; you are responsible for following them.",
            ],
          },
        ],
      },
      {
        id: "principles",
        heading: "Principles that will not change",
        blocks: [
          {
            type: "p",
            text: "As the product grows, a few commitments are meant to stay fixed:",
          },
          {
            type: "ul",
            items: [
              "**Useful free tier.** A freemium model only works if the free plan is genuinely usable for daily growth, so core features, safety controls and your own data are not paywalled.",
              "**Safety is never a Premium feature.** The emergency stop, adaptive slow-down, follow verification, following-cap guard, active hours and warm-up are on every plan.",
              "**Server-side decisions.** Plan checks are made by the server from verified records, never from a flag the browser sends. Paid access is only granted after a payment provider's verified confirmation.",
              "**No fake numbers.** No invented testimonials, counts or countdowns. The early-bird counter on the pricing page shows the real number of spots left, read from our database.",
              "**Your data stays yours.** The extension keeps your X data, posts and analytics in your browser, GrowX AI runs on your computer, and account features on this site store only what accounts and billing need, as described in the [privacy policy](/privacy).",
            ],
          },
          {
            type: "p",
            text: "Because the extension runs on your computer, any restriction it enforces can in principle be bypassed by someone determined. The goal is a fair, honest model rather than an unbreakable lock: Premium should be worth paying for because it saves time and adds capability, not because the free version is crippled.",
          },
        ],
      },
      {
        id: "next",
        heading: "What comes next",
        blocks: [
          {
            type: "p",
            text: "GrowX is updated regularly, and the extension's **What's new** window shows what changed in each version. We do not publish dated promises about future features: the pages on this site describe the version you can install today, and nothing unreleased is described as if it exists.",
          },
          {
            type: "p",
            text: "The best way to shape what comes next is to tell us what you need. Feature requests and bug reports go straight to the developer through [support](/contact). If you have not tried GrowX yet, [create a free account](/signup) and start the 30-day Premium trial to test every feature before you decide.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Is GrowX still an auto follow extension?",
        a: "Smart auto follow is still at its core, but GrowX 2.4.4 is a complete X (Twitter) growth tool: it also schedules posts and threads, writes with on-device AI (Premium), tracks analytics and unfollowers, surfaces Reply targets and cleans up your following list.",
      },
      {
        q: "Is there still a free plan?",
        a: "Yes, free forever. It includes the Safe and Balanced paces, core filters, the scheduler with up to 10 queued posts, analytics for your latest 30 posts, 7 days of follower history and cleanup of up to 200 per run.",
      },
      {
        q: "How do I request a feature?",
        a: "Send it through the contact page. Requests and bug reports go straight to the developer. We do not publish dated promises, so check the What's new window in the extension to see what each update added.",
      },
    ],
  },
];

export const posts: Post[] = [...corePosts, ...growthPosts, ...createPosts, ...insightPosts, ...strategyPosts, ...profilePosts];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const latestFirst = () => [...posts].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
