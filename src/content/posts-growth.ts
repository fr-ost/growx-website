import type { Block, Post } from "./posts";

/**
 * Search-intent guides: how to grow on X (Twitter), bulk/mass follow, follow-back score, unfollowing, tool choice.
 * Same rules as posts.ts: facts come from the shipped extension and the site's own pages; no invented statistics,
 * testimonials or result promises; X's own limits are described without hard numbers that X may change.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-25";
const TRY = "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed. See the [plans](/pricing) or read [how GrowX works](/how-it-works).";

export const growthPosts: Post[] = [
  {
    slug: "how-to-grow-on-twitter-x",
    seoTitle: "How to Grow on Twitter (X): A Practical Plan",
    title: "How to Grow on Twitter (X): A Practical Follower Growth Plan That Uses GrowX",
    description:
      "How to grow on Twitter (X) step by step: profile, content, engagement and smart following. See where GrowX fits into a safe follower growth routine.",
    excerpt: "A realistic plan for growing a Twitter (X) account: the profile, the posting habit, the people you engage with and how GrowX handles the following part.",
    category: "Guides",
    keywords: ["how to grow on Twitter", "how to grow on X", "grow Twitter followers", "Twitter growth tool", "increase X followers", "GrowX"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 8,
    related: ["first-1000-followers-on-x", "best-twitter-growth-tools", "bulk-follow-twitter-safely"],
    sections: [
      {
        id: "intro",
        heading: "What actually makes a Twitter (X) account grow",
        blocks: [
          p("If you search **how to grow on Twitter**, you will find two kinds of advice: posting advice and automation tricks. Both matter, but neither works alone. Growth on X comes from three things working together: a profile that gives a stranger a reason to follow, content that gives them a reason to stay, and a steady flow of the right people discovering you. **GrowX** is a Chrome extension that helps with the third part, finding and following relevant people at a human pace, so you can spend your own time on the first two."),
          p("This guide gives you a realistic plan. Nothing here is a guarantee: results depend on your niche, your content and how consistent you are. If a tool or a guide promises a fixed number of followers, treat that as a warning sign."),
        ],
      },
      {
        id: "profile",
        heading: "Step 1: Make your profile worth following",
        blocks: [
          p("People decide in a few seconds. Before you follow anyone or post anything, fix the basics:"),
          ul(
            "**A clear photo and header.** Accounts without a profile photo look like bots, and GrowX itself skips them when it scores candidates. Do not look like one.",
            "**A bio that says who you help or what you post about.** \"Founder building X for Y\" beats a list of emojis.",
            "**A pinned post** that shows your best work or explains what a new follower will get.",
            "**A link** to your site, newsletter or product so interest has somewhere to go.",
          ),
        ],
      },
      {
        id: "content",
        heading: "Step 2: Post on a schedule you can keep",
        blocks: [
          p("Consistency beats intensity. Pick a rhythm you can hold for months, for example one useful post a day plus a few replies, and stick to it. Mix formats: short opinions, step-by-step threads, screenshots of real work and questions that invite replies. Write about one niche for the first few months so the people you attract all want the same thing."),
          note("Following people only pays off if your profile and recent posts reward the visit. Automation sends people to your profile; your content decides whether they follow back."),
        ],
      },
      {
        id: "engage",
        heading: "Step 3: Engage where your audience already is",
        blocks: [
          p("Reply thoughtfully to accounts in your niche, especially ones slightly larger than you. A good reply is often seen by far more people than a post from a small account. Spend ten to fifteen minutes a day on replies and you will start being recognised by the people you want to reach."),
        ],
      },
      {
        id: "follow",
        heading: "Step 4: Follow the right people, at a human pace",
        blocks: [
          p("Following relevant accounts is the oldest growth tactic on X and it still works when it is targeted. The mistake is volume without selection. GrowX is built around selection:"),
          ul(
            "You add **source profiles**, accounts your ideal audience already follows, and GrowX reads their newest followers, who are active right now.",
            "Every candidate gets a **follow-back score from 1 to 99** and must pass your filters (audience size, activity, profile photo and more) before it is queued. [How the score works](/blog/twitter-follow-back-score-growx).",
            "The autopilot follows **one account at a time** with random delays, breaks, active hours and hourly and daily caps. [Pacing explained](/blog/how-growx-auto-follow-works).",
            "It slows down or stops when X shows a warning, and you can stop it instantly with Alt + Shift + S.",
          ),
          p("Start with the **Safe** pace for a new account and move to **Balanced** after a few clean days."),
        ],
      },
      {
        id: "measure",
        heading: "Step 5: Measure and adjust weekly",
        blocks: [
          p("Once a week, look at what worked. GrowX tracks who followed back and shows the follow-back rate of each source, so you can keep the sources that bring real followers and replace the rest. Compare that with your best posts of the week and do more of what both lists have in common."),
          ol(
            "Pick 3 to 5 sources that match your niche closely.",
            "Run Safe or Balanced pace within active hours.",
            "Review the queue and raise the minimum score if it feels noisy.",
            "After a couple of weeks, run the cleanup scan and unfollow accounts that never followed back. See [how to unfollow non-followers safely](/blog/unfollow-non-followers-twitter).",
          ),
        ],
      },
      {
        id: "try",
        heading: "Start growing with GrowX",
        blocks: [p(TRY)],
      },
    ],
  },
  {
    slug: "first-1000-followers-on-x",
    seoTitle: "How to Get Your First 1,000 Followers on X (Twitter)",
    title: "How to Get Your First 1,000 Followers on X (Twitter): A 30-Day Plan With GrowX",
    description:
      "A 30-day plan to reach your first 1,000 followers on X (Twitter): set up, post, engage and use GrowX for safe, targeted following. No guarantees, just method.",
    excerpt: "A week-by-week plan for your first 1,000 X followers, combining profile work, daily posting, replies and targeted following with GrowX.",
    category: "Guides",
    keywords: ["first 1000 followers on Twitter", "get 1000 followers on X", "gain Twitter followers", "grow a new Twitter account", "GrowX", "Twitter follow back"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 8,
    related: ["how-to-grow-on-twitter-x", "mass-follow-twitter-limits", "twitter-follow-back-score-growx"],
    sections: [
      {
        id: "intro",
        heading: "Is 1,000 followers in 30 days realistic?",
        blocks: [
          p("It depends on your niche, your content and how much time you give it, so no honest guide can promise it. What a plan can do is remove wasted effort. This one is a 30-day routine for a **new or small X account**. Treat the number as a target to work towards, not a promise, and adjust the plan using your own results."),
          p("The routine combines manual work (profile, posts, replies) with **GrowX** for the repetitive part: finding people likely to follow back and following them at a safe pace."),
        ],
      },
      {
        id: "week1",
        heading: "Week 1: Set up and warm up",
        blocks: [
          ul(
            "Finish your profile: photo, header, clear bio, pinned post and a link.",
            "Install GrowX, add **3 to 5 source profiles** in your niche and keep the **Safe** pace.",
            "Turn on **active hours** and the **warm-up** so a new account ramps up gradually instead of jumping to its daily cap.",
            "Post once a day and write 5 to 10 thoughtful replies to accounts in your niche.",
          ),
          note("A brand-new account that follows hundreds of people on day one looks unnatural. Warm-up exists for exactly this reason."),
        ],
      },
      {
        id: "week2",
        heading: "Week 2: Raise quality, not just volume",
        blocks: [
          p("Open the queue and look at who GrowX is lining up. If many candidates look irrelevant, raise the **minimum follow-back score** (55 by default) or tighten the filters. If the queue is thin, lower it a little. Then check **source performance** in Analytics and drop sources with a poor follow-back rate."),
          ul(
            "Keep posting daily. Try one thread or one \"how I did X\" post this week.",
            "Reply to the accounts your new followers engage with, since their audience overlaps with yours.",
          ),
        ],
      },
      {
        id: "week3",
        heading: "Week 3: Double down on what works",
        blocks: [
          p("By now you have data. Which posts earned follows? Which sources produced follow-backs? Write more of the former and add sources similar to the latter. If your account has stayed clean (no warnings), you can move up to the **Balanced** pace."),
        ],
      },
      {
        id: "week4",
        heading: "Week 4: Clean up and keep the habit",
        blocks: [
          p("Run the **cleanup scan** to see who you follow that does not follow back, and unfollow those you chose to review. Keeping a healthy following-to-followers ratio makes your profile look more credible and keeps room under X's following limits. Details in [our unfollow guide](/blog/unfollow-non-followers-twitter)."),
          p("Set a monthly goal in the GrowX goal planner so you can see the daily pace you need and whether you are on track."),
        ],
      },
      {
        id: "mistakes",
        heading: "Mistakes that slow new accounts down",
        blocks: [
          ul(
            "Following thousands of random accounts with no filters.",
            "Pushing to the fastest pace before the account has history. Read [X follow limits and mass-follow risks](/blog/mass-follow-twitter-limits).",
            "Posting about five different topics, so nobody knows why to follow you.",
            "Ignoring replies and DMs from the people who do follow.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Try the plan",
        blocks: [p(TRY)],
      },
    ],
  },
  {
    slug: "bulk-follow-twitter-safely",
    seoTitle: "Bulk Follow on Twitter (X) Safely: GrowX Guide",
    title: "Bulk Follow on Twitter (X) Safely: How to Follow in Bulk Without Looking Like a Bot",
    description:
      "How to bulk follow on Twitter (X) the safe way: pick sources, filter by follow-back score and follow at a human pace with GrowX instead of risky mass scripts.",
    excerpt: "Bulk following does not have to mean reckless following. Here is how to follow many relevant people on X at a safe pace.",
    category: "Guides",
    keywords: ["bulk follow Twitter", "bulk follow on X", "Twitter bulk follow tool", "follow multiple accounts Twitter", "auto follow Chrome extension", "GrowX"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 8,
    related: ["mass-follow-twitter-limits", "twitter-follow-back-score-growx", "how-growx-auto-follow-works"],
    sections: [
      {
        id: "intro",
        heading: "What \"bulk follow\" should mean",
        blocks: [
          p("People who search **bulk follow Twitter** usually want one thing: follow many relevant accounts without clicking the follow button hundreds of times. That is a fair goal. The risk is how it is done. Tools that blast follows as fast as possible get accounts rate-limited, locked or suspended, and they follow people who will never follow back."),
          p("**GrowX** treats bulk following as a pipeline: choose where candidates come from, filter and score them, then follow the best ones slowly, over hours and days. You still end up following hundreds of relevant accounts, but they arrive at a pace that looks human."),
        ],
      },
      {
        id: "sources",
        heading: "Step 1: Choose sources your audience already follows",
        blocks: [
          p("Add accounts in your niche as **source profiles**: creators, brands or communities. GrowX reads each source's newest followers, who are recently active and already interested in your topic. Three to five close matches beat twenty loose ones."),
        ],
      },
      {
        id: "filters",
        heading: "Step 2: Filter and score before following",
        blocks: [
          p("Bulk following only works if the list is good. GrowX removes accounts you already follow, private accounts, accounts without a profile photo and accounts that are too new, inactive, small or large (limits you can change). Survivors get a **follow-back score from 1 to 99**, and only those above your minimum (55 by default) join the queue. [See how the score is built](/blog/twitter-follow-back-score-growx)."),
          p("You can also **import your own list** of usernames to follow first, which is handy for event attendees, a newsletter community or a list you researched yourself."),
        ],
      },
      {
        id: "pace",
        heading: "Step 3: Follow in bulk at a safe pace",
        blocks: [
          ul(
            "**Safe**: 45 to 110 seconds between follows, up to 18 an hour and about 150 a day.",
            "**Balanced**: 30 to 75 seconds, up to 28 an hour and about 280 a day.",
            "**Turbo** and **X Premium pace** are faster presets for aged accounts, available on the Premium plan.",
          ),
          p("These are the extension's own caps; X also enforces limits that it can change at any time. Add **active hours** so the autopilot does not run around the clock, and let the **adaptive slow-down** reduce the pace automatically if X shows a warning."),
        ],
      },
      {
        id: "safety",
        heading: "Step 4: Keep an eye on safety signals",
        blocks: [
          ul(
            "Every tenth follow is verified to confirm it really stuck.",
            "GrowX stops when you are signed out, when the account is locked, or after repeated automation warnings, and it never clicks through a challenge.",
            "Alt + Shift + S stops everything immediately.",
          ),
          note("No tool can promise zero risk on X. You remain responsible for following X's rules and for the accounts you follow."),
        ],
      },
      {
        id: "try",
        heading: "Bulk follow with GrowX",
        blocks: [p(TRY)],
      },
    ],
  },
  {
    slug: "mass-follow-twitter-limits",
    seoTitle: "Mass Follow on Twitter: X Follow Limits & Risks",
    title: "Mass Follow on Twitter (X): Follow Limits, Risks and a Safer Way to Do It",
    description:
      "Thinking about mass following on Twitter (X)? Learn how follow limits work, what gets accounts restricted and how GrowX keeps mass following within safe pacing.",
    excerpt: "What really happens when you mass follow on X, why limits exist and how to stay inside them.",
    category: "Guides",
    keywords: ["mass follow Twitter", "Twitter follow limit", "X follow limit per day", "Twitter follow limit reached", "safe Twitter auto follow", "GrowX"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 8,
    related: ["bulk-follow-twitter-safely", "first-1000-followers-on-x", "how-growx-auto-follow-works"],
    sections: [
      {
        id: "intro",
        heading: "Why mass following gets accounts in trouble",
        blocks: [
          p("**Mass follow** means following a very large number of accounts quickly, hoping some follow back. X treats sudden, repetitive following as spam-like behaviour. Possible consequences range from a temporary \"you are unable to follow more accounts\" message to locked or suspended accounts. The exact thresholds are not fixed and X can change them, so check X's Help Center for the current rules."),
        ],
      },
      {
        id: "limits",
        heading: "How X follow limits work",
        blocks: [
          p("Two kinds of limits matter:"),
          ul(
            "**Rate limits**: a cap on how many accounts you can follow per day, with shorter bursts also watched. Newer and lower-trust accounts tend to be treated more strictly.",
            "**The following cap**: everyone can follow up to 5,000 accounts; beyond that, how many people you can follow depends on how many follow you. This is why a healthy ratio matters.",
          ),
          p("Hitting a limit once is a sign to slow down, not to try again harder. Repeatedly pushing against limits is what leads to restrictions."),
        ],
      },
      {
        id: "signs",
        heading: "Behaviours that look automated",
        blocks: [
          ul(
            "Following at perfectly even intervals, day and night.",
            "Following in huge bursts right after signing up or after a long quiet period.",
            "Following accounts that obviously do not match your niche.",
            "Following then unfollowing en masse within a day or two.",
          ),
        ],
      },
      {
        id: "safer",
        heading: "A safer way to mass follow with GrowX",
        blocks: [
          p("GrowX is designed around avoiding those patterns:"),
          ul(
            "**Random delays and regular breaks**, plus occasional longer pauses, so follows are not evenly spaced.",
            "**Active hours and warm-up**, so it does not run around the clock and new accounts ramp up slowly.",
            "**Rolling hourly and daily caps** (Safe about 150 a day, Balanced about 280 a day).",
            "**Targeted candidates only**: filters and a follow-back score keep irrelevant accounts out of the queue.",
            "**Adaptive slow-down and hard stops** after any warning, rate limit, lock or sign-out.",
            "**Following cap guard** that pauses at X's cap instead of hammering it.",
          ),
          note("These measures reduce risk; they cannot remove it. Start on the Safe pace, and only move up once your account has a clean history."),
        ],
      },
      {
        id: "unfollow",
        heading: "Mass following needs mass tidying",
        blocks: [
          p("After a campaign, review who did not follow back. Do it gradually rather than in one burst: see our guide to [unfollowing non-followers safely](/blog/unfollow-non-followers-twitter)."),
        ],
      },
      {
        id: "try",
        heading: "Follow smarter",
        blocks: [p(TRY)],
      },
    ],
  },
  {
    slug: "twitter-follow-back-score-growx",
    seoTitle: "Twitter Follow-Back Score: How GrowX Scores Accounts",
    title: "Twitter Follow-Back Score Explained: How GrowX Finds Accounts That Follow Back",
    description:
      "What is a Twitter (X) follow-back score? Learn the signals GrowX uses to rate accounts 1-99 and how to tune the minimum score for quality or volume.",
    excerpt: "The follow-back score (sometimes searched as a Twitter growth score) is how GrowX decides who is worth following. Here is what goes into it.",
    category: "Features",
    keywords: ["Twitter follow back score", "Twitter growth score", "who will follow back on Twitter", "X follow back rate", "find accounts that follow back", "GrowX"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["bulk-follow-twitter-safely", "growx-features-guide-scoring-filters-cleanup", "best-twitter-growth-tools"],
    sections: [
      {
        id: "intro",
        heading: "What is a follow-back score?",
        blocks: [
          p("When you follow someone hoping they follow back, you are betting on a person you know little about. The **GrowX follow-back score** replaces the guess with an estimate. Each candidate gets a number from **1 to 99**, the estimated chance that they follow back, based on public profile data. It starts at a neutral 50 and moves with the signals below."),
          note("The score is an estimate, not a promise about any one account. Its job is to put likelier accounts first, so your follows are spent where they are most likely to pay off."),
        ],
      },
      {
        id: "signals",
        heading: "The signals behind the score",
        blocks: [
          ul(
            "**Follow ratio**: accounts that follow many more people than follow them score higher.",
            "**Audience size**: small and mid-sized accounts score better than very large ones.",
            "**How many accounts they follow**: people who follow hundreds or thousands are likelier to follow back.",
            "**Follow-back language** in the bio or name, such as \"follow back\", \"f4f\" or \"mutuals\" (the keyword list is editable).",
            "**Recent activity**: a recent post raises the score, long silence lowers it.",
            "**Profile quality and age**: very new accounts and accounts without a photo or bio score lower; verified accounts get a small bump.",
            "**Freshness**: being one of a source's newest followers adds a little.",
          ),
        ],
      },
      {
        id: "tuning",
        heading: "Choosing your minimum score",
        blocks: [
          p("The minimum score (55 by default) decides who enters the queue. Around 40 favours volume; around 70 favours quality and a smaller, cleaner queue. The queue shows score bands (below 50, 50 to 59, 60 to 69, 70 to 79 and 80 and above), so you can see how your candidates are distributed before you change anything."),
        ],
      },
      {
        id: "filters",
        heading: "Score plus filters",
        blocks: [
          p("Hard filters run before scoring: skip accounts you follow or that already follow you, private accounts, no profile photo, too new, too inactive, too small or too large. The score then ranks whoever remains. Advanced keyword, location and verified filters are available on Premium. Full list in the [features guide](/blog/growx-features-guide-scoring-filters-cleanup)."),
        ],
      },
      {
        id: "improve",
        heading: "Using the score to improve results",
        blocks: [
          ol(
            "Start at the default and let GrowX follow for a few days.",
            "Open Analytics and compare the follow-back rate of each source.",
            "Raise the minimum score if the rate is low; lower it if the queue runs dry.",
            "Replace weak sources with ones that match your best-performing followers.",
          ),
        ],
      },
      {
        id: "try",
        heading: "See the score in action",
        blocks: [p(TRY)],
      },
    ],
  },
  {
    slug: "unfollow-non-followers-twitter",
    seoTitle: "Unfollow Non-Followers on Twitter (X) Safely | GrowX",
    title: "How to Unfollow Non-Followers on Twitter (X): A Safe Bulk Unfollow Guide",
    description:
      "How to find and unfollow people who don't follow you back on Twitter (X), including inactive accounts, with GrowX's cleanup scan and safe unfollow pacing.",
    excerpt: "Find accounts that don't follow back or have gone quiet, review them and unfollow at a safe pace.",
    category: "Guides",
    keywords: ["unfollow non-followers Twitter", "bulk unfollow Twitter", "mass unfollow Twitter", "who doesn't follow me back on Twitter", "unfollow inactive accounts", "GrowX"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["mass-follow-twitter-limits", "growx-features-guide-scoring-filters-cleanup", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "why",
        heading: "Why clean up who you follow",
        blocks: [
          p("After a growth push, your following list is full of people who never followed back and accounts that have gone quiet. Tidying it keeps your ratio healthy, makes your profile look more credible and leaves room under X's following cap. The trick is doing it **gradually and with review**, not by unfollowing everyone in one go."),
        ],
      },
      {
        id: "scan",
        heading: "Find who to unfollow with the GrowX cleanup scan",
        blocks: [
          p("The Cleanup page scans who you follow and who follows you, then shows results for you to review before anything happens."),
          ul(
            "**Not following back**: accounts you follow that do not follow you. If your followers list could not be read to the end, those rows are marked \"unverified\" and bulk select is turned off for that view.",
            "**Inactive accounts**: those whose latest post is older than 30, 90, 180 or 365 days. If X does not say when an account last posted, it is labelled \"unknown\", never \"inactive\".",
          ),
        ],
      },
      {
        id: "review",
        heading: "Review before you unfollow",
        blocks: [
          p("You filter, search, sort and select the accounts yourself. Keep accounts you value even if they do not follow back, such as friends, customers or creators you learn from. GrowX only touches the accounts you selected and confirmed, and each one is re-checked with X right before it is unfollowed."),
        ],
      },
      {
        id: "pace",
        heading: "Unfollow at a safe pace",
        blocks: [
          p("Unfollows run one at a time with delays, breaks and rolling caps (Safe: up to 30 an hour and 200 a day; Balanced: 45 an hour and 320 a day). The runner stops on a rate limit, warning, sign-out or lock and does not retry or work around them. Scanning and manual selection are free; large select-all batches and automatic cleanup after 2, 5 or 7 days are Premium features."),
          note("Avoid following heavily and unfollowing heavily on the same day. Alternate, and keep both paced."),
        ],
      },
      {
        id: "routine",
        heading: "A simple weekly routine",
        blocks: [
          ol(
            "Give new follows a week or two to follow back.",
            "Run a cleanup scan.",
            "Review the not-following-back list and deselect anyone you want to keep.",
            "Unfollow the rest in a Safe-paced batch.",
            "Check your growth chart to see the effect on your ratio.",
          ),
          p("New to GrowX? Start with [how auto follow works](/blog/how-growx-auto-follow-works)."),
        ],
      },
      {
        id: "try",
        heading: "Clean up with GrowX",
        blocks: [p(TRY)],
      },
    ],
  },
  {
    slug: "best-twitter-growth-tools",
    seoTitle: "Best Twitter (X) Growth Tools: What to Look For",
    title: "Best Twitter (X) Growth Tools: What to Look for Before You Install One (and Where GrowX Fits)",
    description:
      "Comparing Twitter (X) growth tools and auto follow extensions? Use this checklist of safety, targeting, pricing and privacy, and see how GrowX measures up.",
    excerpt: "A buyer's checklist for X growth tools and auto follow extensions, with an honest look at where GrowX fits.",
    category: "Guides",
    keywords: ["best Twitter growth tools", "Twitter growth tool", "X growth tool", "best Twitter auto follow", "Twitter follower tool", "GrowX"],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 8,
    related: ["how-to-grow-on-twitter-x", "bulk-follow-twitter-safely", "twitter-follow-back-score-growx"],
    sections: [
      {
        id: "intro",
        heading: "How to judge a Twitter growth tool",
        blocks: [
          p("Search for the **best Twitter growth tool** and you will meet dozens of options with similar promises. Instead of trusting a ranking, judge any tool, GrowX included, against the same checklist. We built GrowX to do well on these points, and we will say plainly where it has limits."),
        ],
      },
      {
        id: "safety",
        heading: "1. Does it protect your account?",
        blocks: [
          ul(
            "Randomised delays, breaks and rolling hourly and daily caps instead of fixed-interval bursts.",
            "It slows down or stops on warnings, rate limits, locks and sign-outs, and never clicks through challenges.",
            "An emergency stop you can reach in one keystroke.",
          ),
          p("GrowX does all of these (see [how it works](/blog/how-growx-auto-follow-works)). No tool, ours included, can promise zero risk on X."),
        ],
      },
      {
        id: "targeting",
        heading: "2. Does it choose who to follow?",
        blocks: [
          p("A tool that follows anyone wastes your follows. Look for filters (audience size, activity, profile quality, keywords) and some way to rank candidates. GrowX uses source profiles, hard filters and a [follow-back score from 1 to 99](/blog/twitter-follow-back-score-growx)."),
        ],
      },
      {
        id: "privacy",
        heading: "3. What does it do with your login and data?",
        blocks: [
          ul(
            "Does it ask for your X password? GrowX does not: it works inside your own signed-in x.com session and does not use X OAuth.",
            "Where are your lists and history stored? In GrowX they stay in your browser's local storage, with optional anonymous usage counts you can switch off.",
          ),
          p("See the [privacy policy](/privacy) for the website's data handling."),
        ],
      },
      {
        id: "price",
        heading: "4. Can you try it without paying?",
        blocks: [
          p("GrowX has a free plan (Safe and Balanced autopilot, core filters, history, analytics, backup and the cleanup scan), and a 30-day Premium trial with no credit card. Premium adds faster paces, advanced filters, list import, bulk unfollow and automatic cleanup. See [pricing](/pricing)."),
        ],
      },
      {
        id: "limits",
        heading: "5. Honest limits",
        blocks: [
          ul(
            "GrowX is a **Chrome extension** for desktop Chrome; it is not a mobile app.",
            "It helps with the following, scoring and cleanup parts of growth. It does not write your posts or replace consistent content.",
            "Results vary by niche and account, and X's rules can change.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Judge GrowX yourself",
        blocks: [p(TRY)],
      },
    ],
  },
];

/** Long-tail questions people type into search, answered per guide (inserted before the closing call to action). */
const faq: Record<string, [string, string][]> = {
  "how-to-grow-on-twitter-x": [
    ["How long does it take to grow on Twitter (X)?", "There is no fixed timeline. Accounts that post consistently in one niche, reply to others and follow relevant people usually see steady movement over weeks and months rather than days. Track your own numbers weekly and judge the trend, not a single day."],
    ["Is it better to follow people or to post?", "Both. Posting gives people a reason to follow you; following relevant people tells them you exist. GrowX automates the second part so the first one gets your time."],
    ["Do I need a paid X subscription to grow?", "No. GrowX works with free X accounts. It also has a dedicated pace for accounts that have X's own Premium subscription, because those accounts have higher platform limits."],
    ["Is auto following against X's rules?", "X restricts spam-like and aggressive automation, and its rules can change, so read them yourself. GrowX is built to be conservative: human-like pacing, caps and hard stops. You stay responsible for how you use it."],
  ],
  "first-1000-followers-on-x": [
    ["Can I really get 1,000 followers in 30 days?", "Some accounts do and many do not. It depends on niche, content quality, consistency and how targeted your following is. Use the plan as a structure and measure your own progress instead of expecting a fixed result."],
    ["Which GrowX pace should a new account use?", "Start with Safe, keep warm-up and active hours on, and move to Balanced after several clean days with no warnings from X."],
    ["How many source profiles do I need?", "Three to five close matches are enough to start. Add more only when Analytics shows the existing ones are running dry or performing poorly."],
    ["What if people follow but do not engage?", "Followers who never see anything they like will not stay. Keep posting for one clear audience and reply to the people who do engage."],
  ],
  "bulk-follow-twitter-safely": [
    ["How many people can I bulk follow per day with GrowX?", "On the Safe pace GrowX follows up to about 150 a day and on Balanced up to about 280 a day, with hourly caps as well. Faster presets exist on Premium for aged accounts. X applies its own limits too."],
    ["Can I bulk follow a list of usernames I already have?", "Yes. You can import your own list of usernames and GrowX follows them first, still at the paced rate. List import is a Premium feature."],
    ["Will everyone I follow follow back?", "No. Only some will. The follow-back score and filters raise the odds by queueing likelier accounts, but no tool can promise a follow-back rate."],
    ["Does bulk following work while my computer is asleep?", "GrowX runs in Chrome's background service worker, so it continues when you close the popup or switch tabs, but Chrome and your computer must be running and X must be signed in."],
  ],
  "mass-follow-twitter-limits": [
    ["What does \"you are unable to follow more accounts at this time\" mean?", "It means X has temporarily limited your following, usually because of volume or pace. Stop following for a while. GrowX treats such warnings as a signal to throttle and rest."],
    ["How many follows per day is safe?", "There is no number that is safe for every account. New and low-trust accounts need to be slower. That is why GrowX starts at the Safe pace with warm-up and slows down by itself after warnings."],
    ["Is following and then unfollowing risky?", "Rapid follow and unfollow cycles look manipulative. Give follows time to be returned and unfollow gradually."],
    ["Can GrowX get my account suspended?", "No tool can guarantee that. GrowX reduces the risk with paced, targeted following and hard stops, but you remain responsible for staying within X's rules."],
  ],
  "twitter-follow-back-score-growx": [
    ["Is the follow-back score a guarantee?", "No. It is an estimate from public profile signals. It helps order candidates, it does not predict any one person."],
    ["What is a good minimum score?", "The default is 55. Try around 70 for quality and a smaller queue, or around 40 for more volume. Check source performance in Analytics to see what your numbers produce."],
    ["Is the score the same as a Twitter growth score?", "People search both. GrowX's number rates how likely an account is to follow back; it is not a rating of your own account."],
    ["Can I change what the score looks for?", "You can edit the follow-back keyword list and the filters that run before scoring. The scoring signals themselves are built into the extension."],
  ],
  "unfollow-non-followers-twitter": [
    ["How do I find who does not follow me back on Twitter?", "Run the GrowX cleanup scan: it compares who you follow with who follows you and lists accounts that do not follow back, flagging results as unverified when the followers list could not be read fully."],
    ["Can I unfollow inactive accounts only?", "Yes. Filter the scan by inactivity (30, 90, 180 or 365 days) and select only those. Accounts with an unknown last post time are never labelled inactive."],
    ["How fast can I unfollow without a warning?", "X's limits vary by account. GrowX unfollows one at a time with delays and rolling caps and stops on any warning."],
    ["Does GrowX unfollow anyone automatically?", "Only what you select and confirm, unless you turn on Premium automatic cleanup, which unfollows accounts it followed that did not follow back after the number of days you set."],
  ],
  "best-twitter-growth-tools": [
    ["Is GrowX free?", "Yes, there is a free plan, and you can try every Premium feature free for 30 days without a credit card."],
    ["Does GrowX need my X password?", "No. It works in your own signed-in x.com session and does not use X OAuth or store your X login."],
    ["Does GrowX work on mobile?", "No. It is a desktop Chrome extension."],
    ["How is GrowX different from a simple auto follow script?", "It chooses who to follow with filters and a follow-back score, follows at a human pace with caps and breaks, stops on warnings and gives you analytics and cleanup tools."],
  ],
};
/** One extra practical section per guide, inserted before the questions. */
const deepDive: Record<string, { id: string; heading: string; blocks: Block[] }> = {
  "first-1000-followers-on-x": {
    id: "daily",
    heading: "A daily routine that fits in 30 minutes",
    blocks: [
      p("Growth plans fail when they need more time than you have. This routine takes about half an hour a day once GrowX is running in the background, because the following part no longer needs you."),
      ol(
        "Five minutes: check the GrowX popup. Is the autopilot running, is the queue full, any warnings?",
        "Ten minutes: write and schedule or publish one post for your niche.",
        "Ten minutes: reply to five to ten posts from accounts in your niche, adding something useful rather than \"great post\".",
        "Five minutes: thank and reply to people who engaged with you, since early supporters are the most valuable followers you will get.",
      ),
      p("On Sundays, spend twenty extra minutes on Analytics: which sources produced follow-backs, which posts earned the most profile visits, and what you will change next week. Small weekly adjustments compound much better than a big overhaul once a month."),
    ],
  },
  "bulk-follow-twitter-safely": {
    id: "mistakes",
    heading: "Common bulk-follow mistakes and how GrowX avoids them",
    blocks: [
      p("Most bulk-follow problems come from the same few habits. Knowing them helps you choose settings that keep your account healthy."),
      ul(
        "**One giant source.** Following the followers of one huge celebrity gives you a crowd that does not care about your niche. Use several smaller, closely related sources.",
        "**Ignoring the score.** A queue with no minimum score is just a random list. Keep the minimum at a level where the follow-back rate in Analytics is worth the effort.",
        "**Running at the fastest pace on a young account.** Speed is the main trigger for warnings. Faster presets are for aged accounts with a clean record.",
        "**Never checking results.** The point of bulk following is follow-backs. If a source does not deliver after a few days, remove it.",
        "**Forgetting the exit.** A large following list needs maintenance. Plan a gradual cleanup after a couple of weeks.",
      ),
      p("GrowX keeps old candidates out of the queue (older than 72 hours are dropped by default), re-reads sources every few hours and tracks outcomes per source, so you can fix these mistakes with data instead of guesses."),
    ],
  },
  "mass-follow-twitter-limits": {
    id: "warmup",
    heading: "How to warm up a new account before following at scale",
    blocks: [
      p("A new account has no history, so any burst of activity stands out. Warming up means increasing activity gradually so the account builds a normal-looking record."),
      ol(
        "Complete the profile and post a few times before following anyone.",
        "Turn on GrowX warm-up so the daily cap rises day by day instead of starting at the full Safe or Balanced cap.",
        "Stay on the Safe pace for the first week or two and keep active hours on.",
        "Only after a clean period with no warnings consider moving to Balanced.",
        "Treat any rate-limit or warning message as a reason to pause for the day, not to retry.",
      ),
      p("Warm-up does not make mass following risk-free. It simply avoids the most obvious pattern, a brand-new account doing a lot at once. Keep your own judgement in the loop: if something about your account's behaviour on X feels off, stop the autopilot with Alt + Shift + S and look at it manually."),
    ],
  },
  "twitter-follow-back-score-growx": {
    id: "example",
    heading: "Reading a score in practice",
    blocks: [
      p("Imagine two candidates from the same source. The first has a few hundred followers, follows about as many people, has a photo and bio and posted two days ago. The second has a hundred thousand followers, follows almost nobody and last posted months ago. Using the signals above, the first will score noticeably higher: its ratio and size suggest a typical person who follows back, and it is active. The second is unlikely to notice a follow, so it falls below the minimum and never enters your queue."),
      p("That is the whole idea. You do not need to inspect every profile; you set the quality dial once and review the distribution of score bands in the queue. If most candidates sit below 60 with your current sources, the sources are probably too broad or too large, and replacing them with smaller, more specific communities is usually a better fix than lowering the minimum."),
      p("Remember that the score only ranks candidates. Whether someone follows back still depends on your profile and your recent posts, which is why the [growth plan](/blog/how-to-grow-on-twitter-x) starts with the basics."),
    ],
  },
  "unfollow-non-followers-twitter": {
    id: "ratio",
    heading: "Why your following-to-followers ratio matters",
    blocks: [
      p("A profile that follows ten times more people than follow it can look like a follow-spammer, and it uses up room under X's following cap. Bringing the ratio closer to even makes the account look more credible to new visitors and keeps options open if you want to follow new people later."),
      p("That does not mean unfollowing everyone who does not follow back. Some of the best accounts to follow are large creators who will never follow you. The cleanup scan is a tool for review, not a rule: use filters to focus on small accounts that ignored you and on accounts that have gone silent, and keep the rest."),
      ul(
        "Growing: follow relevant accounts, wait a week or two.",
        "Reviewing: scan, deselect keepers, unfollow the remainder in paced batches.",
        "Maintaining: repeat every few weeks so the list never gets out of hand.",
      ),
    ],
  },
  "best-twitter-growth-tools": {
    id: "questions",
    heading: "Questions to ask before you install anything",
    blocks: [
      p("Before installing any extension that acts on your X account, read what permissions it asks for and what the vendor says it does with your data. A few questions are worth answering every time:"),
      ul(
        "Who makes it, and is there a real website, privacy policy and support address? GrowX has all three: see [about](/about), [privacy](/privacy) and [contact](/contact).",
        "Does it say what happens when X pushes back? Vague promises of \"unlimited\" following are a red flag.",
        "Can you leave? Look for a backup or export option so your lists are not locked in. GrowX can export a backup file at any time.",
        "Are the claims believable? Be wary of guaranteed follower counts, fake-looking reviews and countdown-timer discounts.",
      ),
      p("A tool earns trust by being specific about what it does and does not do. We try to hold GrowX to that standard, and you are welcome to compare it against any alternative using the same checklist."),
    ],
  },
};
const more: Record<string, { id: string; heading: string; blocks: Block[] }> = {
  "mass-follow-twitter-limits": {
    id: "hit-limit",
    heading: "What to do if you hit a limit",
    blocks: [
      p("If X tells you that you cannot follow more accounts right now, the right response is patience. Stop following for the rest of the day, avoid clicking follow buttons by hand as well, and let the restriction clear. Then resume at a lower pace than before and keep active hours on."),
      p("If the message keeps coming back, or you see a lock, a verification challenge or a suspension notice, stop all automation and follow X's own instructions to resolve it. GrowX will not click through challenges for you and will halt after repeated automation warnings, because pushing through is how small problems turn into permanent ones."),
      p("Finally, review what triggered it. Was the pace too high for the age of the account? Were sources too broad, so the queue was full of weak candidates you had to churn through? Fixing the cause matters more than waiting out the limit."),
    ],
  },
  "unfollow-non-followers-twitter": {
    id: "dont",
    heading: "What not to do when unfollowing",
    blocks: [
      p("Bulk unfollowing is easy to get wrong. A few habits to avoid:"),
      ul(
        "Do not unfollow everyone in one sitting. Spread it across days using the paced runner.",
        "Do not unfollow people within hours of following them; give them time to notice and decide.",
        "Do not trust a scan whose results are marked unverified for bulk actions. Review those accounts one by one or run the scan again.",
        "Do not unfollow accounts you rely on, such as customers, partners and sources of news, just because they do not follow back.",
      ),
      p("The cleanup tools are built so you stay in control: nothing is unfollowed until you select it and confirm."),
    ],
  },
  "best-twitter-growth-tools": {
    id: "summary",
    heading: "Quick summary of what GrowX offers",
    blocks: [
      ul(
        "Chrome extension that works in your own signed-in X session.",
        "Source-based candidate discovery with hard filters and a follow-back score from 1 to 99.",
        "Four pacing presets (Safe, Balanced, Turbo, X Premium pace), active hours, warm-up, adaptive slow-down and hard stops.",
        "History, source performance, a growth chart and a monthly goal planner.",
        "Cleanup scan for inactive and not-following-back accounts, with paced unfollowing.",
        "A free plan, a 30-day Premium trial without a credit card and Premium plans for advanced features.",
      ),
      p("If that matches what you need, the quickest way to know is to try it on the free plan. If it does not, the checklist above will help you evaluate the next tool the same way."),
    ],
  },
};
for (const post of growthPosts) {
  const d = more[post.slug];
  if (!d) continue;
  post.sections.splice(post.sections.findIndex((s) => s.id === "try"), 0, d);
}
for (const post of growthPosts) {
  const d = deepDive[post.slug];
  if (!d) continue;
  post.sections.splice(post.sections.findIndex((s) => s.id === "try"), 0, d);
}
for (const post of growthPosts) {
  const qa = faq[post.slug];
  if (!qa) continue;
  const at = post.sections.findIndex((s) => s.id === "try");
  post.sections.splice(at, 0, { id: "faq", heading: "Frequently asked questions", blocks: qa.flatMap(([q, a]): Block[] => [p(`**${q}**`), p(a)]) });
}
