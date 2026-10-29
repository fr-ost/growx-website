# GrowX product facts (extension v2.4.4)

The single reference for website copy. Every claim on the site and in the blog must match this file, which was
taken from the extension source (manifest, `shared/config.js`, `shared/plan.js`, `shared/whatsnew.js`,
`shared/learn.js`, `shared/insights.js`, `shared/content.js`, `background-*.js`). When the extension changes,
update this file first.

## Identity
- Name: **GrowX: The Ultimate X (Twitter) Growth Tool** (manifest name). Short name: GrowX. Version 2.4.4.
- Store description: "All-in-one X (Twitter) growth: smart auto follow, post scheduler, on-device AI writer, analytics, unfollower tracker, reply targets."
- A Chrome extension (Chrome 116+, desktop: Windows, macOS, Linux, ChromeOS). Not a mobile app.
- Works inside the user's own signed-in x.com session. Never asks for the X password, does not use X OAuth.
- Developer: Shahriar Ahmed. Website: www.growxapp.org. GrowX is independent, not affiliated with X Corp.
- Dashboard areas: **Home, Grow, Create, Engage, Insights, Cleanup, Settings** (+ Help). Popup with pace switch, Start/Pause/Stop and a quick post box.

## Grow (smart auto follow)
- Add **source profiles** (accounts in your niche); GrowX follows their **newest followers**. "Find sources for me" auto-finds sources from the accounts you follow (ranks them by how active, mid-sized and follow-back-prone their audience is). "Find people now" harvests immediately.
- **Recent followers first**: each source's newest followers (top 50 of the list by default) are followed first; they skip the score but keep safety checks (no private, no photo-less, no zero-post, no giant accounts, your exclude keywords).
- Everyone else is queued by a **follow-back score 1-99** (follow ratio, audience size, how many they follow, follow-back words in bio, recent activity, account age, photo/bio, verified, recency). Default minimum 55. Queue keeps ~250 candidates; candidates older than 72 h are dropped; sources are re-read every hour (3 pages).
- **Smart score (Premium)**: a small model learned from YOUR own follow-backs (logistic regression, needs ~80 settled follows with at least 12 follow-backs and 12 non-follow-backs, checked on a holdout, blended in at up to 60% weight only when it clearly beats chance).
- **More source types (Premium)**: a post's reposts, replies and likes; searches and #hashtags; X Lists.
- **Auto-replace weak sources (Premium)**: after a fair trial, weak sources are retired and replaced with the best auto-found one (restorable).
- **Source leaderboard**: follow-back rate, retention and cost per source.
- Pace presets (seconds between follows, rest, rolling caps):
  - Safe: 45-110 s, rest every 12, up to 18/hour, ~150/day (new accounts)
  - Balanced: 30-75 s, rest every 18, up to 28/hour, ~280/day (recommended, default)
  - Turbo (Premium): 18-45 s, rest every 25, up to 40/hour, ~390/day (aged accounts)
  - X Premium (Premium): 12-32 s, rest every 35, up to 60/hour, ~800/day (accounts with X Premium only)
  - Custom (above Balanced is Premium)
- Safety: random delays, breaks, 8% longer pauses, optional active hours (08:00-23:30 default when turned on) and days, optional warm-up (daily cap starts at 60, +20/day), session target, following-cap guard (5,000 or ~10% above your follower count), adaptive slow-down after any X warning, follow verification (shadow-limit detection), stops on sign-out/lock/challenge/repeated automation warnings, emergency stop **Alt+Shift+S**, keeps the computer awake while running, resumes after Chrome restarts, runs in the background (service worker).
- Filters (core, free): skip already-followed / follows-you, private, no photo, optional bio, min/max followers (15 / 8,000), min following (40), min ratio 0.4, min posts (5), min account age (30 d), last active (45 d), exclude keywords (adult terms by default), follow-back boost words.
- Advanced filters (Premium): include keywords, location keywords, verified-only / skip verified, account age and last-active rules.
- List import (Premium): paste a list of usernames to follow first.
- Never-follow list (blacklist).

## Create (posts and threads)
- Composer: posts and **threads** (up to 25 parts), up to 4 images per post, X's own character counting (links count 23, most emoji/CJK count 2), long posts for X Premium accounts (25,000).
- **Post now, schedule, or Add to queue** (Buffer-style queue slots; default 09:00, 13:00, 18:30, every day).
- **Best time to post**: a week x 24 h heat map from your own posts' engagement and when your followers are active.
- **Calendar**, **drafts**, **52 templates** (hooks, threads, lists, stories...), your own templates, "Thread it" splitter.
- Posting safety: daily cap (20 by default), minimum gap (5 min), pauses on any X warning; a post more than 6 hours late (computer was off) is never posted by itself, it waits as "missed". Posts only as the X account it was written for.
- Free: up to **10 posts/threads waiting** in the queue at once. **Unlimited scheduling (Premium)**.
- **Evergreen recycling (Premium)**: best posts posted again every N days (30 default) with rotating variants, or reposted.
- **Auto-plug (Premium)**: once a post takes off (50 likes default), GrowX replies to it with your call to action.
- Quick post box in the popup.

## GrowX AI (Premium)
- Write, Improve, Hooks, Thread it, reply ideas and a weekly summary.
- Runs **on the user's computer** using the AI model built into Chrome: private, free, no API key, nothing sent to GrowX. Uses your niche and voice settings. Never invents facts (uses {placeholders}).
- Needs a recent desktop Chrome with enough memory/disk; Chrome downloads the model once. When unavailable, the AI buttons fall back to templates and the plain thread splitter.

## Insights
- **Post analytics**: views, likes, reposts, replies, bookmarks and engagement rate of your recent posts, refreshed every 3 hours while x.com is open. Free: your latest **30 posts**.
- **What works**: topics and formats (questions, images, text, threads, links) by engagement.
- **Which posts brought followers**: new followers in the 24 h after each post above your usual pace (Premium, part of Full analytics).
- **Follower tracker**: once a day, who followed and who **unfollowed** you. Free: **7 days** of history. **Full follower history + one-click unfollow back (Premium)**.
- **Follower quality (Premium)**: real & active / inactive (90+ days) / likely bot / private, from your newest followers, on request.
- **Top fans**: who likes and replies to you most.
- **Weekly report (Premium)**: this week vs last week (new followers, unfollowers, best posts), Monday notification.
- Growth chart, history, daily goals (posts, replies, new followers), **streaks and milestones**, monthly goal planner.
- Everything is read through an x.com tab that is already open, one small step per minute at most.

## Engage
- **Reply targets**: fresh posts (default: younger than 120 minutes) from your sources, VIPs and anyone you add, ranked by freshness and how fast they take off, so you can reply early. Reply and like from GrowX (only when you press the button; nothing is sent by itself). AI reply ideas (Premium).
- **People**: tags, notes, VIP and watch flags, mutuals, fans you don't follow back yet.
- **VIP alerts (Premium)**: a notification when a VIP posts.

## Cleanup
- Scan following + followers. **Not following back** and **Inactive** (latest post older than 30/90/180/365 days). Unknown activity is never called inactive; partial scans are "unverified" (bulk select off).
- Review, filter, select, then unfollow at a safe pace; each account re-checked right before unfollow. Safe pace: up to 30/hour, 200/day. Free: up to **200 per run**.
- **Bulk unfollow (Premium)**: select all, up to 5,000 in one run. **Balanced unfollow pace (Premium)**: 45/hour, 320/day.
- **Automatic cleanup (Premium)**: unfollows GrowX's own follows that didn't follow back after 2, 5 or 7 days, only during autopilot breaks, 40-90 s apart, same 30/h and 200/day caps; never touches accounts you followed yourself or imported.

## Everything else
- **Multiple X accounts: a workspace per X account (Premium)**. Every GrowX account links 2 X usernames free; extra slots $0.99 each (one-time).
- Optional **Chrome sync** of settings, sources, never-follow list, people and templates (through Chrome's own sync storage, no GrowX server).
- Setup wizard, What's new window, **8 colour themes**, dark mode, density/font options, **command palette (Ctrl+K)**, phone and tablet layouts.
- Backup and restore (export/import a file).
- Data: settings, queue, history, posts and analytics stay in the browser (`chrome.storage`). Optional anonymous usage counts (random install id, version, coarse counts; no X data) can be switched off.

## Plans (website is the source of truth for prices)
- Free forever. 30-day Premium trial: free, no credit card, once per account, started from the website dashboard.
- Premium: $1.99 / 30 days, $14.99 / 365 days, $59.99 lifetime ($29.99 for the first 100 lifetime buyers). Prepaid, no auto-renew. Paid in crypto via NOWPayments.

## Copy rules
- No invented user counts, ratings, testimonials or guaranteed results. Screenshots use demo data; never quote their numbers as results.
- No tool can promise zero risk on X; say so where safety is discussed.
- Use both "X" and "Twitter".
