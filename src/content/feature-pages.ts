import type { FeaturePage } from "./feature-types";

/**
 * Feature landing pages (/features/<slug>), one per main search intent, in FEATURE_SLUGS order.
 * Every claim must match docs/PRODUCT_FACTS.md (extension v2.4.4). No invented statistics, user counts,
 * ratings, testimonials or result promises; screenshots use demo data and their numbers are never quoted.
 */
export const featurePages: FeaturePage[] = [
  {
    slug: "twitter-auto-follow",
    nav: "Smart auto follow",
    blurb: "Follow the newest followers of accounts in your niche, scored and paced like a person.",
    icon: "target",
    seoTitle: "Twitter Auto Follow Tool: Smart X Auto Follow Extension",
    description:
      "GrowX is a Twitter auto follow Chrome extension: it follows the newest followers of accounts in your niche, scored 1-99 for follow-back, at a human pace.",
    keywords: [
      "Twitter auto follow",
      "X auto follow tool",
      "auto follow Chrome extension",
      "auto follow on X",
      "Twitter follow back",
      "follow-back score",
      "Twitter growth tool",
      "GrowX",
    ],
    eyebrow: "X auto follow",
    h1: "Twitter auto follow that targets people likely to follow back",
    lead:
      "GrowX follows the newest followers of accounts in your niche, scores every candidate for follow-back likelihood and works through the queue one account at a time, with random delays, breaks and caps. It runs inside your own signed-in x.com session in Chrome.",
    image: { src: "/screens/grow.webp", alt: "GrowX Grow page with Find sources for me, the Safe, Balanced, Turbo, X Premium and Custom pace presets and safety badges (demo data)" },
    highlights: [
      {
        title: "Sources and newest followers",
        text: "Add accounts your audience already follows. GrowX reads their newest followers: people who are active on X right now and interested in your topic.",
      },
      {
        title: "Find sources for me",
        text: "GrowX looks through the accounts you follow and ranks them by how active, mid-sized and follow-back-prone their audiences are.",
      },
      {
        title: "Follow-back score 1-99",
        text: "Queued candidates are scored on follow ratio, audience size, activity, account age, profile and bio. Below your minimum (55 by default), they are skipped.",
      },
      {
        title: "Human pace, built-in safety",
        text: "Random delays, breaks, hourly and daily caps, a slow-down after any X warning and an Alt+Shift+S emergency stop. Safety is never paywalled.",
      },
      {
        title: "Smart score from your results",
        text: "A small model learns from your own follow-backs and is blended in only when it clearly beats chance on held-out data.",
        premium: true,
      },
      {
        title: "More source types",
        text: "Follow people from a post's reposts, replies and likes, from searches and #hashtags, or from X Lists.",
        premium: true,
      },
    ],
    steps: [
      {
        title: "Add sources",
        text: "Paste a few accounts in your niche, or press **Find sources for me**. Good sources are mid-sized accounts whose followers are active and follow back.",
      },
      {
        title: "Set filters and pace",
        text: "Keep the default filters or tune them, choose the Safe or Balanced pace, and turn on active hours and warm-up if you want them.",
      },
      {
        title: "Start the autopilot",
        text: "Press Start in the popup. GrowX follows recent followers first, then the best-scored candidates, and verifies each follow as it goes.",
      },
    ],
    sections: [
      {
        heading: "How GrowX auto follow on Twitter finds the right people",
        paragraphs: [
          "Many auto follow tools follow whoever shows up in a search. GrowX starts from **source profiles**: accounts your ideal audience already follows. It reads each source's newest followers, because someone who followed a niche account minutes or hours ago is active right now and clearly interested in the topic. If you are not sure which sources to use, **Find sources for me** checks the accounts you already follow and ranks them by how active, mid-sized and follow-back-prone their audiences are.",
          "**Recent followers first**: the newest followers of each source (the top 50 of the list by default) are followed before anyone else. They skip the score but still pass the safety checks: no private accounts, no accounts without a photo or posts, no giant accounts and nothing that matches your exclude keywords. Everyone else goes into a queue of about 250 candidates sorted by score. Sources are re-read every hour and candidates older than 72 hours are dropped, so the queue stays fresh.",
          "With **Premium** you can add more source types: the people who reposted, replied to or liked a specific post, the results of a search or #hashtag, and the members of an X List. The replies under a popular post in your niche are a strong source, because those people are engaged with exactly your topic at that moment.",
        ],
      },
      {
        heading: "The follow-back score and filters",
        paragraphs: [
          "Each candidate gets a **follow-back score from 1 to 99**. It weighs the follow ratio, audience size, how many accounts they follow, follow-back words in the bio, recent activity, account age, photo and bio, verified status and how recently they followed the source. Queued candidates below your minimum (55 by default) are not followed; only the recent followers described above skip the score. Read [how the follow-back score works](/blog/twitter-follow-back-score-growx) for the details.",
          "Before scoring, hard filters remove accounts you do not want: people you already follow or who already follow you, private accounts, accounts without a photo, and accounts outside your limits for followers (15 to 8,000 by default), following (at least 40), follow ratio (0.4), posts (5), account age (30 days) and last activity (45 days). Exclude keywords skip bios you want to avoid, boost words lift bios that talk about following back, and a never-follow list blocks specific accounts for good.",
          "The **smart score (Premium)** goes a step further. After roughly 80 settled follows with at least 12 follow-backs and 12 non-follow-backs, GrowX trains a small model on your own results, tests it on a holdout set and blends it in at up to 60% weight, but only when it clearly beats chance. Premium also adds include and location keywords, verified filters and importing a list of usernames to follow first.",
        ],
      },
      {
        heading: "Pace presets and safety controls",
        paragraphs: [
          "GrowX follows one account at a time from the extension's background, so it keeps working when the popup is closed and resumes after Chrome restarts. The pace preset sets the delay between follows, how often it rests and the rolling caps. **Safe** (about 150 a day) suits new accounts and **Balanced** (about 280 a day) is the recommended default; both are free. **Turbo** (about 390) is for aged accounts and the **X Premium** pace (about 800) is only for accounts with X Premium; both need GrowX Premium.",
          "These controls lower risk; they cannot remove it. **No tool can promise zero risk on X**, and X can change its limits at any time. Start on Safe with warm-up turned on for a new or quiet account, watch for warnings, and move up only after a few days without any. See [how GrowX auto follow works](/blog/how-growx-auto-follow-works) for the full pacing logic.",
        ],
        bullets: [
          "Random delays, a break every few follows and occasional longer pauses",
          "Optional active hours and days, and a warm-up that starts the daily cap at 60 and raises it by 20 a day",
          "A following-cap guard (5,000, or about 10% above your follower count)",
          "Adaptive slow-down after any X warning, and a full stop on sign-out, an account lock, a challenge or repeated automation warnings",
          "Follow verification that checks follows actually stuck, to spot shadow limits",
          "Emergency stop with **Alt+Shift+S**",
        ],
      },
      {
        heading: "Auto follow vs. following by hand",
        paragraphs: [
          "Following by hand works, but it is slow and inconsistent: you scroll a big account's followers, open profiles one by one and guess who might follow back. Most of the time goes into checking profiles rather than deciding. GrowX runs the same checks you would (photo, bio, activity, ratio, audience size) on every candidate, keeps the decisions consistent and spreads the follows across the day instead of doing them in a burst.",
          "It also shows which sources are worth keeping. The **source leaderboard** lists the follow-back rate, retention and cost of each source, so you can drop the ones that bring nobody. With Premium, **auto-replace weak sources** retires a source after a fair trial and swaps in the best auto-found one, and you can restore it later. Pair the autopilot with a regular [cleanup of non-followers](/features/twitter-unfollow-tool) to keep your following count healthy.",
        ],
      },
    ],
    plans: {
      free: [
        "Source profiles, Find sources for me and recent followers first",
        "Follow-back score with core filters and a never-follow list",
        "Safe (~150/day) and Balanced (~280/day) paces",
        "Every safety control: warm-up, active hours, slow-down, follow verification, Alt+Shift+S",
        "Source leaderboard with follow-back rate and retention",
      ],
      premium: [
        "Smart score trained on your own follow-backs",
        "More source types: a post's reposts, replies and likes, searches, #hashtags and X Lists",
        "Turbo (~390/day), X Premium (~800/day) and custom paces above Balanced",
        "Auto-replace weak sources, advanced filters and list import",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "Is auto follow on Twitter (X) safe?",
        a: "No tool can promise zero risk on X. GrowX lowers the risk with random delays, breaks, hourly and daily caps, warm-up, an automatic slow-down after any X warning and an emergency stop (Alt+Shift+S).",
      },
      {
        q: "How many people can I auto follow per day on X?",
        a: "GrowX's presets aim for about 150 a day (Safe) or 280 a day (Balanced) on the free plan, and about 390 (Turbo) or 800 (X Premium accounts only) with Premium. X's own limits can change, so start low and move up only after clean days.",
      },
      {
        q: "Does the GrowX auto follow extension need my X password?",
        a: "No. GrowX works inside the x.com session you are already signed in to in Chrome. It never asks for your X password and does not use X OAuth.",
      },
      {
        q: "Does auto follow keep running when I close the popup?",
        a: "Yes. It runs in the extension's background service worker while Chrome is open, keeps the computer awake while it runs and resumes after Chrome restarts.",
      },
      {
        q: "Will GrowX unfollow people automatically?",
        a: "Only if you turn on automatic cleanup (Premium), which unfollows GrowX's own follows that did not follow back after 2, 5 or 7 days. Accounts you followed yourself or imported are never touched.",
      },
    ],
    relatedPosts: ["how-growx-auto-follow-works", "twitter-follow-back-score-growx", "bulk-follow-twitter-safely", "follow-for-follow-twitter", "twitter-follower-ratio", "mass-follow-twitter-limits"],
    related: ["twitter-unfollow-tool", "twitter-unfollower-tracker", "twitter-reply-targets"],
  },
  {
    slug: "twitter-post-scheduler",
    nav: "Post scheduler",
    blurb: "Schedule posts and threads on X, fill queue slots and find your best time to post.",
    icon: "calendar",
    seoTitle: "Twitter Scheduler: Schedule Tweets & Threads on X Free",
    description:
      "Schedule tweets and threads on X for free with GrowX, a Twitter scheduler in Chrome: queue slots, a best time to post heat map, calendar, drafts and templates.",
    keywords: [
      "Twitter scheduler",
      "schedule tweets",
      "schedule posts on X free",
      "free Twitter scheduler",
      "schedule Twitter threads",
      "X post scheduler",
      "tweet queue",
      "GrowX",
    ],
    eyebrow: "Post scheduler",
    h1: "A free Twitter scheduler for posts and threads on X",
    lead:
      "Write a post or a thread, then post it now, pick a time or drop it into your next queue slot. GrowX publishes from your own x.com session in Chrome, shows when your followers are most active and keeps drafts, templates and a calendar in one place.",
    image: { src: "/screens/create.webp", alt: "GrowX Create page with the post composer, AI ideas and queue slots (demo data)" },
    highlights: [
      {
        title: "Posts and threads",
        text: "Threads of up to 25 parts, up to 4 images per post and X's own character counting, so what you write is what X accepts.",
      },
      {
        title: "Post, schedule or queue",
        text: "Post now, pick an exact time, or add to the queue and let GrowX fill your next free slot (09:00, 13:00 and 18:30 by default).",
      },
      {
        title: "Best time to post",
        text: "A week-by-hour heat map built from your own posts' engagement and the hours your followers are active.",
      },
      {
        title: "Calendar, drafts and templates",
        text: "See everything on a calendar, keep drafts, and start from 52 built-in templates or your own.",
      },
      {
        title: "Unlimited scheduling",
        text: "The free plan keeps up to 10 posts or threads waiting at once. Premium removes the limit.",
        premium: true,
      },
      {
        title: "Evergreen and auto-plug",
        text: "Post your best posts again every N days with rotating variants, and add a call-to-action reply to your own post once it takes off.",
        premium: true,
      },
    ],
    steps: [
      {
        title: "Write it",
        text: "Open Create and write a post or a thread, or start from a template. The counter follows X's rules: links count as 23 characters and most emoji as 2.",
      },
      {
        title: "Pick when",
        text: "Post now, choose a date and time, or add it to the queue. The heat map shows which hours tend to work for your account.",
      },
      {
        title: "Let GrowX post it",
        text: "Keep Chrome running. GrowX posts at the planned time from your x.com session, within your daily cap and minimum gap.",
      },
    ],
    sections: [
      {
        heading: "How scheduling posts on X works in GrowX",
        paragraphs: [
          "GrowX is a Chrome extension, so scheduled posts are published by your own browser, inside the x.com session you are already signed in to. There is no separate login and no X password to hand over. When a post is due, GrowX publishes it as the X account it was written for, never from a different account you happen to be signed in to at the time.",
          "That design has one real limit: **Chrome and your computer must be on** at the scheduled time. If the computer was asleep or off and a post is more than 6 hours late, GrowX does not post it by itself. It waits in the queue as \"missed\" so you can decide whether it still makes sense, instead of a stale post going out the next morning.",
          "Server-based schedulers can post while your computer is off, but they work through an app connection to your X account. GrowX trades always-on posting for keeping everything in your browser: your posts, queue and settings stay in Chrome's storage on your computer, not on a GrowX server.",
        ],
      },
      {
        heading: "Queue slots, calendar and the best time to post",
        paragraphs: [
          "The queue works with time slots. You set the times you want to post (09:00, 13:00 and 18:30 every day by default) and **Add to queue** puts each new post into the next free slot. It is the easiest way to keep a steady rhythm: write several posts in one sitting and let the queue spread them across the week without picking a time for each one.",
          "The **best time to post** heat map is a week by 24-hour grid built from two things: the engagement your own posts received at each hour and when your followers are active. It is specific to your account, which makes it more useful than generic advice. Use it to move queue slots toward the hours that are consistently warm, and read [the best time to post on Twitter](/blog/best-time-to-post-on-twitter) for a simple testing routine.",
          "The **calendar** shows scheduled and queued posts by day, so gaps and clusters are easy to spot. **Drafts** keep half-finished ideas, and the **52 templates** (hooks, threads, lists, stories and more) give you a starting structure when you are stuck. You can also save your own templates for formats you use every week, and a quick post box in the popup covers one-off posts.",
        ],
      },
      {
        heading: "Writing threads and long posts",
        paragraphs: [
          "Threads can have up to 25 parts, and each post can carry up to 4 images. The **Thread it** splitter turns a long draft into numbered parts, and the counter follows X's own rules (links count as 23 characters, most emoji and CJK characters as 2), so a part that looks fine will not be rejected for length. Accounts with X Premium can write long posts of up to 25,000 characters.",
          "Prefer to plan outside the extension first? The free [Twitter thread maker](/tools/twitter-thread-maker) and [tweet character counter](/tools/tweet-character-counter) on this site help you split a draft and check length before you paste it into GrowX. With GrowX Premium, the on-device AI writer can also suggest hooks, improve a draft or turn rough notes into a thread.",
        ],
      },
      {
        heading: "Posting safety and Premium extras",
        paragraphs: [
          "Scheduled posting has its own safety rules. GrowX posts at most 20 times a day by default, keeps at least 5 minutes between posts and pauses posting if X shows any warning. These limits stop a full queue from turning into a burst that looks automated. **No tool can promise zero risk on X**, so keep the defaults unless you have a clear reason to change them.",
          "The free plan keeps up to **10 posts or threads waiting** at once, which covers a few days of steady posting. **Premium** removes that limit and adds **evergreen recycling**, which posts your best posts again every N days (30 by default) with rotating variants or as a repost, and **auto-plug**, which replies to your own post with your call to action once it takes off (50 likes by default).",
        ],
      },
    ],
    plans: {
      free: [
        "Posts and threads (up to 25 parts, 4 images per post)",
        "Post now, schedule, or add to queue slots",
        "Up to 10 posts or threads waiting at once",
        "Best time to post heat map, calendar and drafts",
        "52 templates, your own templates and the Thread it splitter",
        "Quick post box in the popup",
      ],
      premium: [
        "Unlimited scheduling",
        "Evergreen recycling of your best posts",
        "Auto-plug: a call-to-action reply on your own post when it takes off",
        "GrowX AI: Write, Improve, Hooks and Thread it on your computer",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "Can I schedule tweets on X for free?",
        a: "Yes. GrowX's free plan lets you schedule posts and threads with up to 10 waiting at once. Premium removes the limit.",
      },
      {
        q: "Does my computer need to be on for scheduled tweets to post?",
        a: "Yes. GrowX posts from Chrome on your computer, so Chrome and the computer must be on. A post that is more than 6 hours late is not posted by itself; it waits as \"missed\" until you decide.",
      },
      {
        q: "Can I schedule a Twitter thread with images?",
        a: "Yes. Threads can have up to 25 parts and each post up to 4 images, and you can schedule or queue them just like a single post.",
      },
      {
        q: "What is the best time to post on Twitter?",
        a: "It depends on your audience. GrowX's heat map shows the hours that worked for your own posts and when your followers are active, which is more reliable for you than a generic chart.",
      },
      {
        q: "Can I schedule posts for more than one X account?",
        a: "Each post is published only as the X account it was written for. A separate workspace per X account is a Premium feature, and every GrowX account can link 2 X usernames for free.",
      },
    ],
    relatedPosts: ["how-to-schedule-tweets", "best-time-to-post-on-twitter", "how-often-to-post-on-twitter", "how-to-write-a-twitter-thread", "tweet-ideas", "how-to-go-viral-on-twitter"],
    related: ["ai-tweet-writer", "twitter-analytics", "twitter-reply-targets"],
  },
  {
    slug: "ai-tweet-writer",
    nav: "AI writer",
    blurb: "Private, on-device AI that writes, improves and threads your X posts. No API key.",
    icon: "wand",
    seoTitle: "AI Tweet Writer & Generator: Private, On-Device AI",
    description:
      "GrowX AI is an AI tweet writer that runs on your computer inside Chrome: write, improve, hooks and threads for X posts. Private, no API key, no per-use fees.",
    keywords: [
      "AI tweet writer",
      "AI tweet generator",
      "AI for Twitter posts",
      "AI Twitter thread writer",
      "X post generator",
      "on-device AI",
      "Chrome built-in AI",
      "GrowX",
    ],
    eyebrow: "GrowX AI",
    h1: "An AI tweet writer that runs privately on your own computer",
    lead:
      "GrowX AI writes, improves and threads your X posts with the AI model built into Chrome. It runs on your computer, uses your niche and voice settings, needs no API key and does not invent facts: anything it cannot know becomes a `{placeholder}`.",
    image: { src: "/screens/create.webp", alt: "GrowX Create page with the composer, the Write, Improve, Thread it and Hooks buttons and AI ideas written on the computer (demo data)" },
    highlights: [
      {
        title: "Write and Improve",
        text: "Turn an idea into a post, or tighten a draft you already have, in the tone set in your voice settings.",
        premium: true,
      },
      {
        title: "Hooks and Thread it",
        text: "Get several opening lines for the same idea, or turn notes and a long draft into a numbered thread that fits X's character rules.",
        premium: true,
      },
      {
        title: "Reply ideas",
        text: "Suggested replies for posts in Reply targets. You edit them and send them yourself.",
        premium: true,
      },
      {
        title: "On-device and private",
        text: "Runs on your computer with the model built into Chrome. No API key, no per-use fees and nothing sent to GrowX.",
        premium: true,
      },
      {
        title: "Built not to invent facts",
        text: "When a post needs a number, name or result it cannot know, GrowX AI writes a {placeholder} for you to fill in.",
        premium: true,
      },
      {
        title: "Free templates and splitter",
        text: "52 templates and the plain Thread it splitter are free, and they are what the AI buttons fall back to when Chrome's model is unavailable.",
      },
    ],
    steps: [
      {
        title: "Set your niche and voice",
        text: "Tell GrowX what you post about and how you sound. The AI uses these settings for every suggestion it makes.",
      },
      {
        title: "Press an AI button",
        text: "In Create, choose Write, Improve, Hooks or Thread it. Chrome downloads its model once the first time; after that it runs on your computer.",
      },
      {
        title: "Edit, then post or schedule",
        text: "Fill any placeholders with real details, adjust the wording, then post now, schedule it or add it to your queue.",
      },
    ],
    sections: [
      {
        heading: "How an on-device AI tweet writer works",
        paragraphs: [
          "Most AI tweet generators send your text to a cloud model and charge per use or per month, sometimes through an API key you have to manage. GrowX AI uses the AI model that is built into recent versions of desktop Chrome. The model runs on your own computer, so your drafts are not sent to GrowX and there is no API key to set up or pay for.",
          "Chrome downloads the model once, the first time it is needed. After that, GrowX AI calls it directly from the extension. Because it runs locally, GrowX gives it short, focused jobs: a post, a set of hooks, a rewrite, a thread outline or a reply idea. That is the kind of writing help most people actually want while composing on X, and it keeps you in charge of the final words.",
        ],
      },
      {
        heading: "What GrowX AI can do",
        paragraphs: [
          "GrowX AI is part of GrowX Premium and appears as buttons where you already write, so you never copy text between tabs. Every suggestion uses the niche and voice settings you chose, which keeps the output closer to how you actually write than a blank prompt in a general chatbot.",
          "None of these actions post anything. GrowX AI fills the composer or shows suggestions; you decide what to keep, edit it and then post, schedule or queue it yourself. Replies suggested in [Reply targets](/features/twitter-reply-targets) are only sent when you press the button, and GrowX never sends DMs.",
        ],
        bullets: [
          "**Write**: a post from a topic or a rough idea",
          "**Improve**: a clearer, tighter version of your draft",
          "**Hooks**: several opening lines to choose from",
          "**Thread it**: a long draft or notes turned into a numbered thread",
          "**Reply ideas**: suggested replies to fresh posts in your niche",
          "**Weekly summary**: a short read on how your week went",
        ],
      },
      {
        heading: "Why it does not invent facts",
        paragraphs: [
          "The biggest problem with AI-written posts is confident nonsense: invented numbers, fake results and quotes nobody said. GrowX AI is designed not to make up facts. When a post needs something only you know, such as a revenue figure, a client name or how long a project took, it leaves a `{placeholder}` instead, so the gap is obvious before anything is posted.",
          "That makes the output a draft, not a finished post. Read it, fill the placeholders with real details and cut anything that does not sound like you. Posts built on specific, true experience are more interesting to read than generic advice, and they protect your credibility. For structure ideas, see [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread).",
        ],
      },
      {
        heading: "Requirements, fallback and the free plan",
        paragraphs: [
          "GrowX AI needs a recent desktop version of Chrome on a computer with enough free memory and disk space for Chrome's built-in model. If the model is not available on your machine, the AI buttons do not break: they fall back to the matching templates and the plain thread splitter, so you can still write and structure posts.",
          "On the free plan you get the same composer with **52 templates** (hooks, threads, lists, stories and more), your own templates and the **Thread it** splitter without AI. Premium adds the AI actions above, and the [30-day Premium trial](/pricing) lets you test them on your own computer before you decide. AI suggestions are drafts; you stay responsible for what you post.",
        ],
      },
    ],
    plans: {
      free: [
        "52 built-in templates and your own templates",
        "Thread it splitter without AI",
        "Composer with X's character counting, threads and images",
        "Post now, schedule or queue (up to 10 waiting)",
      ],
      premium: [
        "GrowX AI: Write, Improve, Hooks and Thread it",
        "AI reply ideas in Reply targets",
        "Weekly AI summary",
        "Runs on your computer: no API key, no per-use fees",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "Is there an AI tweet writer that needs no API key?",
        a: "GrowX AI needs no API key and has no per-use fees, because it runs on the AI model built into Chrome. It is part of GrowX Premium, which you can try free for 30 days without a credit card.",
      },
      {
        q: "Does GrowX AI send my drafts to a server?",
        a: "No. It runs on your computer using Chrome's built-in AI model, and nothing is sent to GrowX.",
      },
      {
        q: "Why do the AI buttons show templates instead of AI text?",
        a: "Your Chrome version or computer cannot run the built-in model yet, for example because of limited memory or disk space. GrowX falls back to templates and the plain thread splitter so you can keep writing.",
      },
      {
        q: "Can AI write a whole Twitter thread for me?",
        a: "Thread it turns a long draft or notes into a numbered thread, and Write can start from a topic. Review every part and fill the placeholders before you post.",
      },
      {
        q: "Will GrowX AI post or reply on X automatically?",
        a: "No. It only fills the composer or suggests text. You decide what to post, and replies are only sent when you press the button.",
      },
    ],
    relatedPosts: ["ai-tweet-writer-growx-ai", "tweet-ideas", "how-to-write-a-twitter-thread", "twitter-bio-ideas", "how-to-go-viral-on-twitter", "how-to-increase-twitter-engagement"],
    related: ["twitter-post-scheduler", "twitter-reply-targets"],
  },
  {
    slug: "twitter-analytics",
    nav: "Analytics",
    blurb: "Post analytics, your best time to post and which posts bring followers, in your browser.",
    icon: "chart",
    seoTitle: "Twitter Analytics: X Post Stats & Best Time to Post",
    description:
      "GrowX Twitter analytics shows views, likes, replies and engagement rate for your X posts, your best time to post, and which posts brought you followers.",
    keywords: [
      "Twitter analytics",
      "X analytics tool",
      "best time to post on Twitter",
      "Twitter post analytics",
      "Twitter engagement rate",
      "free Twitter analytics",
      "X follower growth chart",
      "GrowX",
    ],
    eyebrow: "Insights",
    h1: "Twitter analytics that show what grows your X account",
    lead:
      "GrowX Insights reads your recent posts and followers through the x.com tab you already have open and turns them into clear numbers: engagement per post, the hours that work, the topics and formats that land, and how your audience is changing.",
    image: { src: "/screens/insights.webp", alt: "GrowX Insights page with post stats, a best time to post heat map and engagement by format (demo data)" },
    highlights: [
      {
        title: "Post analytics",
        text: "Views, likes, reposts, replies, bookmarks and engagement rate for your recent posts, refreshed every 3 hours while x.com is open.",
      },
      {
        title: "Best time heat map",
        text: "A week by 24-hour grid built from your own posts' engagement and when your followers are active.",
      },
      {
        title: "Topics and formats",
        text: "See how questions, images, plain text, threads and links compare on engagement for your account.",
      },
      {
        title: "Goals and streaks",
        text: "Daily goals for posts, replies and new followers, plus streaks, milestones, a growth chart and a monthly goal planner.",
      },
      {
        title: "Posts that brought followers",
        text: "Spot the posts followed by more new followers than your usual pace in the next 24 hours.",
        premium: true,
      },
      {
        title: "Weekly report",
        text: "This week vs last week: new followers, unfollowers and best posts, with a notification on Monday.",
        premium: true,
      },
    ],
    steps: [
      {
        title: "Install and open x.com",
        text: "Add GrowX to Chrome and keep an x.com tab open. GrowX reads your data from that tab, one small step per minute at most.",
      },
      {
        title: "Let it collect",
        text: "Post analytics refresh every 3 hours while x.com is open, and the follower tracker checks once a day. The views fill in as data arrives.",
      },
      {
        title: "Act on it",
        text: "Move queue slots toward your best hours, do more of the formats that work and check the weekly view to see what changed.",
      },
    ],
    sections: [
      {
        heading: "What GrowX Twitter analytics measures",
        paragraphs: [
          "Insights starts with **post analytics**: views, likes, reposts, replies, bookmarks and engagement rate for each of your recent posts. The numbers refresh every 3 hours while an x.com tab is open, so you can watch how a post develops over its first day instead of checking it by hand. The free plan covers your latest 30 posts.",
          "**What works** groups your posts by topic and format (questions, images, plain text, threads and links) and compares their engagement. Over a few weeks this answers practical questions: do your threads do better than single posts, do images help, do links hurt? Answers based on your own account beat general rules, because every niche and audience behaves differently.",
          "The **growth chart** and history show your follower count over time. Daily goals for posts, replies and new followers, **streaks**, milestones and a monthly goal planner turn the numbers into a routine you can actually keep, which matters more for growth on X than any single post that happens to go viral.",
        ],
      },
      {
        heading: "Best time to post on Twitter, for your account",
        paragraphs: [
          "Generic charts of the best time to post on Twitter mix many accounts, time zones and niches. GrowX builds a **week by 24-hour heat map** from two signals that belong to you: the engagement your own posts got at each hour, and when your followers are active. Warm cells are hours worth testing; cold cells are hours to avoid for important posts.",
          "The heat map is most useful together with the [post scheduler](/features/twitter-post-scheduler). Move your queue slots toward the warm hours, post there for a couple of weeks and look again. If the pattern holds, keep it; if not, try the next warm block. The [best time to post guide](/blog/best-time-to-post-on-twitter) walks through a simple testing routine.",
        ],
      },
      {
        heading: "Which posts brought followers (Premium)",
        paragraphs: [
          "Engagement and follower growth are not the same thing. A post can collect plenty of likes from people who already follow you and bring nobody new. **Which posts brought followers**, part of Full analytics in Premium, looks at the 24 hours after each post and highlights the posts followed by more new followers than your usual pace.",
          "The **weekly report (Premium)** compares this week with last week: new followers, unfollowers and best posts, with a notification on Monday. Together with the [unfollower tracker](/features/twitter-unfollower-tracker), it shows both sides of growth, who arrived and who left, so you can tell whether a change in your content helped or hurt.",
        ],
      },
      {
        heading: "Privacy and how the data is collected",
        paragraphs: [
          "GrowX reads everything through an x.com tab that is already open, one small step per minute at most, so there is no separate login and no X password. Your settings, history, posts and analytics stay in Chrome's storage on your computer rather than on a GrowX server. Optional anonymous usage counts, which contain no X data, can be switched off.",
          "The trade-off is coverage. GrowX only knows what it has seen while Chrome was running with x.com open, so a fresh install starts with your recent posts and builds history from there. X's own analytics remain the official record for your account; GrowX adds the comparisons, timing and follower links in one place next to your scheduler and goals.",
        ],
      },
    ],
    plans: {
      free: [
        "Post analytics for your latest 30 posts",
        "Best time to post heat map",
        "Topics and formats by engagement",
        "Growth chart, history, daily goals, streaks and milestones",
        "Follower tracker with 7 days of history and top fans",
      ],
      premium: [
        "Full analytics, including which posts brought followers",
        "Weekly report with a Monday notification",
        "Full follower history and follower quality",
        "Weekly summary from GrowX AI",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "Is there a free Twitter analytics tool?",
        a: "Yes. GrowX's free plan includes post analytics for your latest 30 posts, the best time to post heat map, topics and formats, a growth chart and daily goals.",
      },
      {
        q: "How does GrowX get my X analytics?",
        a: "It reads your posts and followers through an x.com tab you already have open in Chrome, one small step per minute at most. It never asks for your X password.",
      },
      {
        q: "How often are my X post stats updated?",
        a: "Post analytics refresh every 3 hours while x.com is open, and the follower tracker checks once a day.",
      },
      {
        q: "Can I see which tweets gained me followers?",
        a: "Yes, with Premium. Which posts brought followers highlights the posts followed by more new followers than your usual pace in the next 24 hours.",
      },
      {
        q: "Where is my Twitter analytics data stored?",
        a: "In Chrome's extension storage on your computer. Settings, history, posts and analytics stay there, and you can export a backup file at any time.",
      },
    ],
    relatedPosts: ["twitter-analytics-guide", "best-time-to-post-on-twitter", "twitter-algorithm-explained", "how-to-increase-twitter-engagement", "how-often-to-post-on-twitter", "twitter-hashtags-guide"],
    related: ["twitter-post-scheduler", "twitter-unfollower-tracker", "ai-tweet-writer"],
  },
  {
    slug: "twitter-unfollower-tracker",
    nav: "Unfollower tracker",
    blurb: "See who followed and who unfollowed you on X each day, with follower quality checks.",
    icon: "users",
    seoTitle: "Twitter Unfollower Tracker: See Who Unfollowed You",
    description:
      "See who unfollowed you on X with GrowX, a Twitter unfollower tracker for Chrome that compares your follower list daily. Free with 7 days of history.",
    keywords: [
      "Twitter unfollower tracker",
      "who unfollowed me on Twitter",
      "see who unfollowed you on X",
      "X unfollower tracker",
      "Twitter unfollow notification",
      "track Twitter followers",
      "Twitter follower quality",
      "GrowX",
    ],
    eyebrow: "Follower tracker",
    h1: "Find out who unfollowed you on Twitter (X), every day",
    lead:
      "X does not tell you when someone unfollows. GrowX compares your full follower list once a day and shows who followed you and who left, with history, follower quality checks and your top fans.",
    image: { src: "/screens/followers.webp", alt: "GrowX Followers page with new followers, unfollowers, an unfollow back button and a follower quality breakdown (demo data)" },
    highlights: [
      {
        title: "Daily follower comparison",
        text: "Once a day, GrowX compares your follower list with the previous one and lists your new followers and unfollowers.",
      },
      {
        title: "7 days of history, free",
        text: "The free plan keeps a week of follower and unfollower history, enough to see what happened after a post.",
      },
      {
        title: "Top fans",
        text: "See who likes and replies to your posts most, so you know who to thank and engage with.",
      },
      {
        title: "Full follower history",
        text: "Keep your complete follower history instead of the last 7 days.",
        premium: true,
      },
      {
        title: "One-click unfollow back",
        text: "Unfollow someone who left you straight from the tracker.",
        premium: true,
      },
      {
        title: "Follower quality",
        text: "On request, sorts your newest followers into real and active, inactive (90+ days), likely bots and private accounts.",
        premium: true,
      },
    ],
    steps: [
      {
        title: "Install GrowX",
        text: "Add the extension to Chrome and open x.com while signed in. There is no X app to connect and no password to enter.",
      },
      {
        title: "Wait for the first check",
        text: "The first daily check saves your follower list. From the next check on, GrowX can show who followed and who unfollowed.",
      },
      {
        title: "Review and decide",
        text: "Open Insights to see the changes. With Premium, you can also check follower quality and unfollow back in one click.",
      },
    ],
    sections: [
      {
        heading: "How the GrowX unfollower tracker works",
        paragraphs: [
          "X does not send a notification when someone unfollows you, and your follower count only shows the net change. The only reliable way to know who left is to compare your full follower list over time. GrowX does that for you: once a day it reads your follower list through an x.com tab you already have open and compares it with the previous check.",
          "The result is two simple lists: who followed you and who unfollowed you since the last check. The free plan keeps **7 days** of this history, which is enough to see what happened after a post or a busy week. **Premium** keeps your full follower history and adds **one-click unfollow back** for people who left.",
        ],
      },
      {
        heading: "What the tracker can and cannot tell you",
        paragraphs: [
          "An unfollow is not always a decision. Accounts that are **suspended, deactivated or deleted** also disappear from your follower list, so they can show up among your unfollowers. Before you unfollow anyone back, open the profile: if it no longer exists or is suspended, the change probably had nothing to do with you or your posts.",
          "Because the check runs **once a day**, someone who follows and unfollows between two checks will not appear, and the time of an unfollow is only known to the day. Checks also need Chrome running with an x.com tab open, so no check happens on a day your computer stays off.",
          "Every account loses some followers over time; it is a normal part of being on X. The useful signal is a pattern, such as a spike in unfollows after a certain kind of post or a change in posting rhythm, which you can cross-check against your posts in [Twitter analytics](/features/twitter-analytics).",
        ],
      },
      {
        heading: "Follower quality and top fans",
        paragraphs: [
          "Raw follower counts hide a lot. **Follower quality (Premium)** checks your newest followers on request and sorts them into real and active accounts, inactive accounts (no activity for 90+ days), likely bots and private accounts. It helps you judge whether a growth spurt brought real people, and whether a source or a popular post attracted the audience you actually want.",
          "**Top fans** works the other way round: it lists the people who like and reply to your posts most. Those are the accounts worth replying to, thanking and keeping close, and you can tag them or mark them as VIPs in People. A small group of engaged fans often matters more than a large number of silent followers.",
        ],
      },
      {
        heading: "Tracker vs. checking by hand",
        paragraphs: [
          "Without a tracker, finding unfollowers means scrolling your follower list and trying to remember who used to be there, which stops working after a few hundred followers. Many web-based unfollower apps ask you to connect your X account through an app login. GrowX keeps the comparison in your own browser, inside your signed-in x.com session, and never asks for your X password.",
          "If you want to act on the result, the [unfollow tool](/features/twitter-unfollow-tool) scans everyone you follow and finds accounts that do not follow you back or have gone inactive, so you can clean up at a safe pace. For a step-by-step walkthrough, read [who unfollowed me on Twitter](/blog/who-unfollowed-me-on-twitter).",
        ],
      },
    ],
    plans: {
      free: [
        "Daily check of who followed and who unfollowed you",
        "7 days of follower history",
        "Top fans: who likes and replies to you most",
        "People: tags, notes, VIPs and mutuals",
      ],
      premium: [
        "Full follower history",
        "One-click unfollow back",
        "Follower quality: real and active, inactive, likely bot, private",
        "Weekly report with new followers and unfollowers",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "Can you see who unfollowed you on Twitter?",
        a: "X does not notify you, but a tracker can compare your follower list over time. GrowX does this once a day and lists who unfollowed you since the last check.",
      },
      {
        q: "Is there a free Twitter unfollower tracker?",
        a: "Yes. GrowX's free plan shows who followed and unfollowed you with 7 days of history. Premium keeps the full history and adds one-click unfollow back.",
      },
      {
        q: "Why does someone show as an unfollower when they did not unfollow me?",
        a: "Suspended, deactivated and deleted accounts also disappear from your follower list. Open the profile before you react.",
      },
      {
        q: "Does the unfollower tracker need my X password?",
        a: "No. GrowX reads your follower list through the x.com session you are already signed in to in Chrome and never asks for your password.",
      },
      {
        q: "How often does GrowX check for unfollowers on X?",
        a: "Once a day, while Chrome is running with x.com open. Someone who follows and unfollows between two checks will not show up.",
      },
    ],
    relatedPosts: ["who-unfollowed-me-on-twitter", "twitter-follower-ratio", "unfollow-non-followers-twitter", "twitter-shadowban", "twitter-analytics-guide", "follow-for-follow-twitter"],
    related: ["twitter-unfollow-tool", "twitter-analytics", "twitter-auto-follow"],
  },
  {
    slug: "twitter-unfollow-tool",
    nav: "Unfollow tool",
    blurb: "Find non-followers and inactive accounts on X, review them and unfollow at a safe pace.",
    icon: "userX",
    seoTitle: "Twitter Unfollow Tool: Unfollow Non-Followers Safely",
    description:
      "GrowX is a Twitter unfollow tool for Chrome: find who doesn't follow you back or went inactive on X, review the list and mass unfollow at a safe pace.",
    keywords: [
      "Twitter unfollow tool",
      "mass unfollow Twitter",
      "unfollow non-followers",
      "unfollow inactive accounts",
      "X unfollow tool",
      "bulk unfollow Twitter",
      "who doesn't follow me back on X",
      "GrowX",
    ],
    eyebrow: "Cleanup",
    h1: "Unfollow non-followers and inactive accounts on X, safely",
    lead:
      "GrowX Cleanup scans everyone you follow, finds accounts that do not follow you back or have stopped posting, and lets you review and select before it unfollows anyone. Each account is re-checked right before the unfollow, at a pace built to look human.",
    image: { src: "/screens/followers.webp", alt: "GrowX follower list with a select checkbox per account, an unfollow back button and follower quality (demo data)" },
    highlights: [
      {
        title: "Not following back",
        text: "See every account you follow that does not follow you back, with filters, search and sorting.",
      },
      {
        title: "Inactive accounts",
        text: "Find accounts whose latest post is older than 30, 90, 180 or 365 days. Unknown activity is never labelled inactive.",
      },
      {
        title: "Review before unfollowing",
        text: "Nothing is unfollowed until you select it, and each account is re-checked right before the unfollow.",
      },
      {
        title: "Safe pace, free",
        text: "Up to 30 unfollows an hour and 200 a day, with up to 200 accounts per run on the free plan.",
      },
      {
        title: "Bulk unfollow",
        text: "Select all and unfollow up to 5,000 accounts in one run, with a Balanced pace of 45 an hour and 320 a day.",
        premium: true,
      },
      {
        title: "Automatic cleanup",
        text: "Unfollows GrowX's own follows that did not follow back after 2, 5 or 7 days. Accounts you followed yourself are never touched.",
        premium: true,
      },
    ],
    steps: [
      {
        title: "Scan",
        text: "Open Cleanup and scan your following and followers. GrowX reads both lists from your signed-in x.com session.",
      },
      {
        title: "Review and select",
        text: "Filter by not following back or inactive, search and sort, then select the accounts you want to unfollow.",
      },
      {
        title: "Unfollow at a safe pace",
        text: "Start the run. GrowX re-checks each account, unfollows one at a time and stays within the hourly and daily caps.",
      },
    ],
    sections: [
      {
        heading: "How the cleanup scan finds who to unfollow",
        paragraphs: [
          "GrowX scans the accounts you follow and your followers, then sorts the result into two groups. **Not following back** is everyone you follow who does not follow you. **Inactive** is everyone whose latest post is older than the window you choose: 30, 90, 180 or 365 days. You can combine filters, search by name and sort the list before selecting anyone.",
          "The scan is careful about what it does not know. If GrowX cannot see an account's activity, the account is listed as unknown and is **never called inactive**. If a scan is interrupted and only part of your list was read, the results are marked \"unverified\" and select-all is switched off, so you cannot bulk unfollow based on incomplete data.",
        ],
      },
      {
        heading: "Unfollowing at a safe pace",
        paragraphs: [
          "Unfollowing hundreds of accounts in a few minutes looks nothing like a person using X. GrowX unfollows one account at a time instead. On the free **Safe** pace it does up to 30 an hour and 200 a day, and the free plan handles up to 200 accounts per run. Right before each unfollow it checks the account again, so the decision is based on its current state rather than an old scan.",
          "**Premium** adds **bulk unfollow**, which lets you select all and unfollow up to 5,000 accounts in one run, and a **Balanced** unfollow pace of 45 an hour and 320 a day. A big run simply takes several days, because the caps stay in place. **No tool can promise zero risk on X**, so start with Safe and move up only if everything stays quiet.",
        ],
      },
      {
        heading: "Automatic cleanup for GrowX follows (Premium)",
        paragraphs: [
          "If you use the [auto follow](/features/twitter-auto-follow) autopilot, your following count grows quickly. **Automatic cleanup** keeps it in balance: it unfollows accounts GrowX followed for you that did not follow back after 2, 5 or 7 days, whichever you choose. It only runs during autopilot breaks, waits 40 to 90 seconds between unfollows and stays within the same caps of 30 an hour and 200 a day.",
          "It never touches accounts you followed yourself or accounts you imported, so your hand-picked follows stay put. That separation matters: the people you chose to follow are not part of a numbers game, and cleanup should only reverse what automation did. Read [how to unfollow non-followers](/blog/unfollow-non-followers-twitter) for when to clean up and how often.",
        ],
      },
      {
        heading: "Unfollow tool vs. unfollowing by hand",
        paragraphs: [
          "Unfollowing by hand means opening your following list, checking each profile and trying to remember who followed you back. It is slow, and it is easy to unfollow someone you meant to keep. A scan shows the whole picture at once, and the review step means GrowX only unfollows the accounts you selected, nothing more.",
          "GrowX also keeps the work in your own browser. It uses the x.com session you are already signed in to, never asks for your X password and does not post, like or send DMs while cleaning up. To see who unfollowed you rather than who you follow, use the [unfollower tracker](/features/twitter-unfollower-tracker).",
        ],
      },
    ],
    plans: {
      free: [
        "Scan your following and followers",
        "Not following back and inactive filters (30, 90, 180 or 365 days)",
        "Review, search, sort and select before unfollowing",
        "Safe pace: up to 30 an hour and 200 a day",
        "Up to 200 unfollows per run",
      ],
      premium: [
        "Bulk unfollow: select all, up to 5,000 per run",
        "Balanced unfollow pace: 45 an hour and 320 a day",
        "Automatic cleanup of GrowX follows after 2, 5 or 7 days",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "How do I unfollow everyone who doesn't follow me back on Twitter?",
        a: "Run a cleanup scan in GrowX, filter by not following back, review the list and start the run. GrowX unfollows the selected accounts one at a time at a safe pace.",
      },
      {
        q: "How many accounts can I unfollow per day on X?",
        a: "X does not publish a fixed number and its limits can change. GrowX's Safe pace stops at 30 an hour and 200 a day, and the Premium Balanced pace at 45 an hour and 320 a day.",
      },
      {
        q: "Can I mass unfollow on Twitter for free?",
        a: "Yes, up to 200 accounts per run at the Safe pace. Premium adds select-all bulk unfollow of up to 5,000 accounts per run.",
      },
      {
        q: "How do I find inactive accounts I follow on X?",
        a: "Choose the inactive filter and a window of 30, 90, 180 or 365 days. Accounts whose activity GrowX could not see are marked unknown, not inactive.",
      },
      {
        q: "Will automatic cleanup unfollow people I followed myself?",
        a: "No. Automatic cleanup (Premium) only unfollows accounts GrowX followed for you that did not follow back, never accounts you followed yourself or imported.",
      },
    ],
    relatedPosts: ["unfollow-non-followers-twitter", "twitter-follower-ratio", "follow-for-follow-twitter", "growx-features-guide-scoring-filters-cleanup", "mass-follow-twitter-limits", "twitter-shadowban"],
    related: ["twitter-unfollower-tracker", "twitter-auto-follow"],
  },
  {
    slug: "twitter-reply-targets",
    nav: "Reply targets",
    blurb: "Find fresh posts from bigger accounts in your niche and reply early, while it counts.",
    icon: "message",
    seoTitle: "Twitter Engagement Tool: Reply to Big Accounts Early",
    description:
      "GrowX Reply targets is a Twitter engagement tool that finds fresh posts from big accounts in your niche so you can reply early on X. You press send.",
    keywords: [
      "Twitter engagement tool",
      "reply to big accounts early",
      "reply guy tool",
      "Twitter reply strategy",
      "X engagement tool",
      "find tweets to reply to",
      "Twitter VIP alerts",
      "GrowX",
    ],
    eyebrow: "Engage",
    h1: "Reply early to the right posts on X with Reply targets",
    lead:
      "Replies on fresh posts from bigger accounts are a common way to get discovered on X. GrowX collects new posts from your sources, VIPs and anyone you add, ranks them by freshness and momentum, and lets you reply and like in one place. Nothing is sent until you press the button.",
    image: { src: "/screens/overview.webp", alt: "GrowX Home dashboard with daily goals, upcoming posts, this week on X and the popup with pace controls (demo data)" },
    highlights: [
      {
        title: "Fresh posts only",
        text: "Posts younger than 120 minutes by default, so your reply lands while the conversation is still active.",
      },
      {
        title: "Ranked by momentum",
        text: "Targets are ranked by freshness and how fast they take off, so the posts worth replying to come first.",
      },
      {
        title: "You press send",
        text: "Reply and like from GrowX without switching tabs. Nothing is sent by itself, and GrowX never sends DMs.",
      },
      {
        title: "People and VIPs",
        text: "Tag people, add notes, mark VIPs and watch flags, and see mutuals and fans you don't follow back yet.",
      },
      {
        title: "VIP alerts",
        text: "Get a notification when a VIP posts, so you can be one of the first to reply.",
        premium: true,
      },
      {
        title: "AI reply ideas",
        text: "Suggested replies from GrowX AI, running on your computer in your niche and voice. Edit them before you send.",
        premium: true,
      },
    ],
    steps: [
      {
        title: "Choose who to watch",
        text: "Your auto follow sources are already included. Add VIPs and anyone else whose posts you want to reply to.",
      },
      {
        title: "Open Reply targets",
        text: "In Engage, GrowX shows fresh posts from those accounts, ranked by freshness and how fast they are taking off.",
      },
      {
        title: "Reply and like",
        text: "Write a thoughtful reply, or start from an AI idea with Premium, and press the button to send it from your account.",
      },
    ],
    sections: [
      {
        heading: "Why replying early works on X",
        paragraphs: [
          "A good reply under a popular post can be read by many more people than a post from a small account, and some of those readers click through to profiles that add something useful. Timing matters: replies posted while a post is still fresh have a better chance of being seen near the top, while a reply added hours later often sits below many others.",
          "The hard part is noticing those posts in time. Refreshing a handful of big accounts by hand all day is distracting, and the home timeline does not show posts in order of opportunity. Reply targets does the watching for you, so you can spend a short, focused session replying instead of an hour scrolling and hoping to catch the right post.",
        ],
      },
      {
        heading: "How Reply targets finds and ranks posts",
        paragraphs: [
          "GrowX looks at recent posts from three groups: the **sources** you use for [auto follow](/features/twitter-auto-follow), the people you marked as **VIPs**, and anyone else you add. By default it keeps posts younger than 120 minutes and drops older ones. Each post is ranked by freshness and how fast it is taking off, so a post that is gaining traction rises above one that is quiet.",
          "Using your auto follow sources is deliberate. Those accounts are the ones your ideal audience already follows, so a visible reply there puts you in front of the same kind of people GrowX is following for you. Someone who notices your reply and then sees a follow from you has two reasons to look at your profile.",
        ],
      },
      {
        heading: "Replies, likes and the People list",
        paragraphs: [
          "You can reply to and like target posts directly from GrowX, without switching between tabs. GrowX only sends a reply or a like **when you press the button**; nothing is posted by itself, and GrowX never sends DMs. Everything happens in your own signed-in x.com session, and GrowX never asks for your X password.",
          "**People** is a lightweight contact list for X. Add tags and notes, mark VIPs and watch flags, and see your mutuals and the fans you don't follow back yet. Fans who regularly like and reply to you are good people to follow back and engage with, and the [top fans list](/features/twitter-unfollower-tracker) in Insights shows exactly who they are.",
        ],
        bullets: [
          "**Tags and notes**: remember who someone is and what you talked about",
          "**VIPs and watch flags**: the accounts you never want to miss",
          "**Mutuals**: people who follow you and whom you follow back",
          "**Fans you don't follow back yet**: an easy list to return the favour",
        ],
      },
      {
        heading: "VIP alerts and AI reply ideas (Premium)",
        paragraphs: [
          "With **Premium**, **VIP alerts** send a notification when one of your VIPs posts, so you can reply while the post is still minutes old rather than finding it later in the day. Keep the list short and focused on the accounts that matter most in your niche; alerts for too many accounts quickly turn into noise you start to ignore.",
          "**AI reply ideas** use GrowX AI, which runs on your computer with the model built into Chrome, to suggest replies that fit your niche and voice. Treat them as starting points: add your own experience or a specific detail, because generic replies are easy to spot. The [Twitter reply strategy guide](/blog/twitter-reply-strategy) covers what makes a reply worth reading.",
        ],
      },
    ],
    plans: {
      free: [
        "Reply targets from your sources, VIPs and accounts you add",
        "Ranking by freshness and how fast posts take off",
        "Reply and like from GrowX when you press the button",
        "People: tags, notes, VIPs, watch flags, mutuals and fans",
      ],
      premium: [
        "VIP alerts when a VIP posts",
        "AI reply ideas from on-device GrowX AI",
        "All included in the free 30-day Premium trial, no credit card",
      ],
    },
    faq: [
      {
        q: "Does GrowX reply to tweets automatically?",
        a: "No. GrowX shows reply targets and lets you reply and like from one screen, but nothing is sent until you press the button. It never sends DMs.",
      },
      {
        q: "How do I find tweets to reply to on Twitter?",
        a: "Pick accounts your audience follows and watch for their newest posts. GrowX's Reply targets does this for you, keeping posts younger than 120 minutes by default and ranking them by how fast they take off.",
      },
      {
        q: "How early should I reply to a big account's post on X?",
        a: "As early as you can while still adding something useful. Early replies have more time to be seen, which is why Reply targets focuses on posts from roughly the last two hours by default.",
      },
      {
        q: "What is the reply guy strategy on X?",
        a: "It means growing by leaving thoughtful replies on larger accounts in your niche. It works best with replies that add a real insight or experience, not one-word agreement.",
      },
      {
        q: "Can I get notified when a specific Twitter account posts?",
        a: "Yes, with Premium. Mark the account as a VIP in GrowX and VIP alerts will notify you when they post.",
      },
    ],
    relatedPosts: ["twitter-reply-strategy", "twitter-lists-guide", "how-to-increase-twitter-engagement", "twitter-algorithm-explained", "how-to-grow-on-twitter-x", "how-to-go-viral-on-twitter"],
    related: ["ai-tweet-writer", "twitter-auto-follow", "twitter-analytics"],
  },
];

export const getFeaturePage = (slug: string) => featurePages.find((f) => f.slug === slug);
