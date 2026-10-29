import type { Block, Post } from "./posts";

/**
 * Strategy guides: the X algorithm, going viral, posting frequency, tweet ideas and hashtags.
 * Same rules as posts.ts: every product claim matches docs/PRODUCT_FACTS.md (extension v2.4.4); no invented
 * statistics, studies, testimonials, ranking weights or result promises.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-30";

export const strategyPosts: Post[] = [
  {
    slug: "twitter-algorithm-explained",
    seoTitle: "Twitter Algorithm Explained: How the X Algorithm Works",
    title: "The Twitter Algorithm Explained: How the X For You Feed Ranks Posts in 2026",
    description:
      "The Twitter algorithm in 2026: what is publicly known about how X ranks posts, what is not, and the habits that help, plus where GrowX fits in.",
    excerpt:
      "What is actually known about how X ranks posts in the For you feed, what is guesswork, and the practical habits that give your posts a fair chance.",
    category: "Guides",
    keywords: [
      "Twitter algorithm",
      "how the X algorithm works",
      "X algorithm 2026",
      "Twitter algorithm explained",
      "For you feed",
      "X ranking signals",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["how-to-increase-twitter-engagement", "twitter-reply-strategy", "best-time-to-post-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "What people mean by \"the Twitter algorithm\"",
        blocks: [
          p("When people talk about **the Twitter algorithm**, they usually mean the system that decides which posts appear in the **For you** feed on X, and in what order. It is not one formula. It is a set of systems that collect candidate posts, predict how likely you are to engage with each one, filter out what you should not see, and blend the result into a feed. The details change often, and X does not publish all of them."),
          p("This guide sticks to what is publicly known, avoids made-up numbers and turns it into habits you can act on this week, with notes on where **GrowX**, a Chrome extension for X (Twitter), can help. If someone quotes you an exact multiplier for a like or a reply, be sceptical: X has not published its current weights, and any precise figure you see online is at best a snapshot of an older version."),
        ],
      },
      {
        id: "two-feeds",
        heading: "For you and Following: two different feeds",
        blocks: [
          p("X has two main timelines, and they work differently:"),
          ul(
            "**For you** is the recommended feed. It mixes posts from accounts you follow with posts from accounts you do not follow, chosen because the system predicts you will find them interesting. This is the feed people mean when they talk about the X algorithm.",
            "**Following** shows posts from the accounts you follow. It is much closer to a plain timeline, although X has changed how it can be sorted over the years, so check what your app currently offers.",
          ),
          p("For growth, the For you feed is where new readers come from. Your followers can see you in Following, but people who have never heard of you mostly find you when the system recommends your post to them, or when someone they follow reposts or replies to you."),
        ],
      },
      {
        id: "what-is-public",
        heading: "What X has published about its recommendation system",
        blocks: [
          p("In 2023, X (then still called Twitter) published parts of its recommendation code, together with a write-up of how the For you feed is built. At a high level, the pipeline it described has three stages:"),
          ol(
            "**Candidate sourcing.** Gather a large pool of recent posts that might interest you, both from accounts you follow and from accounts you do not, based on things like who you interact with and which topics and communities you engage with.",
            "**Ranking.** A machine learning model scores each candidate by predicting how likely you are to engage with it in different ways, such as liking, replying, reposting or spending time on it.",
            "**Filtering and mixing.** Remove posts from accounts you blocked or muted and content that breaks the rules, keep the feed varied so one author does not dominate, and blend in other items such as ads and suggestions.",
          ),
          p("Two caveats matter. First, not everything was published, and what was published was a snapshot: X has changed the system since and keeps adjusting it. Second, code shows how signals are combined, not what the live model has learned from data. So the useful lessons are about the general shape of the system, not specific numbers."),
        ],
      },
      {
        id: "signals",
        heading: "What ranking generally rewards",
        blocks: [
          p("Putting the public material together with how recommendation systems usually work, a few principles hold up well. None of them comes with a published weight, and X can change any of them:"),
          ul(
            "**Engagement from interested people.** Replies, reposts, likes, bookmarks and time spent reading all suggest a post was worth showing. Engagement from people likely to care about the topic matters more than random attention, because the system is trying to predict what each reader will value.",
            "**Conversation.** Replies, especially when the author answers back, show that a post started a real discussion rather than collecting a passive tap.",
            "**Relevance.** Posts tend to reach people who already engage with similar topics and accounts. A clear niche makes it easier for the system to find your readers.",
            "**Recency.** The For you feed favours fresh posts, so the first hours after posting are when a post has its best chance to be picked up.",
            "**Good standing.** Accounts that follow X's rules, look authentic and are not flagged for spam tend to do better. X's enforcement approach, which it describes as \"freedom of speech, not freedom of reach\", can limit the visibility of posts that break certain rules.",
          ),
        ],
      },
      {
        id: "negative",
        heading: "What hurts: negative feedback and spammy patterns",
        blocks: [
          p("The flip side of engagement is negative feedback. When people mute or block you, mark a post as not interesting, report it or unfollow you after seeing it, that tells the system your content was not welcome. X has not published how much each signal counts, but it is safe to assume a pattern of negative feedback works against you."),
          p("Behaviour that looks automated or manipulative is risky too, both for reach and for your account. X's rules on platform manipulation and spam cover patterns like these:"),
          ul(
            "Following and unfollowing large numbers of accounts in bursts.",
            "Posting the same or nearly the same text again and again, or sending identical replies.",
            "Stuffing posts with unrelated or trending hashtags to borrow attention.",
            "Buying engagement or joining groups that trade likes and reposts.",
          ),
          p("You do not need to know the exact cost of each one to avoid them. These are the patterns spam filters exist to catch."),
        ],
      },
      {
        id: "myths",
        heading: "Common myths about the X algorithm",
        blocks: [
          ul(
            "**\"There is a perfect posting hour.\"** Timing helps, but only relative to when your audience is online. See [the best time to post on Twitter](/blog/best-time-to-post-on-twitter) for how to find yours.",
            "**\"Hashtags boost reach.\"** One or two relevant tags can help people find a post about an event or community. Piling them on mostly makes a post harder to read.",
            "**\"Every dip means a shadowban.\"** Reach rises and falls with topics, timing and whatever else is happening on X. Look at several weeks of data before concluding something is wrong.",
            "**\"Links get zero reach.\"** Many creators believe posts with external links reach fewer people, but there is no published rule you can rely on. If it matters to you, test a link in the post against a link in a reply on your own account.",
          ),
        ],
      },
      {
        id: "habits",
        heading: "Practical habits that work with the algorithm",
        blocks: [
          p("You cannot control the ranking model, but you can control what you give it. These habits follow from everything above:"),
          ol(
            "**Post consistently at your best times.** A steady rhythm gives the system regular, fresh posts to test, and posting while your followers are awake gives each post a fair first hour.",
            "**Write for replies.** Ask specific questions, take a clear position or share something people want to add to. A post that invites a thoughtful answer starts the kind of conversation ranking rewards.",
            "**Answer the replies you get**, especially in the first stretch after posting, to keep the conversation going.",
            "**Reply to others early.** A useful reply on a fresh post in your niche puts you in front of an audience that already cares about your topic. Our [Twitter reply strategy](/blog/twitter-reply-strategy) guide covers how to do it well.",
            "**Avoid anything that looks like spam:** no mass follow or unfollow bursts, no repeated posts, no hashtag stuffing, no bought engagement.",
            "**Measure your own results** and keep what works for your audience rather than what a viral thread about the algorithm promised.",
          ),
        ],
      },
      {
        id: "measure",
        heading: "Measure instead of guessing",
        blocks: [
          p("Because the details are not public, your own data is the most reliable guide you have. Track a few numbers for each post: views, replies, reposts, likes, bookmarks and the **engagement rate**, which is engagements divided by views. Engagement rate adjusts for reach, so you can fairly compare a post seen by a few hundred people with one seen by thousands. The free [engagement rate calculator](/tools/twitter-engagement-rate-calculator) does the arithmetic."),
          p("Look for patterns over weeks, not single posts. If questions keep earning more replies than links, or evening posts keep beating morning ones, that is a signal worth acting on. One viral post is a nice surprise, not a strategy."),
        ],
      },
      {
        id: "growx",
        heading: "Where GrowX helps",
        blocks: [
          p("GrowX does not change how X ranks posts, and no tool can. What it does is make the habits above easier to keep:"),
          ul(
            "**Scheduler and best time to post.** The [post scheduler](/features/twitter-post-scheduler) has queue slots and a week by 24-hour heat map built from your own posts' engagement and from when your followers are active.",
            "**Reply targets.** The [reply targets](/features/twitter-reply-targets) view collects fresh posts (younger than 120 minutes by default) from your sources, VIPs and anyone you add, ranked by freshness and how fast they are taking off. GrowX never replies or likes by itself; you write the reply and press the button.",
            "**Analytics.** Post analytics show views, likes, reposts, replies, bookmarks and engagement rate for your recent posts (your latest 30 on the free plan), and **What works** compares topics and formats.",
            "**Safe pacing.** Auto follow uses random delays, breaks and hourly and daily caps, and posting has a daily cap (20 by default) and a 5-minute minimum gap. Both slow down or pause when X shows a warning.",
          ),
          note("No tool can promise zero risk on X. GrowX is designed to respect the limits X signals, but you remain responsible for following X's rules."),
        ],
      },
      {
        id: "try",
        heading: "Put it into practice",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "Is the Twitter algorithm open source?",
        a: "Partly. In 2023 X published parts of its recommendation code and a description of how the For you feed is built, but not everything, and the live system has changed since, so treat the public code as a snapshot.",
      },
      {
        q: "What does the X algorithm value most?",
        a: "X does not publish its current weights. In general, ranking favours posts that earn replies, reposts, likes, bookmarks and time spent from people likely to be interested, while mutes, blocks, reports and similar negative feedback work against a post.",
      },
      {
        q: "Does the Following feed on X use the algorithm?",
        a: "The Following tab shows posts from accounts you follow and is much closer to a plain timeline, while For you is the recommended feed. X has changed the sorting options over time, so check what your app offers.",
      },
      {
        q: "How can I tell if my reach is limited on X?",
        a: "Reach naturally rises and falls, so compare several weeks of views and engagement rate before drawing conclusions. If a drop is sudden and lasting, check your account for notices and review X's rules.",
      },
      {
        q: "Can a tool beat the X algorithm?",
        a: "No tool can change how X ranks posts. GrowX helps with the habits that matter, such as posting at your best times, replying early to fresh posts and measuring results, while pacing its actions to respect the limits X signals.",
      },
    ],
  },
  {
    slug: "how-to-go-viral-on-twitter",
    seoTitle: "How to Go Viral on Twitter (X): What Actually Helps",
    title: "How to Go Viral on Twitter (X): Raise Your Odds Without Chasing Tricks",
    description:
      "How to go viral on Twitter (X): hooks, formats, timing and early replies that raise your odds, and how GrowX helps you capture followers when a post takes off.",
    excerpt:
      "Nobody can force a post to go viral on X. Here is how to raise your odds with better hooks, formats and timing, and how to be ready when one takes off.",
    category: "Guides",
    keywords: [
      "how to go viral on Twitter",
      "viral tweets",
      "how to get more views on X",
      "go viral on X",
      "tweet hooks",
      "Twitter growth tips",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-write-a-twitter-thread", "how-to-increase-twitter-engagement", "twitter-algorithm-explained"],
    sections: [
      {
        id: "intro",
        heading: "Can you make a tweet go viral?",
        blocks: [
          p("Search **how to go viral on Twitter** and you will find plenty of people selling a formula. Here is the honest version: nobody can guarantee or force a viral post on X, not you, not a course and not a tool. Whether a post takes off depends on timing, luck, what else is happening that day and whether the right people happen to see it early."),
          p("What you can do is raise your odds. Accounts that seem to go viral regularly are usually doing a few unglamorous things well: strong first lines, formats people like to share, posting when their audience is awake, replying fast and reusing ideas that already worked. This guide covers each of them, plus how to make sure a post that does take off actually brings you followers."),
        ],
      },
      {
        id: "what-viral-means",
        heading: "What \"viral\" means on X",
        blocks: [
          p("There is no official threshold. For an account with a few hundred followers, a post that reaches a few thousand people is a breakout; for a large account it is an ordinary day. A more useful definition: a post went viral for you when it reached far beyond your usual audience."),
          p("On X, that extra reach mostly comes from three places: the **For you** feed recommending your post to people who do not follow you, **reposts and quote posts** carrying it into new timelines, and **replies** that put it in front of other people's audiences. All three depend on people engaging soon after the post goes out, which is why the rest of this guide focuses on the first line and the first hour. For the bigger picture, see [the Twitter algorithm explained](/blog/twitter-algorithm-explained)."),
        ],
      },
      {
        id: "hooks",
        heading: "Write a first line that stops the scroll",
        blocks: [
          p("Most people decide in a second whether to keep reading. Your first line is the whole pitch. Hook patterns that work across many niches, with {placeholders} for your own details:"),
          ul(
            "**A specific result:** \"I rewrote my landing page headline {number} times. The version that finally worked broke every rule I had.\"",
            "**A surprising source:** \"The best career advice I ever got came from {unexpected person}, not my manager.\"",
            "**A list promise:** \"{number} free tools I use every day to {result}:\"",
            "**A clear opinion:** \"Unpopular opinion: {common practice} is overrated. Here is what I do instead.\"",
            "**A story opener:** \"{time} ago I {made a mistake}. This is what it taught me.\"",
          ),
          p("Keep it concrete and keep the promise you make. Hooks that overpromise earn a click once and cost you trust after. If you are stuck, write the post first and the hook last."),
        ],
      },
      {
        id: "formats",
        heading: "Formats that tend to travel",
        blocks: [
          p("Some formats are simply easier to share. Rotate through these and watch which ones your audience responds to:"),
          ul(
            "**Threads** for step-by-step guides and breakdowns. Each part can be reposted on its own, and a strong first post pulls readers through the rest. The free [Twitter thread maker](/tools/twitter-thread-maker) splits a long draft into numbered posts.",
            "**Lists** of tools, mistakes, books or lessons. They are easy to skim and easy to bookmark.",
            "**Opinions** with a clear position. People reply to agree, disagree or add nuance, and replies are what keep a post moving.",
            "**Stories** with a beginning, a turn and a lesson. Personal experience is hard to copy and easy to relate to.",
            "**Images:** a screenshot, a chart you made, a before and after or a simple diagram. A good image makes a post stand out in a busy feed.",
            "**One-liners** that say what people wish they had said. These get quoted and reposted.",
          ),
          p("Whatever the format, check the length before you post. X counts every link as 23 characters and most emoji as 2, and the free [tweet character counter](/tools/tweet-character-counter) uses the same rules."),
        ],
      },
      {
        id: "timing",
        heading: "Timing and the first hour",
        blocks: [
          p("Early engagement matters because the For you feed favours fresh posts that people are responding to. Give every post a fair start:"),
          ol(
            "**Post when your audience is online**, not when a generic chart says. Our guide to [the best time to post on Twitter](/blog/best-time-to-post-on-twitter) shows how to find your own hours.",
            "**Stay around after posting.** Plan to be available for the first stretch after a post goes out, rather than publishing it and disappearing.",
            "**Reply to early replies within minutes.** Thoughtful answers turn a single comment into a conversation, and conversations keep a post in front of people.",
            "**Do not delete and repost** a post that started slowly. Repeating the same text looks like spam; rewrite the idea with a new angle on another day instead.",
          ),
        ],
      },
      {
        id: "replies",
        heading: "Replies: the overlooked route to going viral",
        blocks: [
          p("Your own posts are not the only way to get seen. A sharp, useful reply on a fresh post from a bigger account in your niche can reach more people than anything on your profile, because it appears in front of that account's audience while the post is still climbing."),
          p("The key word is fresh. A reply posted in the first minutes sits near the top of the conversation; one posted hours later is easily buried. GrowX's [reply targets](/features/twitter-reply-targets) collect fresh posts from your sources, VIPs and anyone you add, ranked by freshness and how fast they are taking off, so you can spot them early. You still write every reply yourself, and nothing is sent until you press the button."),
        ],
      },
      {
        id: "repurpose",
        heading: "Repurpose what already worked",
        blocks: [
          p("Your best posts are your best research. When something does well, it is evidence that the idea resonates with your audience, so get more out of it:"),
          ul(
            "Turn a popular single post into a thread that goes deeper.",
            "Turn a popular thread into a short post with its single strongest point.",
            "Revisit the same idea a few weeks later with a new example, a new format or an updated opinion.",
            "Look at your analytics for patterns, not just winners: which topics and formats keep earning replies.",
          ),
          p("**Evergreen recycling** (GrowX Premium) automates the last step: your best posts go out again every so many days, 30 by default, with rotating variants, or are reposted, so good ideas keep reaching people who missed them the first time."),
        ],
      },
      {
        id: "ready",
        heading: "Be ready when a post takes off",
        blocks: [
          p("A viral post that brings no followers is a missed chance. Get your profile ready before it happens:"),
          ul(
            "A clear bio that says what you post about and who it is for.",
            "A pinned post that shows your best work.",
            "A follow-up plan: a reply to your own post with a related thread, resource or call to action while attention is high.",
          ),
          p("**Auto-plug** (GrowX Premium) handles that follow-up for you. Once a post takes off (50 likes by default), GrowX replies to it with your call to action, such as your newsletter or a product, so you capture the extra attention without watching your notifications all day."),
        ],
      },
      {
        id: "avoid",
        heading: "What not to do",
        blocks: [
          ul(
            "**Engagement bait** such as \"like if you agree, repost if you don't\". It reads as spammy and attracts low-quality attention.",
            "**Rage bait.** Provoking anger can bring views, but it also brings mutes, blocks and reports, which work against you, and it builds an audience you probably do not want.",
            "**Buying likes or reposts, or joining engagement pods.** It goes against X's rules on platform manipulation and brings no real readers.",
            "**Misleading claims or made-up numbers.** If a post goes viral for being wrong, everyone will tell you.",
            "**Hashtag stuffing.** One or two relevant tags at most.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Give your next post a better chance",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including evergreen recycling and auto-plug, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "Can you guarantee a tweet will go viral?",
        a: "No. Nobody can guarantee or force a viral post on X. You can raise your odds with strong hooks, shareable formats, good timing and fast replies.",
      },
      {
        q: "How many views does a tweet need to count as viral?",
        a: "There is no official number. A useful definition is a post that reaches far beyond your usual audience, which means something different for a small account than for a large one.",
      },
      {
        q: "How do I get more views on X?",
        a: "Post consistently when your audience is online, write first lines that make people stop, reply early to fresh posts in your niche and answer the replies you get. Then use your analytics to repeat the topics and formats that work.",
      },
      {
        q: "Should I delete a tweet that is not doing well and post it again?",
        a: "Usually not. Repeating the same text can look like spam, so rewrite the idea with a new angle and post it on another day.",
      },
      {
        q: "What should I do when my tweet goes viral?",
        a: "Answer the replies, add a follow-up reply with a related thread or call to action, and make sure your bio and pinned post tell new visitors why they should follow you.",
      },
    ],
  },
  {
    slug: "how-often-to-post-on-twitter",
    seoTitle: "How Often to Post on Twitter (X): Find Your Frequency",
    title: "How Often Should You Post on Twitter (X)? Frequency, Consistency and a Weekly Routine",
    description:
      "How often to post on Twitter (X): the trade-offs of more tweets per day, why consistency beats volume, a weekly routine and how GrowX queue slots help.",
    excerpt:
      "There is no magic number of tweets per day. Here are the trade-offs, a routine you can keep and how to tell whether you are posting too much or too little.",
    category: "Create",
    keywords: [
      "how often to post on Twitter",
      "how many tweets per day",
      "posting frequency on X",
      "how often to tweet",
      "Twitter posting schedule",
      "X content routine",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-schedule-tweets", "best-time-to-post-on-twitter", "tweet-ideas"],
    sections: [
      {
        id: "intro",
        heading: "Is there a right number of tweets per day?",
        blocks: [
          p("Ask ten people **how often to post on Twitter** and you will get ten numbers, from once a day to dozens of times. Most of those numbers describe what worked for one account, in one niche, at one point in time. There is no frequency that is right for everyone on X, and nobody outside X knows exactly how the feed treats posting volume."),
          p("What you can do is understand the trade-offs, pick a level you can sustain and adjust it based on your own results. This guide walks through that, ends with a realistic weekly routine, and shows how **GrowX**, a Chrome extension for X (Twitter), helps you keep the rhythm without living in the app."),
        ],
      },
      {
        id: "trade-offs",
        heading: "The trade-offs of posting more or less",
        blocks: [
          p("Posting frequency is a balance between reach, quality and your time:"),
          ul(
            "**More posts** give you more chances to be seen, more writing practice and faster feedback on what works. The cost: quality tends to slip when you force it, your followers may see more of you than they want, and some will mute or unfollow.",
            "**Fewer posts** let you put more care into each one. The cost: slower learning, fewer chances for a post to catch on, and an account that is easy to forget.",
            "**Bursts** of many posts in a short window are the worst of both. They crowd your followers' feeds and can look automated, so spread posts across the day instead.",
          ),
          p("The goal is the highest frequency at which your posts are still worth reading. For many people that is lower than online advice suggests, and it rises naturally as you get faster at writing."),
        ],
      },
      {
        id: "consistency",
        heading: "Consistency beats volume",
        blocks: [
          p("A steady rhythm usually does more for an account than occasional bursts of activity. Regular readers learn when to expect you, your profile always shows recent posts to new visitors, and your results become comparable from week to week, which is what makes improvement possible."),
          p("Consistency also protects you from the most common failure: posting ten times on Monday, burning out and disappearing for two weeks. If you can sustain three good posts a week, three posts every week will serve you better than a spike followed by silence."),
        ],
      },
      {
        id: "levels",
        heading: "Three starting levels to choose from",
        blocks: [
          p("These are not benchmarks, just sensible starting points. Pick the one that matches the time you have today, and move up only when it feels easy:"),
          ul(
            "**Light:** a few posts a week, plus 10 to 15 minutes of replies on most days. Good for busy people, new accounts and anyone testing whether X is worth their time.",
            "**Steady:** one or two posts a day, daily replies and a thread now and then. A realistic level for people building an audience alongside a job or a business.",
            "**Heavy:** several posts a day spread across your active hours, a weekly thread and an active reply habit. Works for people who write quickly and have plenty to say, as long as quality holds.",
          ),
          note("Whatever level you choose, keep the same rhythm for a few weeks before judging it. Changing frequency every few days makes your results impossible to read."),
        ],
      },
      {
        id: "replies",
        heading: "Replies count too",
        blocks: [
          p("Posting frequency is not only about your own posts. Replies are part of how people find you on X, especially while your account is small: a useful reply on a fresh post in your niche puts your name in front of an audience that already cares about the topic."),
          p("Treat replies as part of your posting budget. On a busy day, five thoughtful replies can do more for your account than one more original post. Our [Twitter reply strategy](/blog/twitter-reply-strategy) guide explains how to choose which conversations to join."),
        ],
      },
      {
        id: "routine",
        heading: "A realistic weekly routine",
        blocks: [
          ol(
            "**Monday, about an hour: batch writing.** Draft one post per queue slot you plan to fill this week, plus one thread. Leave a few slots open for live reactions.",
            "**Every day, 15 minutes: replies.** Reply to fresh posts in your niche and answer everyone who replied to you.",
            "**Midweek: one live post.** React to something happening in your niche that day. Scheduled posts keep you consistent; live posts make you part of the conversation.",
            "**Friday, 20 minutes: review.** Check which posts earned the best engagement rate, which times worked and what people replied to. Pick one thing to change next week.",
            "**Weekend: optional.** Post if your audience is around then; otherwise let the queue run and rest.",
          ),
          p("Batching is what makes a higher frequency sustainable: writing ten posts in one focused hour is far easier than starting from scratch ten separate times. See [how to schedule tweets](/blog/how-to-schedule-tweets) for the scheduling side."),
        ],
      },
      {
        id: "queue",
        heading: "Queue slots keep the rhythm for you",
        blocks: [
          p("A queue turns a frequency into a schedule. In GrowX's [post scheduler](/features/twitter-post-scheduler), you set slots once, and **Add to queue** drops each new post into the next open one. The default slots are 09:00, 13:00 and 18:30, every day. Adjust them to the level you chose: remove slots for a lighter rhythm, add slots for a heavier one."),
          p("To place the slots, use the **best time to post** heat map, built from your own posts' engagement and when your followers are active. We explain how to read it in [the best time to post on Twitter](/blog/best-time-to-post-on-twitter)."),
          ul(
            "**Free plan:** up to 10 posts or threads can wait in the queue at once, which covers several days of steady posting.",
            "**Premium:** unlimited scheduling, so you can fill weeks ahead.",
            "**Your computer must be on:** GrowX posts through your signed-in x.com tab in Chrome. A post that ends up more than 6 hours late is never posted by itself; it waits as \"missed\" so you can decide what to do with it.",
          ),
        ],
      },
      {
        id: "safety",
        heading: "Posting safety: caps and gaps",
        blocks: [
          p("A full queue should never turn into a burst. GrowX applies posting safety rules to every scheduled post:"),
          ul(
            "A **daily cap** of 20 posts by default.",
            "A **minimum gap** of 5 minutes between posts.",
            "An automatic **pause** if X shows any warning.",
          ),
          p("Those are limits, not targets. Very few accounts need anywhere near 20 posts a day, and spacing posts across your active hours gives each one room to find its readers."),
        ],
      },
      {
        id: "goals",
        heading: "Track the habit with goals and streaks",
        blocks: [
          p("Frequency is a habit, and habits stick better when you can see them. GrowX's **Insights** area includes **daily goals** for posts, replies and new followers, **streaks and milestones**, and a monthly goal planner. Set goals at the level you chose, not the level you wish you had time for, and let the streak do the motivating."),
        ],
      },
      {
        id: "adjust",
        heading: "Signs you are posting too much or too little",
        blocks: [
          ul(
            "**Engagement rate per post falls as you post more:** you may be spreading attention too thin. Check it with the free [engagement rate calculator](/tools/twitter-engagement-rate-calculator) or your post analytics.",
            "**Unfollows rise after busy days:** a follower tracker will show it. Cut volume or spread posts out.",
            "**Most posts do well, but growth is slow:** you probably have room to post more often.",
            "**You dread opening the composer:** the frequency is too high for your current routine. Drop a level and rebuild.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Set up your posting rhythm",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including unlimited scheduling, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "How many tweets per day should I post?",
        a: "There is no number that suits every account. Start with a level you can keep for weeks, such as a few posts a week or one or two a day plus daily replies, and adjust based on your engagement rate.",
      },
      {
        q: "Is posting too much on Twitter bad?",
        a: "It can be. If quality drops, followers may mute or unfollow you, and many posts in a short window can look automated, so spread posts out and keep each one worth reading.",
      },
      {
        q: "Do replies count toward how often I post on X?",
        a: "They count toward your presence. Replies on fresh posts in your niche are one of the main ways small accounts get found, so treat them as part of your posting routine.",
      },
      {
        q: "How many posts can I schedule with GrowX for free?",
        a: "On the free plan, up to 10 posts or threads can wait in the queue at once. Premium removes that limit.",
      },
      {
        q: "How long should I test a posting frequency?",
        a: "Keep the same rhythm for at least a few weeks before judging it, and compare engagement rate rather than raw likes.",
      },
    ],
  },
  {
    slug: "tweet-ideas",
    seoTitle: "60 Tweet Ideas: What to Tweet When You Are Stuck",
    title: "60 Tweet Ideas and Fill-In Templates for When You Don't Know What to Tweet",
    description:
      "60 tweet ideas with fill-in templates: hooks, lessons, lists, stories, opinions and threads for X (Twitter), plus how GrowX templates and AI help you write.",
    excerpt:
      "Sixty tweet ideas grouped by type, each with a short fill-in template, so you never open the composer on X with nothing to say.",
    category: "Create",
    keywords: [
      "tweet ideas",
      "what to tweet",
      "Twitter content ideas",
      "tweet templates",
      "X post ideas",
      "things to tweet about",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-write-a-twitter-thread", "ai-tweet-writer-growx-ai", "how-often-to-post-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "Never open a blank composer again",
        blocks: [
          p("Every account on X hits the same wall sooner or later: you open the composer and have nothing to say. The fix is not inspiration, it is a list. Below are **60 tweet ideas** grouped by type, each with a short fill-in template. Replace the {placeholders} with your own details and you have a first draft."),
          p("Use them as starting points, not copy-paste posts. The template gives you a shape; your experience, numbers and opinions make it worth reading. At the end you will find how to turn the list into a week of posts, and where **GrowX**, a Chrome extension for X (Twitter), helps with templates, AI and scheduling."),
        ],
      },
      {
        id: "hooks",
        heading: "Hook-first posts",
        blocks: [
          p("Hooks are opening lines that make people stop. Each works as a standalone post or as the first post of a thread."),
          ul(
            "**The result plus the method:** \"I {achieved result} in {time}. Here is exactly how:\"",
            "**The costly mistake:** \"I wasted {time or money} on {thing}. Do this instead:\"",
            "**The contrarian take:** \"Everyone says {common advice}. I disagree, and here is why.\"",
            "**The before and after:** \"A year ago I {old situation}. Today I {new situation}. What changed:\"",
            "**The shortcut:** \"The fastest way to {goal} is not {obvious method}. It is {your method}.\"",
            "**The confession:** \"I used to think {belief}. I was wrong.\"",
            "**The specific promise:** \"{number} ways to {result} without {pain point}:\"",
          ),
        ],
      },
      {
        id: "lessons",
        heading: "Lessons and takeaways",
        blocks: [
          p("Lessons are the easiest posts to write because you already have them. Anything you learned the hard way is content."),
          ul(
            "**One lesson:** \"The most useful thing I learned about {topic} this year: {lesson}.\"",
            "**Advice to your younger self:** \"If I were starting {activity} again, I would {advice}.\"",
            "**What a failure taught you:** \"{project} failed. It taught me {lesson 1}, {lesson 2} and {lesson 3}.\"",
            "**A rule you follow:** \"My rule for {situation}: {rule}. It has saved me from {problem} more than once.\"",
            "**Borrowed wisdom:** \"The best advice I got from {person or role}: {advice}.\"",
            "**The unexpected teacher:** \"{hobby} taught me more about {topic} than any course.\"",
            "**A habit:** \"One habit that changed how I {activity}: {habit}.\"",
          ),
        ],
      },
      {
        id: "lists",
        heading: "Lists",
        blocks: [
          p("Lists are easy to skim, easy to bookmark and easy to write in a spare ten minutes."),
          ul(
            "**Tools:** \"{number} tools I use every week for {task}: {tool 1}, {tool 2}, {tool 3}.\"",
            "**Beginner mistakes:** \"{number} mistakes I see beginners make with {topic}:\"",
            "**Books:** \"{number} books that changed how I think about {topic}:\"",
            "**Do and don't:** \"Do: {good practice}. Don't: {bad practice}.\"",
            "**Checklist:** \"Before you {action}, check {item 1}, {item 2} and {item 3}.\"",
            "**Signs:** \"{number} signs you are ready to {next step}:\"",
            "**Underrated picks:** \"Underrated {category} in {niche}: {item 1}, {item 2}, {item 3}.\"",
          ),
        ],
      },
      {
        id: "stories",
        heading: "Stories",
        blocks: [
          p("Stories are hard to copy, which is exactly why they work. Keep them short: a setup, a turn and a takeaway."),
          ul(
            "**The turning point:** \"The moment I decided to {decision} was {moment}.\"",
            "**The small win:** \"Small win today: {win}. It took {time} to get here.\"",
            "**The awkward moment:** \"I once {embarrassing moment} in front of {audience}. Here is what I learned.\"",
            "**The question you got:** \"Someone asked me {question} this week. My answer: {answer}.\"",
            "**The origin story:** \"I started {project} because {reason}. Here is what happened next.\"",
            "**The near miss:** \"I almost {quit or made a mistake}. What stopped me: {reason}.\"",
            "**Then and now:** \"My first {thing} next to my latest one. What changed: {difference}.\" (pair it with an image)",
          ),
        ],
      },
      {
        id: "opinions",
        heading: "Opinions and hot takes",
        blocks: [
          p("A clear opinion invites replies. Be honest, be specific and be ready to discuss it."),
          ul(
            "**Unpopular opinion:** \"Unpopular opinion: {opinion}.\"",
            "**Overrated and underrated:** \"Overrated: {thing}. Underrated: {thing}.\"",
            "**Prediction:** \"Within {timeframe}, {prediction}. Here is my reasoning.\"",
            "**Changed my mind:** \"I changed my mind about {topic}. Here is what convinced me.\"",
            "**The hill you will die on:** \"Hill I will die on: {opinion}.\"",
            "**Myth-buster:** \"{common belief} is a myth. What actually happens: {reality}.\"",
            "**Defend the boring choice:** \"{boring option} beats {trendy option} for most people. Here is why.\"",
          ),
        ],
      },
      {
        id: "questions",
        heading: "Questions",
        blocks: [
          p("Questions are the simplest way to start a conversation. Ask things your audience can answer in one line and wants to answer."),
          ul(
            "**Recommendation:** \"What is the best {tool or resource} for {task}? Looking for something {criteria}.\"",
            "**This or that:** \"{option A} or {option B} for {situation}? Tell me why.\"",
            "**Fill in the blank:** \"The most underrated skill in {niche} is ____.\"",
            "**Hindsight:** \"What is one thing you wish you had known before {milestone}?\"",
            "**Advice request:** \"I am about to {action}. What should I know first?\"",
            "**Poll-style:** \"How do you {task}? A) {option} B) {option} C) something else.\"",
            "**Reflection:** \"What is one thing you stopped doing this year that made {area} better?\"",
          ),
        ],
      },
      {
        id: "behind-the-scenes",
        heading: "Behind the scenes",
        blocks: [
          p("People follow people. Showing the process, not just the result, builds trust and gives you endless material."),
          ul(
            "**Work in progress:** \"Working on {project} today. The hardest part so far: {challenge}.\"",
            "**Your setup:** \"My {workspace or tool stack} for {activity}:\" with a photo or screenshot.",
            "**Honest numbers:** \"{project} update: {real metric} this month. What worked: {thing}. What didn't: {thing}.\" Share real numbers only.",
            "**Your routine:** \"My {weekly or morning} routine as a {role}: {step 1}, {step 2}, {step 3}.\"",
            "**Draft and final:** \"First draft vs final version of {thing}. The biggest change: {change}.\"",
            "**A decision:** \"We decided to {decision}. Here is the reasoning:\"",
          ),
        ],
      },
      {
        id: "threads",
        heading: "Thread ideas",
        blocks: [
          p("Threads suit ideas that need room. Each of these starts with a hook post and continues with one point per post."),
          ul(
            "**Step by step:** \"How to {result}, step by step:\"",
            "**Breakdown:** \"I studied {number} {examples} in {niche}. Here is what the best ones have in common:\"",
            "**Case study:** \"How {person or company} {achieved result}, and what you can copy:\"",
            "**Review:** \"{timeframe} of {activity}. Everything I learned:\"",
            "**Beginner guide:** \"Everything I wish I knew when I started {topic}:\"",
            "**Myth list:** \"{number} myths about {topic}, and what is actually true:\"",
          ),
        ],
      },
      {
        id: "resources",
        heading: "Resources and curation",
        blocks: [
          p("Curation is useful content even when you did not make the thing yourself. Always credit the source."),
          ul(
            "**Weekly picks:** \"{number} things worth your time this week in {niche}:\"",
            "**Free resource:** \"A free {resource type} for {audience}: {what it is}. I use it for {use}.\"",
            "**Template share:** \"The {template type} I use for {task}. Copy it:\"",
            "**Glossary:** \"{number} {niche} terms explained in plain English:\"",
            "**Monthly best-of:** \"The best {posts or talks} I found on {topic} this month:\"",
            "**Starter pack:** \"Starter pack for {goal}: {item 1}, {item 2}, {item 3}.\"",
          ),
        ],
      },
      {
        id: "week",
        heading: "How to turn this list into a week of posts",
        blocks: [
          ol(
            "Pick one idea from five different groups. Variety shows you which formats your audience likes.",
            "Fill every {placeholder} with a real detail. If you have no real number or story for a template, skip it.",
            "Rewrite the template in your own words. The structure should be invisible by the time you post.",
            "Check each post against X's character rules with the free [tweet character counter](/tools/tweet-character-counter).",
            "Schedule them across the week and note which ideas earned replies, so you know which groups to use more.",
          ),
          p("If an idea needs more room, turn it into a thread. Our guide on [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread) covers hooks, structure and numbering."),
        ],
      },
      {
        id: "growx",
        heading: "Templates, AI and scheduling in GrowX",
        blocks: [
          p("GrowX keeps your ideas next to the tools that publish them, in the **Create** area of its dashboard:"),
          ul(
            "**52 built-in templates** for hooks, threads, lists, stories and more, plus your own templates for structures you reuse.",
            "**GrowX AI** (Premium) drafts a post from a topic, suggests alternative hooks, improves a draft and shapes long drafts into threads. It runs on your computer with the AI model built into Chrome, nothing is sent to GrowX, and it uses {placeholders} instead of inventing facts. See the [AI tweet writer](/features/ai-tweet-writer) page.",
            "**Drafts** for half-finished ideas, and a **calendar** to see the week at a glance.",
            "**Queue slots** in the [post scheduler](/features/twitter-post-scheduler): add a post and it goes out in the next free slot. The free plan keeps up to 10 posts waiting at once; Premium is unlimited.",
          ),
          p("If Chrome's built-in model is not available on your computer, the AI buttons fall back to templates. For more on writing with AI, read the [AI tweet writer guide](/blog/ai-tweet-writer-growx-ai)."),
        ],
      },
      {
        id: "try",
        heading: "Start writing your next post",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including GrowX AI, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "What should I tweet about as a beginner?",
        a: "Start with what you are learning, building or doing every day: lessons, small wins, questions and resources you found useful. Specific, honest posts about your own experience beat generic advice.",
      },
      {
        q: "How do I come up with tweet ideas every day?",
        a: "Keep a running list of things you learn, questions people ask you and mistakes you make, then batch-write once a week using templates like the ones above.",
      },
      {
        q: "Is it okay to use tweet templates?",
        a: "Yes, as long as you fill them with your own details and rewrite them in your own voice. A template gives you structure; the specifics make the post yours.",
      },
      {
        q: "Can AI give me tweet ideas?",
        a: "Yes. GrowX AI (Premium) can draft posts, suggest hooks and turn notes into threads on your own computer, using placeholders instead of inventing facts. Edit every draft before you post it.",
      },
      {
        q: "Which type of tweet gets the most engagement?",
        a: "It depends on your audience. Rotate formats such as questions, lists, stories and threads for a few weeks and compare engagement rate to see what works for you.",
      },
    ],
  },
  {
    slug: "twitter-hashtags-guide",
    seoTitle: "Twitter Hashtags: How to Use Hashtags on X the Right Way",
    title: "Twitter Hashtags Guide: How to Use Hashtags on X Without Looking Like Spam",
    description:
      "How to use Twitter hashtags on X: how many to add, when they help or hurt, how to find the best tags for your niche, and how GrowX uses them as sources.",
    excerpt:
      "Hashtags on X are a small tool, not a reach button. Here is how many to use, when they help, when they hurt and how to find the right ones for your niche.",
    category: "Guides",
    keywords: [
      "Twitter hashtags",
      "how to use hashtags on X",
      "best hashtags for Twitter",
      "X hashtags",
      "how many hashtags on Twitter",
      "hashtag strategy",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["twitter-follow-back-score-growx", "how-to-increase-twitter-engagement", "twitter-algorithm-explained"],
    sections: [
      {
        id: "intro",
        heading: "What hashtags actually do on X",
        blocks: [
          p("Hashtags were born on Twitter, and they still work the same basic way on X: a word or phrase after a # becomes a link to search results for that tag. Anyone who taps it or searches for it can find posts that use it. That is the whole mechanism. A hashtag does not push your post into more feeds by itself; it makes the post findable by people who are looking for that topic."),
          p("That small role is why the right approach to **Twitter hashtags** is restraint. This guide covers how many to use, when they help, when they hurt, how to find the best hashtags for your niche, and how **GrowX**, a Chrome extension for X (Twitter), can use hashtags to find people to follow."),
        ],
      },
      {
        id: "how-many",
        heading: "How many hashtags to use on X",
        blocks: [
          p("For most posts, **zero to two relevant hashtags** is the right range, and many good posts use none at all. X's own help pages have long advised against over-tagging a single post, and there are practical reasons too:"),
          ul(
            "**Readability.** Every tag is a word your reader has to skip. Three or four tags at the end of a short post can be longer than the point you are making.",
            "**Characters.** Each hashtag counts toward the 280-character limit of a standard post. The free [tweet character counter](/tools/tweet-character-counter) shows what you have left.",
            "**Signals.** A post crowded with tags looks like it is trying to borrow attention rather than earn it, to readers and spam filters alike.",
          ),
          p("A simple test: if you removed the hashtag, would someone searching that tag be glad to find your post? If yes, keep it. If you added it just in case, delete it."),
        ],
      },
      {
        id: "when-they-help",
        heading: "When hashtags help",
        blocks: [
          ul(
            "**Events and conferences.** Most events announce an official tag. Using it puts your post where attendees, and people following from home, are looking.",
            "**Live moments.** Sports, TV, product launches and breaking news often have tags that people follow in real time.",
            "**Communities with an established tag.** Some communities on X gather around a tag, for example #BuildInPublic for founders sharing progress or #100DaysOfCode for people learning to program. If you belong to one, its tag helps peers find you.",
            "**Niche topics people search for.** A specific tag for a framework, a profession or a hobby can help people searching that topic discover you.",
            "**Your own series.** A unique tag for a recurring series, a challenge or a chat makes it easy to collect every post in one place.",
          ),
        ],
      },
      {
        id: "when-they-hurt",
        heading: "When hashtags hurt",
        blocks: [
          ul(
            "**Stuffing.** Five tags on a two-line post reads like spam, whatever the content.",
            "**Unrelated trending tags.** Adding a trending tag that has nothing to do with your post is a classic spam pattern, and X's rules on platform manipulation and spam cover it.",
            "**Follow-back tags.** Tags like #followback, #F4F or #TeamFollowBack signal that an account mainly wants mutual follows. That can bring quick follow-backs, but rarely engaged readers, and using them in your own posts makes you look like you are chasing numbers.",
            "**Tags you do not understand.** A tag can belong to a different community or a controversy you have not heard of. Read the latest posts under a tag before you use it.",
            "**Tagging every word.** #Tagging #every #word makes a post #hard to #read.",
          ),
        ],
      },
      {
        id: "find",
        heading: "How to find the best hashtags for your niche",
        blocks: [
          p("There is no universal list of the best hashtags for Twitter, because the best tag is the one your specific audience actually uses. To find yours:"),
          ol(
            "**Search X for your topic** and open the **Latest** results. Note which tags real people in your niche use, not the ones bots repeat.",
            "**Look at accounts you admire** in your niche. If several of them use the same tag regularly, it is probably a live community.",
            "**Check the events and communities** you are part of for their official tags.",
            "**Open each candidate tag** and read the recent posts. You want a tag that is active and on topic, not one that is empty or flooded with spam.",
            "**Keep a short list** of three to five tags you trust, and use them only when they genuinely fit the post.",
          ),
        ],
      },
      {
        id: "format",
        heading: "Where to put hashtags and how to write them",
        blocks: [
          ul(
            "**Inline or at the end.** A tag can sit naturally inside a sentence (\"Day 30 of #100DaysOfCode\") or at the end. Do not open with tags; your hook should come first.",
            "**Use CamelCase** for multi-word tags, such as #BuildInPublic rather than #buildinpublic. It is easier to read and helps screen readers pronounce the words.",
            "**In threads,** a tag in the first post is usually enough. Repeating it in every part adds noise.",
            "**Images do not need hashtags.** Write alt text that describes the image instead, which helps people who use screen readers.",
          ),
        ],
      },
      {
        id: "examples",
        heading: "Good and bad hashtag use, side by side",
        blocks: [
          p("Here is the same update written three ways:"),
          ul(
            "**Too many:** \"Just shipped dark mode for my app #coding #dev #startup #indiehacker #tech #SaaS #buildinpublic\". The tags are longer than the news, and most of them describe nobody in particular.",
            "**None:** \"Just shipped dark mode for my app. It took a full rewrite of the colour system, and here is what I would do differently.\" Perfectly good. Your followers will see it either way, and the second sentence invites replies.",
            "**Just right:** the same two sentences followed by #BuildInPublic. One tag connects the post to a community that cares about exactly this kind of update, without getting in the reader's way.",
          ),
          p("Notice that the best version is mostly about the writing. The hashtag is a small finishing touch, not the reason anyone reads the post."),
        ],
      },
      {
        id: "measure",
        heading: "Test whether hashtags help you",
        blocks: [
          p("Because the effect of hashtags varies so much by niche, your own data beats any rule. Post comparable content with and without a tag for a few weeks, then compare **engagement rate** (engagements divided by views) rather than raw likes. GrowX's [Twitter analytics](/features/twitter-analytics) track views, likes, reposts, replies, bookmarks and engagement rate for your recent posts, so the comparison takes minutes."),
          p("If a tag keeps bringing more relevant replies or followers, keep it. If you cannot see a difference, drop it and enjoy cleaner posts. For more ways to earn replies, see [how to increase Twitter engagement](/blog/how-to-increase-twitter-engagement)."),
        ],
      },
      {
        id: "growx",
        heading: "Hashtags as a source of people to follow in GrowX",
        blocks: [
          p("Hashtags are also a way to find people. Someone who posts under a niche tag today is active and interested in that topic, which makes them a good candidate to follow. GrowX's [smart auto follow](/features/twitter-auto-follow) can use **searches and #hashtags as sources** on Premium, alongside source profiles, a post's reposts, replies and likes, and X Lists."),
          p("Keywords also shape who GrowX follows from any source:"),
          ul(
            "**Follow-back boost words.** A bio with follow-back words, such as \"follow back\", \"mutuals\" or #followback, raises an account's follow-back score, because those accounts are more likely to follow back. The score also weighs recent activity, account age and profile quality, and you can edit the boost list.",
            "**Exclude keywords.** Adult-content terms are excluded by default, so accounts whose bios match them are skipped. Add your own words to keep other topics out.",
            "**Safe pacing.** Follows run one at a time with random delays, breaks and hourly and daily caps, and GrowX slows down after any warning from X.",
          ),
          p("Read [how the follow-back score works](/blog/twitter-follow-back-score-growx) for the full list of signals."),
          note("No tool can promise zero risk on X. GrowX is designed to respect the limits X signals, but you remain responsible for following X's rules."),
        ],
      },
      {
        id: "try",
        heading: "Find your audience with GrowX",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including hashtag sources, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "How many hashtags should I use on Twitter?",
        a: "For most posts, zero to two relevant hashtags. More than that makes a post harder to read and can look spammy.",
      },
      {
        q: "Do hashtags increase reach on X?",
        a: "Not by themselves. A hashtag makes a post findable by people who search or tap that tag, which helps for events, live moments and active communities, but it is not a button for more reach.",
      },
      {
        q: "What are the best hashtags for Twitter?",
        a: "There is no universal list. The best hashtags are the specific ones your audience already uses, which you can find by searching your topic on X and checking the Latest results.",
      },
      {
        q: "Should I use #followback or #F4F hashtags?",
        a: "It is better not to. They attract people who want mutual follows rather than readers, and they make an account look like it is chasing numbers.",
      },
      {
        q: "Can GrowX find people to follow from a hashtag?",
        a: "Yes. On Premium, GrowX's auto follow can use searches and #hashtags as sources, and candidates still pass your filters and GrowX's safety checks, with follows paced at a human speed.",
      },
    ],
  },
];
