import type { Block, Post } from "./posts";

/**
 * Search-intent guides: how to grow on X (Twitter), bulk/mass follow, follow-back score, unfollowing, tool choice.
 * Same rules as posts.ts: facts come from docs/PRODUCT_FACTS.md (extension v2.4.4) and the site's own pages; no
 * invented statistics, testimonials or result promises; X's own limits are described without hard numbers that X
 * may change. Questions live in each post's `faq` field (rendered once by the page, with FAQPage structured data).
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });
const qa = (q: string, a: string) => ({ q, a });

const DATE = "2026-10-25";
const UPDATED = "2026-10-29";
const TRY = "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed. See the [plans](/pricing) or read [how GrowX works](/how-it-works).";

export const growthPosts: Post[] = [
  {
    slug: "how-to-grow-on-twitter-x",
    seoTitle: "How to Grow on Twitter (X): A Practical Plan",
    title: "How to Grow on Twitter (X): A Practical Follower Growth Plan That Uses GrowX",
    description:
      "How to grow on Twitter (X) step by step: profile, scheduled posts, early replies and smart following, and where the GrowX growth tool fits in your routine.",
    excerpt:
      "A realistic plan for growing a Twitter (X) account: the profile, a posting schedule, early replies, targeted following and a weekly review, with GrowX doing the repetitive parts.",
    category: "Guides",
    keywords: ["how to grow on Twitter", "how to grow on X", "grow Twitter followers", "Twitter growth tool", "X growth tool", "increase X followers", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 9,
    related: ["first-1000-followers-on-x", "best-twitter-growth-tools", "bulk-follow-twitter-safely"],
    sections: [
      {
        id: "intro",
        heading: "What actually makes a Twitter (X) account grow",
        blocks: [
          p("If you search **how to grow on Twitter**, you will find two kinds of advice: posting advice and automation tricks. Both matter, but neither works alone. Growth on X comes from three things working together: a profile that gives a stranger a reason to follow, content that gives them a reason to stay, and a steady flow of the right people discovering you, through your replies and through the people you follow."),
          p("**GrowX** is an X (Twitter) growth tool for Chrome built around that routine. Its smart auto follow finds and follows relevant people at a human pace, the post scheduler publishes at your best times, Reply targets surface fresh posts worth replying to, and Insights show what is working and who unfollowed you. This guide gives you a realistic plan and shows where each part fits."),
          p("Nothing here is a guarantee: results depend on your niche, your content and how consistent you are. If a tool or a guide promises a fixed number of followers, treat that as a warning sign."),
        ],
      },
      {
        id: "profile",
        heading: "Step 1: Make your profile worth following",
        blocks: [
          p("People decide in a few seconds whether to follow. Before you follow anyone or schedule anything, fix the basics:"),
          ul(
            "**A clear photo and header.** Accounts without a profile photo look like bots, and GrowX itself skips them when it picks candidates. Do not look like one.",
            "**A bio that says who you help or what you post about.** \"Founder building X for Y\" beats a list of emojis.",
            "**A pinned post** that shows your best work or explains what a new follower will get.",
            "**A link** to your site, newsletter or product so interest has somewhere to go.",
          ),
          p("Ask a friend to look at your profile for five seconds and tell you what you post about. If they cannot answer, rewrite the bio before you do anything else. Every other step in this plan sends people to this page."),
        ],
      },
      {
        id: "content",
        heading: "Step 2: Post on a schedule you can keep",
        blocks: [
          p("Consistency beats intensity. Pick a rhythm you can hold for months, for example one useful post a day plus a few replies, and stick to it. Mix formats: short opinions, step-by-step threads, screenshots of real work and questions that invite replies. Write about one niche for the first few months so the people you attract all want the same thing."),
          p("Scheduling is what makes the habit survive busy weeks. In the **Create** area of GrowX you write posts and threads (up to 25 parts and up to 4 images per post), then post now, pick a time or add them to a queue that fills preset time slots (09:00, 13:00 and 18:30 by default). A **best time to post** heat map, built from your own posts' engagement and when your followers are active, shows which slots deserve your best ideas. The free plan keeps up to 10 posts or threads waiting in the queue; Premium removes that limit. Read more about the [Twitter post scheduler](/features/twitter-post-scheduler)."),
          p("If you struggle to start, the 52 built-in templates (hooks, threads, lists, stories and more) give you a structure to fill in, and the free [thread maker](/tools/twitter-thread-maker) splits a long draft into numbered posts. With Premium, GrowX AI can draft, improve or suggest hooks on your own computer using the AI model built into Chrome. Keep your own voice: a template or an AI draft is a starting point, not a finished post."),
          note("Following people only pays off if your profile and recent posts reward the visit. Automation sends people to your profile; your content decides whether they follow back."),
        ],
      },
      {
        id: "engage",
        heading: "Step 3: Reply early where your audience already is",
        blocks: [
          p("Reply thoughtfully to accounts in your niche, especially ones slightly larger than you. A good reply is often seen by far more people than a post from a small account, and timing matters: a reply in the first hour of a post's life has a much better chance of being seen than one posted the next day."),
          p("GrowX **Reply targets**, in the Engage area, collects fresh posts (younger than 120 minutes by default) from your sources, your VIPs and anyone you add, ranked by freshness and by how fast they are taking off, so you can reply early instead of scrolling to find them. You can reply and like from GrowX, but nothing is sent until you press the button. Premium adds AI reply ideas. See [Reply targets](/features/twitter-reply-targets)."),
          p("Spend ten to fifteen minutes a day here. Add something useful, such as a number, an example or a disagreement with reasons, rather than \"great post\". Over a few weeks the same names start recognising yours, which is how replies turn into follows."),
        ],
      },
      {
        id: "follow",
        heading: "Step 4: Follow the right people, at a human pace",
        blocks: [
          p("Following relevant accounts is the oldest growth tactic on X and it still works when it is targeted. The mistake is volume without selection. GrowX's smart auto follow is built around selection:"),
          ul(
            "You add **source profiles**, accounts your ideal audience already follows, or let **Find sources for me** suggest them from the accounts you follow. GrowX reads their newest followers, who are active right now, and re-reads every source every hour.",
            "Each source's most recent followers are followed first. Everyone else gets a **follow-back score from 1 to 99** and must pass your filters (audience size, activity, profile photo and more) before it is queued. [How the score works](/blog/twitter-follow-back-score-growx).",
            "The autopilot follows **one account at a time** with random delays, breaks and hourly and daily caps, plus optional active hours and warm-up. [Pacing explained](/blog/how-growx-auto-follow-works).",
            "It slows down or stops when X shows a warning, and you can stop it instantly with Alt + Shift + S.",
          ),
          p("Start with the **Safe** pace for a new account and move to **Balanced**, the recommended default, after a few clean days. No tool can promise zero risk on X, so keep an eye on your account and respect any warning."),
        ],
      },
      {
        id: "measure",
        heading: "Step 5: Measure and adjust weekly",
        blocks: [
          p("Once a week, look at what worked. In the **Insights** area, post analytics show views, likes, reposts, replies, bookmarks and engagement rate for your recent posts (your latest 30 on the free plan), and **What works** compares topics and formats by engagement. In Grow, the **source leaderboard** shows the follow-back rate, retention and cost of each source, so you can keep the sources that bring real followers and replace the rest."),
          p("The **follower tracker** checks once a day who followed you and who unfollowed you, with 7 days of history on the free plan and the full history on Premium. A wave of unfollows after a certain kind of post is worth knowing about. More in the [unfollower tracker](/features/twitter-unfollower-tracker) overview."),
          ol(
            "Keep 3 to 5 sources that match your niche closely and replace the weakest one each week.",
            "Run the Safe or Balanced pace, and turn on active hours if you want the autopilot to keep a daily rhythm.",
            "Review the queue and raise the minimum score if it feels noisy.",
            "Compare your best posts with your best sources and do more of what they have in common.",
            "After a couple of weeks, run the cleanup scan and unfollow accounts that never followed back. See [how to unfollow non-followers safely](/blog/unfollow-non-followers-twitter).",
          ),
        ],
      },
      {
        id: "goals",
        heading: "Step 6: Turn it into a habit with goals and streaks",
        blocks: [
          p("Growth is mostly a habit problem. GrowX Insights lets you set daily goals for posts, replies and new followers, and tracks streaks and milestones so you can see whether you kept the routine, not just whether the number moved. A monthly goal planner shows the daily pace a target would need and where your current pace is heading."),
          p("Favour goals you control. \"Two posts and ten replies a day\" is a goal you can hit every day; \"100 followers a day\" is not, because it depends on other people. Hit the controllable goals for a month and the follower number tends to move with them, though no one can promise by how much."),
        ],
      },
      {
        id: "routine",
        heading: "A realistic weekly routine",
        blocks: [
          ul(
            "**Monday (30 minutes):** write the week's posts and add them to your queue slots, using the best-time heat map.",
            "**Every day (15 minutes):** open Reply targets, reply early to three to five fresh posts, and answer everyone who replied to you.",
            "**Every day (background):** let smart auto follow run at the Safe or Balanced pace while Chrome is open.",
            "**Friday (15 minutes):** check post analytics, the source leaderboard and the follower tracker, and change one thing for next week.",
            "**Every two weeks:** run a cleanup scan and unfollow, at a safe pace, the accounts that never followed back.",
          ),
          p("That is roughly two to three hours a week. The point of a growth tool is to keep the repetitive work small enough that you can keep doing the creative part for months."),
        ],
      },
      {
        id: "try",
        heading: "Start growing with GrowX",
        blocks: [p(TRY)],
      },
    ],
    faq: [
      qa("How long does it take to grow on Twitter (X)?", "There is no fixed timeline. Accounts that post consistently in one niche, reply to others and follow relevant people usually see steady movement over weeks and months rather than days. Track your own numbers weekly and judge the trend, not a single day."),
      qa("Is it better to follow people or to post?", "Both. Posting gives people a reason to follow you; following relevant people and replying early tell them you exist. GrowX schedules your posts and automates the following part, so your own time goes into writing and conversations."),
      qa("Do I need a paid X subscription to grow?", "No. GrowX works with free X accounts. It also has an X Premium pace (part of GrowX Premium) for accounts that have X's own Premium subscription, because those accounts have higher platform limits, and its composer supports long posts for X Premium accounts."),
      qa("Can GrowX post for me?", "Only what you schedule. Scheduled posts go out at the time or queue slot you chose, with a daily cap and a minimum gap between posts. A post that is more than 6 hours late, for example because your computer was off, is never posted by itself; it waits as \"missed\" for you to decide."),
      qa("Is auto following against X's rules?", "X restricts spam-like and aggressive automation, and its rules can change, so read them yourself. GrowX is built to be conservative: human-like pacing, caps and hard stops. You stay responsible for how you use it."),
    ],
  },
  {
    slug: "first-1000-followers-on-x",
    seoTitle: "How to Get Your First 1,000 Followers on X (Twitter)",
    title: "How to Get Your First 1,000 Followers on X (Twitter): A 30-Day Plan With GrowX",
    description:
      "A 30-day plan for your first 1,000 followers on X (Twitter): profile, scheduled posts, early replies and safe, targeted following with GrowX.",
    excerpt:
      "A week-by-week plan for your first 1,000 X followers, combining profile work, scheduled posts, early replies and targeted following with GrowX.",
    category: "Guides",
    keywords: ["first 1000 followers on Twitter", "get 1000 followers on X", "gain Twitter followers", "grow a new Twitter account", "Twitter growth tool", "Twitter follow back", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 7,
    related: ["how-to-grow-on-twitter-x", "mass-follow-twitter-limits", "twitter-follow-back-score-growx"],
    sections: [
      {
        id: "intro",
        heading: "Is 1,000 followers in 30 days realistic?",
        blocks: [
          p("It depends on your niche, your content and how much time you give it, so no honest guide can promise it. What a plan can do is remove wasted effort. This one is a 30-day routine for a **new or small X account**. Treat the number as a target to work towards, not a promise, and adjust the plan using your own results."),
          p("The routine combines manual work (profile, posts, replies) with **GrowX**, an X (Twitter) growth tool for Chrome, for the repetitive parts: finding people likely to follow back and following them at a safe pace, keeping a queue of scheduled posts, surfacing fresh posts to reply to and tracking what works. Everything in the plan works on the free plan; Premium extras are pointed out where they help."),
        ],
      },
      {
        id: "week1",
        heading: "Week 1: Set up and warm up",
        blocks: [
          ul(
            "Finish your profile: photo, header, clear bio, pinned post and a link.",
            "Install GrowX and follow the setup wizard. Add **3 to 5 source profiles** in your niche, or press **Find sources for me** to get suggestions from the accounts you already follow, and keep the **Safe** pace.",
            "Turn on the **warm-up** so a new account ramps up gradually (the daily cap starts at 60 and rises by 20 a day) instead of jumping to the full cap. Consider turning on **active hours** too; they are off by default.",
            "Write your first week of posts in one sitting and add them to the queue, then reply to 5 to 10 posts a day from accounts in your niche.",
          ),
          note("A brand-new account that follows hundreds of people on day one looks unnatural. Warm-up exists for exactly this reason, and no tool can promise zero risk on X."),
          p("Sources matter most in week one. GrowX follows each source's newest followers first, so a source that fits your niche gives you people who just showed interest in your topic. A source that is too big or too general gives you a crowd that does not care about what you post, however carefully it is paced."),
        ],
      },
      {
        id: "week2",
        heading: "Week 2: Raise quality, not just volume",
        blocks: [
          p("Open the queue and look at who GrowX is lining up. If many candidates look irrelevant, raise the **minimum follow-back score** (55 by default) or tighten the filters. If the queue is thin, lower it a little or add a source. Then check the **source leaderboard** in Grow: it shows the follow-back rate, retention and cost of every source, so you can drop the ones that do not deliver."),
          ul(
            "Keep posting daily. Try one thread or one \"how I did it\" post this week; the free [thread maker](/tools/twitter-thread-maker) helps you split a long draft into posts.",
            "Use **Reply targets** to find fresh posts from your sources and reply within their first hour, when replies are most visible. See [Reply targets](/features/twitter-reply-targets).",
            "Reply to the accounts your new followers engage with, since their audience overlaps with yours.",
          ),
        ],
      },
      {
        id: "week3",
        heading: "Week 3: Double down on what works",
        blocks: [
          p("By now you have data. Post analytics in Insights show views, likes, reposts, replies, bookmarks and engagement rate for your latest posts, and **What works** compares topics and formats (questions, images, text, threads, links) by engagement. Write more of what earned a response. With Premium full analytics, **Which posts brought followers** highlights posts that were followed by more new followers than usual in the next 24 hours."),
          p("Check the **best time to post** heat map and move your queue slots towards the hours when your followers are active. On the Grow side, add sources similar to your best performers. If your account has stayed clean (no warnings), you can move up to the **Balanced** pace."),
        ],
      },
      {
        id: "week4",
        heading: "Week 4: Clean up and keep the habit",
        blocks: [
          p("Run the **cleanup scan** to see who you follow that does not follow back, and unfollow the accounts you choose after reviewing them (up to 200 per run on the free plan). Keeping a healthy following-to-followers ratio makes your profile look more credible and keeps room under X's following limits. Details in [our unfollow guide](/blog/unfollow-non-followers-twitter)."),
          p("Look at the follower tracker as well: it records once a day who followed and who unfollowed you, with 7 days of history on the free plan. Then set a monthly goal in the goal planner so you can see the daily pace you need, and keep your daily goals and streak going into month two."),
        ],
      },
      {
        id: "daily",
        heading: "A daily routine that fits in 30 minutes",
        blocks: [
          p("Growth plans fail when they need more time than you have. This routine takes about half an hour a day once GrowX is running in the background, because the following and the posting no longer need you at a specific time."),
          ol(
            "Five minutes: check the GrowX popup. Is the autopilot running, is the queue full, any warnings?",
            "Ten minutes: write one post and add it to the queue, or check that tomorrow's slots are filled. More on the [post scheduler](/features/twitter-post-scheduler).",
            "Ten minutes: open Reply targets and reply to five to ten fresh posts from accounts in your niche, adding something useful rather than \"great post\".",
            "Five minutes: thank and reply to people who engaged with you, since early supporters are the most valuable followers you will get.",
          ),
          p("On Sundays, spend twenty extra minutes in Insights and on the source leaderboard: which sources produced follow-backs, which posts earned the most engagement, who unfollowed you, and what you will change next week. Small weekly adjustments compound much better than a big overhaul once a month."),
        ],
      },
      {
        id: "review",
        heading: "Day 30: Review the month and plan the next one",
        blocks: [
          p("At the end of the month, compare where you started with where you are, but look beyond the follower count. Which three posts earned the most engagement, and what do they have in common? Which two sources produced the most follow-backs with the best retention? On how many days did you keep your posting and reply goals? Those answers are the plan for month two."),
          p("Keep what worked, replace the weakest sources, move your queue slots to your best hours and set a new monthly goal in the planner based on the pace you actually achieved, not the pace you hoped for. A realistic goal you hit builds more momentum than an ambitious one you abandon in week two."),
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
            "Posting in bursts and then going silent for a week. A queue with a few posts waiting smooths this out.",
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
    faq: [
      qa("Can I really get 1,000 followers in 30 days?", "Some accounts do and many do not. It depends on niche, content quality, consistency and how targeted your following is. Use the plan as a structure and measure your own progress instead of expecting a fixed result."),
      qa("Which GrowX pace should a new account use?", "Start with Safe and turn on warm-up. Consider turning on active hours as well, since they are off by default. Move to Balanced after several clean days with no warnings from X."),
      qa("How many source profiles do I need?", "Three to five close matches are enough to start, or let Find sources for me suggest some. Add more only when the source leaderboard shows the existing ones are running dry or performing poorly."),
      qa("Do I need Premium for this plan?", "No. The plan works on the free plan: Safe and Balanced paces, core filters, up to 10 queued posts, analytics for your latest 30 posts and 7 days of follower history. The 30-day Premium trial adds the smart score, unlimited scheduling, GrowX AI and full analytics if you want to try them."),
      qa("What if people follow but do not engage?", "Followers who never see anything they like will not stay. Keep posting for one clear audience, reply to the people who do engage, and check What works in Insights to see which topics and formats get a response."),
    ],
  },
  {
    slug: "bulk-follow-twitter-safely",
    seoTitle: "Bulk Follow on Twitter (X) Safely: GrowX Guide",
    title: "Bulk Follow on Twitter (X) Safely: How to Follow in Bulk Without Looking Like a Bot",
    description:
      "How to bulk follow on Twitter (X) safely: pick sources, follow recent followers first, filter by score and pace it with GrowX smart auto follow.",
    excerpt: "Bulk following does not have to mean reckless following. Here is how to follow many relevant people on X at a safe pace with GrowX smart auto follow.",
    category: "Guides",
    keywords: ["bulk follow Twitter", "bulk follow on X", "Twitter bulk follow tool", "follow multiple accounts Twitter", "smart auto follow", "X (Twitter) growth tool", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 7,
    related: ["mass-follow-twitter-limits", "twitter-follow-back-score-growx", "how-growx-auto-follow-works"],
    sections: [
      {
        id: "intro",
        heading: "What \"bulk follow\" should mean",
        blocks: [
          p("People who search **bulk follow Twitter** usually want one thing: follow many relevant accounts without clicking the follow button hundreds of times. That is a fair goal. The risk is how it is done. Tools that blast follows as fast as possible get accounts rate-limited, locked or suspended, and they follow people who will never follow back."),
          p("**GrowX**, an X (Twitter) growth tool for Chrome, treats bulk following as a pipeline in its smart auto follow: choose where candidates come from, filter and score them, then follow the best ones slowly, over hours and days. You still end up following hundreds of relevant accounts, but they arrive at a pace that looks human. The [Twitter auto follow](/features/twitter-auto-follow) page has the short version; this guide goes step by step."),
        ],
      },
      {
        id: "sources",
        heading: "Step 1: Choose sources your audience already follows",
        blocks: [
          p("Add accounts in your niche as **source profiles**: creators, brands or communities. GrowX reads each source's newest followers, who are recently active and already interested in your topic, and re-reads every source every hour so the queue stays fresh. Three to five close matches beat twenty loose ones."),
          p("Not sure where to start? **Find sources for me** looks at the accounts you already follow and ranks them by how active, mid-sized and follow-back-prone their audience is. **Find people now** harvests candidates immediately instead of waiting for the next hourly pass. On Premium you can go beyond profiles and use a post's reposts, replies or likes, a search or #hashtag, or an X List as a source, which helps when your audience gathers around a topic rather than a person."),
        ],
      },
      {
        id: "recent",
        heading: "Step 2: Follow the freshest followers first",
        blocks: [
          p("Each source's newest followers (the top 50 of its list by default) are followed first. Someone who followed a niche account in the last few hours is active right now and has just shown interest in your topic, so these accounts skip the follow-back score. They do not skip the safety checks: GrowX still leaves out private accounts, accounts without a photo, accounts with zero posts, giant accounts and anyone matching your exclude keywords."),
        ],
      },
      {
        id: "filters",
        heading: "Step 3: Filter and score everyone else",
        blocks: [
          p("Bulk following only works if the list is good. For everyone beyond the freshest followers, GrowX removes accounts you already follow, private accounts, accounts without a profile photo and accounts that are too new, inactive, small or large (limits you can change). Survivors get a **follow-back score from 1 to 99**, and only those above your minimum (55 by default) join the queue, which holds around 250 candidates and drops any that are older than 72 hours. [See how the score is built](/blog/twitter-follow-back-score-growx)."),
          p("On Premium you can also **import your own list** of usernames to follow first, which is handy for event attendees, a newsletter community or a list you researched yourself, and the **smart score** learns from your own follow-backs once you have enough history. Anyone on your never-follow list is always skipped."),
        ],
      },
      {
        id: "pace",
        heading: "Step 4: Follow in bulk at a safe pace",
        blocks: [
          ul(
            "**Safe**: 45 to 110 seconds between follows, a rest every 12 follows, up to 18 an hour and about 150 a day. Meant for new accounts.",
            "**Balanced**: 30 to 75 seconds, a rest every 18 follows, up to 28 an hour and about 280 a day. The recommended default.",
            "**Turbo** (about 390 a day) and **X Premium pace** (about 800 a day, only for accounts with X's own Premium subscription) are faster presets for aged accounts, available on GrowX Premium.",
          ),
          p("These are the extension's own rolling caps; X also enforces limits that it can change at any time. If you want the autopilot to keep a daily rhythm, turn on **active hours** (off by default; 08:00 to 23:30 when enabled, on the days you choose). The **adaptive slow-down** reduces the pace automatically if X shows a warning, and occasional longer pauses keep the follows from being evenly spaced."),
        ],
      },
      {
        id: "safety",
        heading: "Step 5: Keep an eye on safety signals",
        blocks: [
          ul(
            "Follow verification checks that follows actually stuck, which helps detect silent (shadow) limits.",
            "A following-cap guard (5,000, or about 10% above your follower count) pauses instead of hammering X's following limit.",
            "GrowX stops when you are signed out, when the account is locked, when X shows a challenge, or after repeated automation warnings, and it never clicks through a challenge.",
            "Alt + Shift + S stops everything immediately.",
          ),
          note("No tool can promise zero risk on X. You remain responsible for following X's rules and for the accounts you follow."),
        ],
      },
      {
        id: "mistakes",
        heading: "Common bulk-follow mistakes and how GrowX avoids them",
        blocks: [
          p("Most bulk-follow problems come from the same few habits. Knowing them helps you choose settings that keep your account healthy."),
          ul(
            "**One giant source.** Following the followers of one huge celebrity gives you a crowd that does not care about your niche. Use several smaller, closely related sources.",
            "**Ignoring the score.** A queue with no minimum score is just a random list. Keep the minimum at a level where the follow-back rate on the source leaderboard is worth the effort.",
            "**Running at the fastest pace on a young account.** Speed is the main trigger for warnings. Faster presets are for aged accounts with a clean record.",
            "**Never checking results.** The point of bulk following is follow-backs. If a source does not deliver after a few days, remove it, or let Premium's auto-replace retire weak sources after a fair trial and swap in the best auto-found one (retired sources can be restored).",
            "**Forgetting the exit.** A large following list needs maintenance. Plan a gradual cleanup after a couple of weeks.",
          ),
          p("GrowX keeps old candidates out of the queue (anything older than 72 hours is dropped), re-reads sources every hour and tracks follow-back rate, retention and cost per source, so you can fix these mistakes with data instead of guesses."),
        ],
      },
      {
        id: "after",
        heading: "After the bulk follow: measure and tidy",
        blocks: [
          p("Bulk following is only half the job. Give new follows a week or two, then look at the results. The source leaderboard tells you which sources to keep, and [Twitter analytics](/features/twitter-analytics) in the Insights area show whether your posts are giving new visitors a reason to stay. A stream of follows that lands on an empty or stale profile wastes the effort, so keep a few posts in the scheduler queue while you grow."),
          p("Then tidy up. The cleanup scan lists the accounts that did not follow back so you can review and unfollow them at a safe pace (up to 200 per run on the free plan). On Premium, **automatic cleanup** can unfollow GrowX's own follows that did not follow back after 2, 5 or 7 days, only during autopilot breaks and within the same safe caps; it never touches accounts you followed yourself or imported. More in the [Twitter unfollow tool](/features/twitter-unfollow-tool) overview."),
        ],
      },
      {
        id: "try",
        heading: "Bulk follow with GrowX",
        blocks: [p(TRY)],
      },
    ],
    faq: [
      qa("How many people can I bulk follow per day with GrowX?", "On the Safe pace GrowX follows up to about 150 a day and on Balanced up to about 280 a day, with hourly caps as well. Faster presets (Turbo and the X Premium pace) are part of GrowX Premium and meant for aged accounts. X applies its own limits too."),
      qa("Can I bulk follow a list of usernames I already have?", "Yes. You can import your own list of usernames and GrowX follows them first, still at the paced rate. List import is a Premium feature."),
      qa("Will everyone I follow follow back?", "No. Only some will. Recent followers first, the filters and the follow-back score raise the odds by putting likelier accounts first, but no tool can promise a follow-back rate."),
      qa("Does bulk following work while my computer is asleep?", "No. GrowX needs Chrome running and you signed in to X. While the autopilot runs it keeps the computer awake, keeps working when you close the popup or switch tabs, and resumes after Chrome restarts."),
    ],
  },
  {
    slug: "mass-follow-twitter-limits",
    seoTitle: "Mass Follow on Twitter: X Follow Limits & Risks",
    title: "Mass Follow on Twitter (X): Follow Limits, Risks and a Safer Way to Do It",
    description:
      "Thinking about mass following on Twitter (X)? Learn how follow limits work, what gets accounts restricted and how GrowX smart auto follow keeps the pace safer.",
    excerpt: "What really happens when you mass follow on X, why limits exist and how to stay inside them.",
    category: "Guides",
    keywords: ["mass follow Twitter", "Twitter follow limit", "X follow limit per day", "Twitter follow limit reached", "safe Twitter auto follow", "X (Twitter) growth tool", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 7,
    related: ["bulk-follow-twitter-safely", "first-1000-followers-on-x", "how-growx-auto-follow-works"],
    sections: [
      {
        id: "intro",
        heading: "Why mass following gets accounts in trouble",
        blocks: [
          p("**Mass follow** means following a very large number of accounts quickly, hoping some follow back. X treats sudden, repetitive following as spam-like behaviour. Possible consequences range from a temporary \"you are unable to follow more accounts\" message to locked or suspended accounts. The exact thresholds are not fixed and X can change them, so check X's Help Center for the current rules."),
          p("This guide explains how the limits work, which behaviours look automated, and how GrowX, an X (Twitter) growth tool whose smart auto follow is built around pacing, keeps following within safer bounds. It cannot make mass following risk-free, and neither can any other tool."),
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
            "Following hundreds of people while never posting or replying yourself.",
          ),
          p("Most of these are about rhythm and relevance rather than raw numbers. A slower account that follows random people around the clock can look worse than a faster one that follows relevant people during waking hours and posts every day."),
        ],
      },
      {
        id: "safer",
        heading: "A safer way to mass follow with GrowX",
        blocks: [
          p("GrowX is designed around avoiding those patterns:"),
          ul(
            "**Random delays and regular breaks**, plus occasional longer pauses (on about 8% of follows), so follows are not evenly spaced.",
            "**Optional active hours and warm-up**: active hours are off by default, but turning them on (08:00 to 23:30, on days you choose) stops the autopilot running around the clock, and warm-up starts a new account at a daily cap of 60 and raises it by 20 a day.",
            "**Rolling hourly and daily caps** (Safe about 150 a day, Balanced about 280 a day).",
            "**Targeted candidates only**: each source's newest followers go first, and everyone else must pass filters and a follow-back score before entering the queue.",
            "**Adaptive slow-down and hard stops** after any warning, rate limit, challenge, lock or sign-out.",
            "**Follow verification** to detect silent limits, and a **following-cap guard** (5,000, or about 10% above your follower count) that pauses instead of hammering X's cap.",
          ),
          p("The full pipeline is in [how GrowX auto follow works](/blog/how-growx-auto-follow-works), and the [Twitter auto follow](/features/twitter-auto-follow) page summarises the settings."),
          note("These measures reduce risk; they cannot remove it. No tool can promise zero risk on X. Start on the Safe pace, and only move up once your account has a clean history."),
        ],
      },
      {
        id: "warmup",
        heading: "How to warm up a new account before following at scale",
        blocks: [
          p("A new account has no history, so any burst of activity stands out. Warming up means increasing activity gradually so the account builds a normal-looking record."),
          ol(
            "Complete the profile and post a few times before following anyone. Filling GrowX's post queue with a week of posts makes this easy.",
            "Turn on GrowX warm-up so the daily cap starts at 60 and rises by 20 a day instead of starting at the full Safe or Balanced cap.",
            "Stay on the Safe pace for the first week or two and consider turning on active hours.",
            "Only after a clean period with no warnings consider moving to Balanced.",
            "Treat any rate-limit or warning message as a reason to pause for the day, not to retry.",
          ),
          p("Warm-up does not make mass following risk-free. It simply avoids the most obvious pattern, a brand-new account doing a lot at once. Keep your own judgement in the loop: if something about your account's behaviour on X feels off, stop the autopilot with Alt + Shift + S and look at it manually."),
        ],
      },
      {
        id: "hit-limit",
        heading: "What to do if you hit a limit",
        blocks: [
          p("If X tells you that you cannot follow more accounts right now, the right response is patience. Stop following for the rest of the day, avoid clicking follow buttons by hand as well, and let the restriction clear. Then resume at a lower pace than before."),
          p("If the message keeps coming back, or you see a lock, a verification challenge or a suspension notice, stop all automation and follow X's own instructions to resolve it. GrowX will not click through challenges for you and will halt after repeated automation warnings, because pushing through is how small problems turn into permanent ones."),
          p("Finally, review what triggered it. Was the pace too high for the age of the account? Were sources too broad, so the queue was full of weak candidates you had to churn through? Fixing the cause matters more than waiting out the limit."),
        ],
      },
      {
        id: "unfollow",
        heading: "Mass following needs careful tidying",
        blocks: [
          p("After a campaign, review who did not follow back. Do it gradually rather than in one burst: GrowX's cleanup unfollows one account at a time at a safe pace of up to 30 an hour and 200 a day, and re-checks each account right before unfollowing it. See our guide to [unfollowing non-followers safely](/blog/unfollow-non-followers-twitter) and the [Twitter unfollow tool](/features/twitter-unfollow-tool) overview."),
          p("It also helps to watch the other direction. The [unfollower tracker](/features/twitter-unfollower-tracker) records once a day who followed and who unfollowed you, so you can see whether a following campaign brings people who stay or people who leave after a few days."),
        ],
      },
      {
        id: "balance",
        heading: "Following is one lever, not the whole strategy",
        blocks: [
          p("Even when it is paced well, following is only one lever. People who notice your follow look at your profile and your last few posts before deciding, so a following campaign works best when the profile is finished and the posts keep coming. GrowX's scheduler can keep a queue of posts going while the autopilot runs, and Reply targets help you join conversations in your niche while they are still fresh."),
          p("A useful rule of thumb: if you spend more time tuning follow settings than writing posts and replies, the balance is off. Let the tool handle the repetitive following at a conservative pace, and put your own time into the things that make people stay."),
        ],
      },
      {
        id: "try",
        heading: "Follow smarter",
        blocks: [p(TRY)],
      },
    ],
    faq: [
      qa("What does \"you are unable to follow more accounts at this time\" mean?", "It means X has temporarily limited your following, usually because of volume or pace. Stop following for a while. GrowX treats such warnings as a signal to throttle and rest."),
      qa("How many follows per day is safe?", "There is no number that is safe for every account. New and low-trust accounts need to be slower. That is why GrowX recommends the Safe pace with warm-up for new accounts and slows down by itself after warnings."),
      qa("Is following and then unfollowing risky?", "Rapid follow and unfollow cycles look manipulative. Give follows time to be returned and unfollow gradually. GrowX's Premium automatic cleanup waits 2, 5 or 7 days and only runs during autopilot breaks within the safe unfollow caps."),
      qa("Can GrowX get my account suspended?", "No tool can promise zero risk on X. GrowX reduces the risk with paced, targeted following and hard stops, but you remain responsible for staying within X's rules."),
    ],
  },
  {
    slug: "twitter-follow-back-score-growx",
    seoTitle: "Twitter Follow-Back Score: How GrowX Scores Accounts",
    title: "Twitter Follow-Back Score Explained: How GrowX Finds Accounts That Follow Back",
    description:
      "What is a Twitter (X) follow-back score? The signals GrowX uses to rate accounts 1-99, the Premium smart score that learns from you, and how to tune it.",
    excerpt:
      "The follow-back score (sometimes searched as a Twitter growth score) is how GrowX decides who is worth following. Here is what goes into it, and how the smart score learns from your own results.",
    category: "Features",
    keywords: ["Twitter follow back score", "Twitter growth score", "who will follow back on Twitter", "X follow back rate", "find accounts that follow back", "X (Twitter) growth tool", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 7,
    related: ["bulk-follow-twitter-safely", "growx-features-guide-scoring-filters-cleanup", "best-twitter-growth-tools"],
    sections: [
      {
        id: "intro",
        heading: "What is a follow-back score?",
        blocks: [
          p("When you follow someone hoping they follow back, you are betting on a person you know little about. The **GrowX follow-back score** replaces the guess with an estimate. Each candidate gets a number from **1 to 99**, the estimated chance that they follow back, based on public profile data. It is part of the smart auto follow in GrowX, the X (Twitter) growth tool for Chrome, and it decides who enters your follow queue."),
          note("The score is an estimate, not a promise about any one account. Its job is to put likelier accounts first, so your follows are spent where they are most likely to pay off."),
        ],
      },
      {
        id: "signals",
        heading: "The signals behind the score",
        blocks: [
          ul(
            "**Follow ratio**: accounts that follow many more people than follow them score higher; accounts followed by far more people than they follow score lower.",
            "**Audience size**: small and mid-sized accounts score better than very large ones.",
            "**How many accounts they follow**: people who follow hundreds or thousands are likelier to follow back than people who follow almost nobody.",
            "**Follow-back words** in the bio, such as \"follow back\" or \"mutuals\" (the boost-word list is editable).",
            "**Recent activity**: a recent post raises the score, long silence lowers it.",
            "**Account age, photo and bio**: very new accounts and profiles without a photo or bio score lower.",
            "**Verified status** is taken into account.",
            "**Recency**: being one of a source's newest followers adds a little.",
          ),
          p("None of these signals is decisive on its own. A small account with a photo, a bio and a post from yesterday that follows about as many people as follow it is the typical profile that scores well, because it looks like an active person who notices new followers."),
        ],
      },
      {
        id: "recent",
        heading: "When the score is skipped: recent followers first",
        blocks: [
          p("There is one group the score does not judge. Each source's **newest followers** (the top 50 of its list by default) are followed first, before the scored queue. Someone who followed a niche account minutes or hours ago is active right now and has just shown interest in the topic, which is a stronger signal than anything in their profile."),
          p("They still pass the safety checks: GrowX skips private accounts, accounts without a photo, accounts with zero posts, giant accounts and anyone matching your exclude keywords. Everyone else from the source goes through the full score."),
        ],
      },
      {
        id: "tuning",
        heading: "Choosing your minimum score",
        blocks: [
          p("The minimum score (55 by default) decides who enters the queue. Around 40 favours volume; around 70 favours quality and a smaller, cleaner queue. The queue keeps around 250 candidates and drops any that are older than 72 hours, and sources are re-read every hour, so a stricter minimum mostly means fewer follows, not stale ones."),
          p("Change it in small steps and give each change a few days. Review the queue before and after, and compare follow-back rates on the source leaderboard rather than judging by a single day."),
        ],
      },
      {
        id: "smart",
        heading: "The smart score: learning from your own follow-backs (Premium)",
        blocks: [
          p("The standard score uses the same signals for everyone. But audiences differ: what predicts a follow-back among designers may not hold among founders or fitness creators. The **smart score**, part of GrowX Premium, adds a small model (a logistic regression) trained on **your own** results, meaning which of the accounts GrowX followed for you actually followed back."),
          ul(
            "It needs enough data first: about 80 settled follows, with at least 12 follow-backs and 12 non-follow-backs.",
            "It is checked on a holdout set, follows it was not trained on, before it is used.",
            "It is blended into the standard score at up to 60% weight, and only when it clearly beats chance. Otherwise GrowX keeps using the standard score.",
          ),
          p("In practice the smart score switches on by itself once your history supports it and stays out of the way when it does not. You do not need to configure it."),
        ],
      },
      {
        id: "filters",
        heading: "Score plus filters",
        blocks: [
          p("Hard filters run before scoring: skip accounts you follow or that already follow you, private accounts, no profile photo, too new, too inactive, too small or too large, too few posts and anyone matching your exclude keywords. The score then ranks whoever remains. Advanced include-keyword, location and verified filters are available on Premium. Full list in the [features guide](/blog/growx-features-guide-scoring-filters-cleanup), and the settings are summarised on the [Twitter auto follow](/features/twitter-auto-follow) page."),
        ],
      },
      {
        id: "example",
        heading: "Reading a score in practice",
        blocks: [
          p("Imagine two candidates from the same source. The first has a few hundred followers, follows about as many people, has a photo and bio and posted two days ago. The second has a hundred thousand followers, follows almost nobody and last posted months ago. Using the signals above, the first will score noticeably higher: its ratio and size suggest a typical person who follows back, and it is active. The second is unlikely to notice a follow, so it falls below the minimum and never enters your queue."),
          p("That is the whole idea. You do not need to inspect every profile; you set the quality dial once and review the queue from time to time. If most candidates from a source score low, the source is probably too broad or too large, and replacing it with a smaller, more specific community is usually a better fix than lowering the minimum."),
          p("Remember that the score only ranks candidates. Whether someone follows back still depends on your profile and your recent posts, which is why the [growth plan](/blog/how-to-grow-on-twitter-x) starts with the basics."),
        ],
      },
      {
        id: "blind-spots",
        heading: "What the score cannot see",
        blocks: [
          p("The score only knows what a public profile shows. It cannot tell whether someone is busy, already overwhelmed by notifications, or simply not interested in your topic. It also cannot see your profile through their eyes. That is why two accounts with the same settings can get very different follow-back rates: the one with a clear bio, a pinned post and recent useful posts converts more of the same visitors."),
          p("Treat the score as a way to spend your daily follow budget sensibly, not as a forecast. If your follow-back rate stays low even with a high minimum score, the fix is usually on the profile and content side, or in choosing sources whose audience genuinely overlaps with yours."),
        ],
      },
      {
        id: "improve",
        heading: "Using the score to improve results",
        blocks: [
          ol(
            "Start at the default and let GrowX follow for a few days.",
            "Open the source leaderboard and compare the follow-back rate, retention and cost of each source.",
            "Raise the minimum score if the rate is low; lower it if the queue runs dry.",
            "Replace weak sources with ones that match your best-performing followers, or let Premium's auto-replace do it after a fair trial.",
            "Check [Twitter analytics](/features/twitter-analytics) in Insights to see whether your posts give new visitors a reason to follow back.",
          ),
        ],
      },
      {
        id: "try",
        heading: "See the score in action",
        blocks: [p(TRY)],
      },
    ],
    faq: [
      qa("Is the follow-back score a guarantee?", "No. It is an estimate from public profile signals. It helps order candidates; it does not predict any one person."),
      qa("What is a good minimum score?", "The default is 55. Try around 70 for quality and a smaller queue, or around 40 for more volume. Check the source leaderboard to see what your numbers produce."),
      qa("What is the smart score?", "A Premium feature that learns from your own follow-backs. After about 80 settled follows (with at least 12 follow-backs and 12 non-follow-backs) it trains a small model, checks it on a holdout set and blends it into the score at up to 60% weight, only when it clearly beats chance."),
      qa("Is the score the same as a Twitter growth score?", "People search both. GrowX's number rates how likely an account is to follow back; it is not a rating of your own account."),
      qa("Can I change what the score looks for?", "You can edit the follow-back boost words and the filters that run before scoring. The scoring signals themselves are built into the extension, and on Premium the smart score adapts them to your own results."),
    ],
  },
  {
    slug: "unfollow-non-followers-twitter",
    seoTitle: "How to Unfollow Non-Followers on Twitter (X) Safely",
    title: "How to Unfollow Non-Followers on Twitter (X): A Safe Bulk Unfollow Guide",
    description:
      "How to find and unfollow people who don't follow you back on Twitter (X), see who unfollowed you and clean up inactive accounts at a safe pace with GrowX.",
    excerpt: "Find accounts that don't follow back or have gone quiet, see who unfollowed you, review the list and unfollow at a safe pace.",
    category: "Guides",
    keywords: ["unfollow non-followers Twitter", "bulk unfollow Twitter", "mass unfollow Twitter", "who doesn't follow me back on Twitter", "who unfollowed me on Twitter", "Twitter unfollow tool", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 7,
    related: ["mass-follow-twitter-limits", "growx-features-guide-scoring-filters-cleanup", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "why",
        heading: "Why clean up who you follow",
        blocks: [
          p("After a growth push, your following list is full of people who never followed back and accounts that have gone quiet. Tidying it keeps your ratio healthy, makes your profile look more credible and leaves room under X's following cap. The trick is doing it **gradually and with review**, not by unfollowing everyone in one go."),
          p("GrowX, an X (Twitter) growth tool for Chrome, has a dedicated **Cleanup** area for this, next to its smart auto follow, scheduler and Insights. This guide shows how to find who to unfollow, how to do it at a safe pace, and how to keep an eye on who unfollows you."),
        ],
      },
      {
        id: "scan",
        heading: "Find who to unfollow with the GrowX cleanup scan",
        blocks: [
          p("The Cleanup area scans who you follow and who follows you, then shows results for you to review before anything happens."),
          ul(
            "**Not following back**: accounts you follow that do not follow you. If your followers list could not be read to the end, those rows are marked \"unverified\" and bulk select is turned off for that view.",
            "**Inactive accounts**: those whose latest post is older than 30, 90, 180 or 365 days. If X does not say when an account last posted, its activity is unknown, and unknown is never called inactive.",
          ),
          p("The two views overlap in useful ways. An account that does not follow back and has not posted for a year is an easy decision; a large creator who does not follow back but posts every day is often worth keeping."),
        ],
      },
      {
        id: "review",
        heading: "Review before you unfollow",
        blocks: [
          p("You filter, search, sort and select the accounts yourself. Keep accounts you value even if they do not follow back, such as friends, customers or creators you learn from. GrowX only touches the accounts you selected and confirmed, and each one is re-checked with X right before it is unfollowed, so someone who followed you back in the meantime is not removed by mistake."),
          p("Narrow the list before you review it. For example, start with accounts that are both not following back and inactive for 90 days, go through that short list, then widen the filters. Reviewing a few dozen accounts carefully beats skimming thousands."),
        ],
      },
      {
        id: "pace",
        heading: "Unfollow at a safe pace",
        blocks: [
          p("Unfollows run one at a time with delays and rolling caps. The Safe unfollow pace allows up to 30 an hour and 200 a day, and the runner stops on a rate limit, warning, sign-out or lock rather than working around them."),
          ul(
            "**Free plan**: scanning, filtering and review, and up to **200 unfollows per run** at the Safe pace.",
            "**Premium**: select-all **bulk unfollow** of up to 5,000 accounts in one run, and a **Balanced unfollow pace** of 45 an hour and 320 a day.",
          ),
          p("A larger batch does not run faster than its pace allows; it simply spreads over more days. The [Twitter unfollow tool](/features/twitter-unfollow-tool) page summarises the options."),
          note("Avoid following heavily and unfollowing heavily on the same day. Alternate, and keep both paced. No tool can promise zero risk on X."),
        ],
      },
      {
        id: "auto",
        heading: "Automatic cleanup of GrowX's own follows (Premium)",
        blocks: [
          p("If you use GrowX's smart auto follow, **automatic cleanup** can handle the follow-backs that never came. It unfollows accounts that GrowX itself followed and that did not follow back after **2, 5 or 7 days** (you choose)."),
          ul(
            "It only runs during the autopilot's breaks, 40 to 90 seconds apart.",
            "It uses the same caps as the Safe unfollow pace: 30 an hour and 200 a day.",
            "It never touches accounts you followed yourself or imported from a list.",
          ),
          p("Longer waits give people more time to notice and follow back; shorter waits keep your ratio tighter. Seven days is the gentlest choice for most accounts."),
        ],
      },
      {
        id: "tracker",
        heading: "See who unfollowed you",
        blocks: [
          p("Cleanup is about who you follow. The other side is who follows you. The **follower tracker** in GrowX Insights checks once a day who followed you and who unfollowed you. The free plan keeps 7 days of history; Premium keeps the full history and adds a one-click unfollow back for people who left."),
          p("Use it to spot patterns rather than to take things personally. A few unfollows a day is normal; a spike after a particular post or after a heavy following day tells you something about your content or your targeting. Compare it with post performance in [Twitter analytics](/features/twitter-analytics), and read more in the [unfollower tracker](/features/twitter-unfollower-tracker) overview."),
        ],
      },
      {
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
      {
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
          p("The cleanup tools are built so you stay in control: nothing is unfollowed until you select it and confirm, unless you turn on automatic cleanup for GrowX's own follows."),
        ],
      },
      {
        id: "routine",
        heading: "A simple routine",
        blocks: [
          ol(
            "Give new follows a week or two to follow back.",
            "Run a cleanup scan.",
            "Review the not-following-back list and deselect anyone you want to keep.",
            "Unfollow the rest in a Safe-paced run.",
            "Check the follower tracker and growth chart to see the effect on your ratio.",
          ),
          p("How often? For most accounts every two to four weeks is enough. If the autopilot follows a lot for you, a weekly scan keeps the list manageable, or Premium automatic cleanup can handle GrowX's own follows in the background so the manual scan only has to cover accounts you followed yourself."),
          p("New to GrowX? Start with [how auto follow works](/blog/how-growx-auto-follow-works)."),
        ],
      },
      {
        id: "try",
        heading: "Clean up with GrowX",
        blocks: [p(TRY)],
      },
    ],
    faq: [
      qa("How do I find who does not follow me back on Twitter?", "Run the GrowX cleanup scan: it compares who you follow with who follows you and lists accounts that do not follow back, flagging results as unverified when the followers list could not be read fully."),
      qa("Can I see who unfollowed me on Twitter (X)?", "Yes. The follower tracker in GrowX Insights checks once a day who followed and who unfollowed you. The free plan keeps 7 days of history; Premium keeps the full history and adds one-click unfollow back."),
      qa("Can I unfollow inactive accounts only?", "Yes. Filter the scan by inactivity (30, 90, 180 or 365 days) and select only those. Accounts with an unknown last post time are never labelled inactive."),
      qa("How many accounts can I unfollow at once?", "Up to 200 per run on the free plan. Premium adds select-all bulk unfollow of up to 5,000 in one run. Either way, unfollows go out one at a time within hourly and daily caps."),
      qa("Does GrowX unfollow anyone automatically?", "Only what you select and confirm, unless you turn on Premium automatic cleanup, which unfollows GrowX's own follows that did not follow back after 2, 5 or 7 days. It never touches accounts you followed yourself or imported."),
    ],
  },
  {
    slug: "best-twitter-growth-tools",
    seoTitle: "Best Twitter (X) Growth Tools: What to Look For",
    title: "Best Twitter (X) Growth Tools: What to Look for Before You Install One (and Where GrowX Fits)",
    description:
      "Comparing Twitter (X) growth tools? Use this checklist for safety, targeting, scheduling, analytics, privacy and price, and see honestly where GrowX fits.",
    excerpt: "A buyer's checklist for X growth tools, from auto follow and scheduling to AI writing and analytics, with an honest look at where GrowX fits.",
    category: "Guides",
    keywords: ["best Twitter growth tools", "Twitter growth tool", "X growth tool", "best Twitter auto follow", "Twitter post scheduler", "Twitter analytics tool", "GrowX"],
    datePublished: DATE,
    dateModified: UPDATED,
    readMinutes: 8,
    related: ["how-to-grow-on-twitter-x", "bulk-follow-twitter-safely", "twitter-follow-back-score-growx"],
    sections: [
      {
        id: "intro",
        heading: "How to judge a Twitter growth tool",
        blocks: [
          p("Search for the **best Twitter growth tool** and you will meet dozens of options with similar promises. Some only follow people, some only schedule posts, and a few try to do everything. Instead of trusting a ranking, judge any tool, GrowX included, against the same checklist."),
          p("GrowX is an X (Twitter) growth tool for Chrome that combines smart auto follow, a post scheduler, an on-device AI writer, analytics, an unfollower tracker, Reply targets and cleanup tools. We built it to do well on these points, and we will say plainly where it has limits. The [features overview](/features) lists everything in one place."),
        ],
      },
      {
        id: "safety",
        heading: "1. Does it protect your account?",
        blocks: [
          ul(
            "Randomised delays, breaks and rolling hourly and daily caps instead of fixed-interval bursts.",
            "It slows down or stops on warnings, rate limits, challenges, locks and sign-outs, and never clicks through challenges.",
            "An emergency stop you can reach in one keystroke.",
            "Safety limits on posting too, not only on following: a daily cap and a minimum gap between scheduled posts.",
          ),
          p("GrowX does all of these (see [how it works](/blog/how-growx-auto-follow-works)), and its safety features are on every plan, not reserved for paying users. No tool, ours included, can promise zero risk on X."),
        ],
      },
      {
        id: "targeting",
        heading: "2. Does it choose who to follow?",
        blocks: [
          p("A tool that follows anyone wastes your follows. Look for filters (audience size, activity, profile quality, keywords) and some way to rank candidates. GrowX uses source profiles (or finds them for you), follows each source's newest followers first and ranks everyone else with hard filters and a [follow-back score from 1 to 99](/blog/twitter-follow-back-score-growx). A source leaderboard shows the follow-back rate, retention and cost of each source, and on Premium a smart score learns from your own follow-backs."),
        ],
      },
      {
        id: "content",
        heading: "3. Does it help you post consistently?",
        blocks: [
          p("Following brings people to your profile; posts make them stay. A growth tool that ignores content leaves half the job to you. Look for a composer that counts characters the way X does, threads, a queue and some guidance on when to post."),
          p("GrowX's **Create** area handles posts and threads of up to 25 parts, schedules them or adds them to a queue of time slots, and shows a best-time-to-post heat map from your own data. The free plan keeps up to 10 posts waiting; Premium adds unlimited scheduling, evergreen recycling and auto-plug. See the [Twitter post scheduler](/features/twitter-post-scheduler)."),
          p("If a tool offers AI writing, ask where the text goes. **GrowX AI** (Premium) runs on your own computer using the AI model built into Chrome, with no API key and nothing sent to GrowX, and it leaves placeholders instead of inventing facts. More on the [AI tweet writer](/features/ai-tweet-writer)."),
        ],
      },
      {
        id: "measure",
        heading: "4. Does it show what is working?",
        blocks: [
          p("Without measurement, you cannot tell good settings from bad ones. Look for post-level analytics, a way to see who followed and who unfollowed you, and per-source results if the tool follows people for you."),
          p("GrowX Insights shows views, likes, reposts, replies, bookmarks and engagement rate for your posts (your latest 30 on the free plan, everything with Premium full analytics), compares topics and formats, and tracks daily who followed and unfollowed you (7 days of history free, full history on Premium). Daily goals, streaks and milestones keep the routine visible. See [Twitter analytics](/features/twitter-analytics)."),
        ],
      },
      {
        id: "engage",
        heading: "5. Does it help you engage, without replying for you?",
        blocks: [
          p("Replies are one of the best ways for a small account to be seen, but automated replies are spammy and risky. A good tool helps you find the right posts and leaves the replying to you. GrowX **Reply targets** collects fresh posts from your sources, VIPs and anyone you add, ranked by freshness and how fast they take off, and nothing is sent until you press the button."),
        ],
      },
      {
        id: "privacy",
        heading: "6. What does it do with your login and data?",
        blocks: [
          ul(
            "Does it ask for your X password? GrowX does not: it works inside your own signed-in x.com session and does not use X OAuth.",
            "Where are your lists, history and analytics stored? In GrowX they stay in your browser's storage. Optional Chrome sync uses Chrome's own sync storage, not a GrowX server, and the optional anonymous usage counts contain no X data and can be switched off.",
            "Where does AI text go? GrowX AI runs on your computer, so drafts are not sent to GrowX.",
          ),
          p("See the [privacy policy](/privacy) for the website's data handling."),
        ],
      },
      {
        id: "price",
        heading: "7. Can you try it without paying?",
        blocks: [
          p("GrowX has a free plan for daily use: Safe and Balanced paces, core filters, the scheduler with up to 10 queued posts, analytics for your latest 30 posts, 7 days of follower history and cleanup of up to 200 accounts per run. Every account can start a 30-day Premium trial with no credit card."),
          p("Premium adds the Turbo and X Premium paces, advanced filters, list import, the smart score, more source types, auto-replace for weak sources, unlimited scheduling, evergreen recycling, auto-plug, GrowX AI, full analytics and follower history, VIP alerts, a workspace per X account, bulk unfollow of up to 5,000, a Balanced unfollow pace and automatic cleanup. Plans are prepaid with no automatic renewal. See [pricing](/pricing)."),
        ],
      },
      {
        id: "limits",
        heading: "8. Honest limits",
        blocks: [
          ul(
            "GrowX is a **Chrome extension** for desktop Chrome (version 116 or later); it is not a mobile app.",
            "It works while Chrome is running and you are signed in to X. A scheduled post that is more than 6 hours late because your computer was off is not posted by itself; it waits as \"missed\".",
            "GrowX AI needs a recent desktop Chrome with enough memory and disk space. Without it, the AI buttons fall back to templates and the plain thread splitter.",
            "It helps you write, but it does not replace having something worth saying.",
            "Results vary by niche and account, and X's rules can change.",
          ),
        ],
      },
      {
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
      {
        id: "summary",
        heading: "Quick summary of what GrowX offers",
        blocks: [
          ul(
            "A Chrome extension that works in your own signed-in X session, organised into Home, Grow, Create, Engage, Insights, Cleanup and Settings.",
            "**Grow**: smart auto follow with source profiles, recent followers first, filters, a follow-back score from 1 to 99 and four pacing presets (Safe, Balanced, Turbo, X Premium pace).",
            "**Create**: posts and threads, a scheduler with queue slots, a best-time heat map, 52 templates and, on Premium, GrowX AI.",
            "**Engage**: Reply targets and a People list with tags, notes and VIPs.",
            "**Insights**: post analytics, a follower and unfollower tracker, top fans, goals, streaks and milestones.",
            "**Cleanup**: a scan for inactive and not-following-back accounts, with paced unfollowing.",
            "A free plan, a 30-day Premium trial without a credit card and prepaid Premium plans.",
          ),
          p("If that matches what you need, the quickest way to know is to try it on the free plan. If it does not, the checklist above will help you evaluate the next tool the same way."),
        ],
      },
      {
        id: "try",
        heading: "Judge GrowX yourself",
        blocks: [p(TRY)],
      },
    ],
    faq: [
      qa("Is GrowX free?", "Yes. The free plan includes the Safe and Balanced paces, core filters, the scheduler with up to 10 queued posts, analytics for your latest 30 posts, 7 days of follower history and cleanup of up to 200 per run. You can try every Premium feature free for 30 days without a credit card."),
      qa("Does GrowX need my X password?", "No. It works in your own signed-in x.com session and does not use X OAuth or store your X login."),
      qa("Does GrowX work on mobile?", "No. It is an extension for desktop Chrome (version 116 or later) on Windows, macOS, Linux and ChromeOS."),
      qa("How is GrowX different from a simple auto follow script?", "A script only follows. GrowX is a full X growth tool: its smart auto follow chooses who to follow with sources, filters and a follow-back score and follows at a human pace with caps and stops, and it also includes a post scheduler, an on-device AI writer (Premium), post analytics, an unfollower tracker, Reply targets and cleanup tools."),
      qa("Does the AI writer send my drafts to a server?", "No. GrowX AI (Premium) runs on your computer using the AI model built into Chrome, with no API key and nothing sent to GrowX. If your Chrome cannot run the model, the AI buttons fall back to templates and the plain thread splitter."),
    ],
  },
];
