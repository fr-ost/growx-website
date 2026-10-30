import type { Block, Post } from "./posts";

/**
 * Content and brand guides: content calendars, repurposing, pinned posts, personal branding and building in public.
 * Same rules as posts.ts: every product claim matches docs/PRODUCT_FACTS.md (extension v2.4.4); no invented
 * statistics, studies, testimonials or result promises. Examples use {placeholders}, not real people's posts.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-31";
const TRY =
  "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed.";

export const brandPosts: Post[] = [
  {
    slug: "twitter-content-calendar",
    seoTitle: "Twitter Content Calendar: Free Weekly Template for X",
    title: "Twitter Content Calendar: A Weekly Template to Plan Your X Posts Without Burning Out",
    description:
      "Build a Twitter content calendar with a free weekly template: content pillars, batching, queue slots and evergreen posts, plus how GrowX schedules it.",
    excerpt:
      "A content calendar turns posting on X from a daily scramble into a weekly routine. Here is a copyable template built from content pillars and days, plus batching, queue slots and evergreen posts.",
    category: "Create",
    keywords: [
      "Twitter content calendar",
      "social media content calendar for X",
      "content calendar template",
      "X content plan",
      "plan tweets in advance",
      "Twitter content strategy",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["how-to-schedule-tweets", "best-time-to-post-on-twitter", "how-often-to-post-on-twitter"],
    sections: [
      {
        id: "why",
        heading: "Why a content calendar helps on X",
        blocks: [
          p("A **Twitter content calendar** is a simple plan of what you will post on X, on which days and in which format. It sounds like something only brands with a social media team need, but it helps solo creators even more. Without one, most accounts fall into the same pattern: a burst of posts during a good week, silence when work gets busy, then a scramble to think of something to say. A calendar replaces that with a rhythm you can keep."),
          p("It also makes your writing better. When you know that Tuesday is for a how-to and Thursday is for a story, you collect ideas for those slots all week instead of staring at an empty composer. Below: a copyable weekly template, a batching routine, queue slots and evergreen recycling."),
        ],
      },
      {
        id: "pillars",
        heading: "Start with three to five content pillars",
        blocks: [
          p("Content pillars are the recurring themes your account is about. They keep your feed focused enough that people know what they get, and varied enough that you do not repeat yourself. Three to five is a good range. Common ones:"),
          ul(
            "**Teach**: how-tos, tips, frameworks and mistakes to avoid in your topic. This is usually the pillar that earns follows from strangers.",
            "**Show**: your work, results and what you are building right now.",
            "**Tell**: stories and lessons from your own experience, including what went wrong.",
            "**Discuss**: questions, opinions and takes that invite replies from your audience.",
            "**Share**: the best resources or posts from others in your niche, with your own comment.",
          ),
          p("Give each pillar a name you will actually use, such as \"Design teardown\" instead of \"Educational content\". If you are short on ideas for one, the [tweet ideas](/blog/tweet-ideas) guide has prompts for every kind of post."),
        ],
      },
      {
        id: "template",
        heading: "A weekly content calendar template you can copy",
        blocks: [
          p("The simplest content calendar template is a grid: days down the side, and for each day a pillar, a format, a time slot and the idea. You do not need a spreadsheet to start. Copy the plain-text version below into a note, replace the {placeholders} with your own pillars and times, and move the days around to fit your week."),
          ul(
            "Monday | Teach | Single post | {slot 1} | One practical tip about {topic}, with a concrete example",
            "Tuesday | Show | Image or screenshot | {slot 2} | What I worked on: {project}, what changed, what is next",
            "Wednesday | Teach | Thread (5 to 8 parts) | {slot 1} | How to {result} in {number} steps",
            "Thursday | Tell | Single post | {slot 2} | A lesson from {experience}: what happened and what I learned",
            "Friday | Discuss | Question | {slot 3} | {A question your audience has an opinion on}",
            "Saturday | Share | Single post | {slot 1} | The best {resource} I found this week and why it helps",
            "Sunday | Recycle | Evergreen post | {slot 2} | My best post from {month}, rewritten with a new hook",
            "Every day | Engage | Replies | 15 to 30 minutes | Reply early to {number} fresh posts from accounts in my niche",
          ),
          p("Read it as one post a day plus replies. To post more, add a second row per day from your strongest pillar. The right volume depends on your time and audience; the guide on [how often to post on Twitter](/blog/how-often-to-post-on-twitter) helps you choose an amount you can keep up for months."),
          note("Leave one or two open slots each week for timely posts: news in your niche, a reply that deserves to become a post, or something you just shipped. A calendar with no room for the moment quickly feels stiff."),
        ],
      },
      {
        id: "batching",
        heading: "Batch your writing in one weekly session",
        blocks: [
          p("Batching means writing a whole week of posts in one sitting. The hardest part of posting is switching into writing mode; once you are there, the fifth post comes faster than the first."),
          ol(
            "**Collect all week.** Keep a running note of ideas, questions people asked you and things you learned, tagged by pillar.",
            "**Block 60 to 90 minutes.** Same day each week, for example Sunday evening or Friday afternoon, and put it in your real calendar.",
            "**Fill the grid.** Pick one idea per slot from your notes. Write the thread first, because it takes the most energy, then the single posts.",
            "**Write hooks separately.** For each post, draft two or three first lines and keep the strongest. The first line decides whether anyone reads the rest.",
            "**Edit in one pass.** Check the length, cut filler and make sure each post makes sense to a stranger.",
            "**Schedule everything.** Put every post into your scheduler or queue before you close the session, so nothing depends on remembering later.",
          ),
          p("Starting from a template speeds up the blank-page part. The free library of [52 tweet templates](/tools/tweet-templates) covers hooks, threads, lists, stories, lessons, questions and more, each with {placeholders} to fill in."),
        ],
      },
      {
        id: "queue-slots",
        heading: "Turn the calendar into queue slots",
        blocks: [
          p("A calendar says what to post. Queue slots decide when. Instead of picking a date and time for every post, you set recurring times once, such as 09:00, 13:00 and 18:30, and each new post drops into the next free slot. It is the lowest-effort way to keep a calendar running, and the guide on [how to schedule tweets](/blog/how-to-schedule-tweets) covers the mechanics in more detail."),
          p("Choose slot times from your own data where you can. Your audience's habits matter more than any general chart, so start with sensible defaults, then move the slots towards the hours your posts actually perform. The guide to the [best time to post on Twitter](/blog/best-time-to-post-on-twitter) explains how to run that test on your own account."),
          ul(
            "Give time-sensitive posts, such as a launch or an event, a specific date and time instead of a queue slot.",
            "Keep a few days of posts waiting at all times, so one busy week does not empty your feed.",
          ),
        ],
      },
      {
        id: "evergreen",
        heading: "Recycle evergreen posts so the calendar never runs dry",
        blocks: [
          p("Not every slot needs a brand-new idea. Evergreen posts stay useful for months: a checklist, a framework, a lesson that does not depend on this week's news. Many followers missed your post from two months ago, and new ones never saw it."),
          ul(
            "Bring one back every week or two with a new hook, an updated example or a different format, such as turning a thread into a single summary post.",
            "Do not recycle anything dated, such as prices, old numbers or opinions you no longer hold.",
          ),
          p("In GrowX, **evergreen recycling** (Premium) does this for you: your best posts go out again every so many days, 30 by default, with rotating variants, or are reposted."),
        ],
      },
      {
        id: "growx",
        heading: "Running your Twitter content calendar in GrowX",
        blocks: [
          p("GrowX is a Chrome extension for X with a [post scheduler](/features/twitter-post-scheduler) in its Create area. Here is how the pieces of a content calendar map onto it:"),
          ul(
            "**Calendar**: see what goes out on which day, and edit anything before it is published.",
            "**Drafts**: park ideas that are not ready yet, then finish them during your batching session.",
            "**Templates**: 52 built-in templates plus your own, so a recurring format such as a weekly tip takes minutes.",
            "**Queue**: **Add to queue** drops a post into the next free slot. Slots start at 09:00, 13:00 and 18:30 every day, and you can change them.",
            "**Best time to post**: a week by 24-hour heat map built from your own posts' engagement and when your followers are active, so you can move your slots to hours that suit your audience.",
            "**Threads and images**: threads of up to 25 parts and up to 4 images per post, scheduled like any other post.",
          ),
          p("On the free plan, up to **10 posts or threads can wait in the queue at once**, which covers a week of daily posts with a few to spare. **Unlimited scheduling** is part of Premium."),
          note("GrowX posts from your own Chrome, so your computer needs to be on with Chrome open around the scheduled time. A post that would go out more than 6 hours late is never posted by itself; it waits as \"missed\" so you can decide what to do. GrowX also keeps a daily cap (20 posts by default), a minimum gap of 5 minutes between posts, and pauses on any X warning."),
        ],
      },
      {
        id: "review",
        heading: "Review the calendar once a month",
        blocks: [
          p("A content calendar is a guess about what your audience wants. Once a month, check it against what actually happened:"),
          ul(
            "Which pillar earned the most replies, reposts and bookmarks? Give it more slots.",
            "Which format worked best: questions, images, plain text, threads or links? Use it more within your strongest pillars.",
            "Which slots keep underperforming? Move them or drop them.",
            "Which posts are worth bringing back? Add them to your evergreen list.",
          ),
          p("GrowX's [analytics](/features/twitter-analytics) help here: post analytics show views, likes, reposts, replies, bookmarks and engagement rate (your latest 30 posts on the free plan), and **What works** breaks engagement down by topic and format."),
        ],
      },
      {
        id: "try",
        heading: "Plan and schedule your week with GrowX",
        blocks: [
          p(`${TRY} Build your first weekly template, fill the queue in one sitting and let the calendar do the remembering.`),
        ],
      },
    ],
    faq: [
      {
        q: "What should a Twitter content calendar include?",
        a: "At minimum, the day, the content pillar, the format and the posting time for each post. Many people also track a status such as idea, draft or scheduled, and mark which posts are worth recycling later.",
      },
      {
        q: "How far ahead should I plan my content calendar for X?",
        a: "One week ahead in detail is enough for most people, with a rough monthly view for launches and events. Planning every post further out tends to produce posts that feel stale by the time they go out.",
      },
      {
        q: "Is a spreadsheet good enough as a Twitter content calendar?",
        a: "For planning, yes. A spreadsheet or note works well for pillars and ideas, but you still need a scheduler or queue to publish the posts at the right times.",
      },
      {
        q: "What is the difference between a content calendar and a posting queue?",
        a: "A content calendar decides what you post on which day of your week. A queue is the mechanism that publishes posts at recurring time slots, so each new post fills the next open slot without you picking a time.",
      },
      {
        q: "How many posts can I schedule for free in GrowX?",
        a: "On the free plan, up to 10 posts or threads can wait in the queue at once. Premium removes that limit with unlimited scheduling.",
      },
    ],
  },
  {
    slug: "repurpose-content-for-twitter",
    seoTitle: "Repurpose Content for Twitter: Blog Posts to Threads",
    title: "How to Repurpose Content for Twitter: Turn Blog Posts, Videos and Podcasts Into X Threads",
    description:
      "How to repurpose content for Twitter: turn a blog post into a Twitter thread, and videos, podcasts and newsletters into X posts, with free GrowX tools.",
    excerpt:
      "Your articles, videos, podcasts and newsletters already hold weeks of posts for X. Here is a step-by-step way to turn them into threads and single posts that stand on their own.",
    category: "Create",
    keywords: [
      "repurpose content for Twitter",
      "turn a blog post into a Twitter thread",
      "content repurposing",
      "repurpose blog posts",
      "blog post to Twitter thread",
      "repurpose podcast content",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["how-to-write-a-twitter-thread", "ai-tweet-writer-growx-ai", "twitter-content-calendar"],
    sections: [
      {
        id: "why",
        heading: "Why repurposing content for Twitter makes sense",
        blocks: [
          p("If you already write blog posts, record videos, host a podcast or send a newsletter, you are sitting on a pile of ideas that most of your X audience has never seen. **Content repurposing** means taking something you made for one place and reshaping it for another. On X (Twitter), that usually means turning long pieces into short single posts and threads that work on their own in the timeline."),
          p("It is not about saving effort by copying and pasting. It is about getting more value from research and thinking you already did. A long article might contain one core argument, five tips, three stories and a few memorable lines, and each of those can become a post. This guide walks through how to repurpose content for Twitter, step by step, for blog posts, videos, podcasts and newsletters, plus the tools that make it faster."),
        ],
      },
      {
        id: "rules",
        heading: "Repurposing is rewriting, not pasting",
        blocks: [
          p("People scroll X quickly, so a paragraph lifted from an article rarely works as a post. Keep these rules in mind before you start:"),
          ul(
            "**Every post must stand on its own.** Someone who never saw the original should understand it and get something from it.",
            "**Lead with the point.** Articles often build up to the conclusion. On X, the conclusion is the hook.",
            "**Shorten sentences.** Cut introductions, qualifiers and transitions such as \"In this section we will look at\".",
            "**Use the native format.** Lists become line-by-line lists, examples become screenshots or images, step-by-step guides become threads.",
            "**Treat the link as an extra.** Give the value in the post and offer the full piece to people who want more. Many creators put the link at the end of a thread or in a reply; if it matters to you, test both on your own account.",
          ),
        ],
      },
      {
        id: "blog-to-thread",
        heading: "How to turn a blog post into a Twitter thread, step by step",
        blocks: [
          p("Threads are the most natural way to repurpose an article, because both have a beginning, a middle and an end. This process works for most blog posts:"),
          ol(
            "**Find the one promise.** Write down, in one sentence, what a reader gets from the article. That sentence is the raw material for your first post.",
            "**List the key points.** Pull out the headings or main ideas. Aim for one idea per post, and drop anything that only makes sense with the full context.",
            "**Write the hook.** Turn the promise into a specific first post: a result, a number of steps, a mistake to avoid or a bold claim you can back up. Tell people what the thread covers.",
            "**Rewrite each point as a post.** One idea, one example, plain language. If a point needs a long explanation, split it in two or leave it for the article.",
            "**Add proof.** A screenshot, a short example, a before-and-after or a line from your own experience is more convincing than a summary.",
            "**Close the loop.** End with a short recap and one call to action: follow for more on the topic, read the full article, or repost the first post if it helped.",
            "**Check the length of every part.** X counts each link as 23 characters and most emoji as 2, so a post that looks short can still be over the limit.",
          ),
          p("Keep the thread shorter than the article. Five to ten parts is plenty for most pieces; if you need many more, the topic may really be two threads. The full guide on [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread) covers hooks and structures in more detail."),
        ],
      },
      {
        id: "single-posts",
        heading: "Turn one article into a week of single posts",
        blocks: [
          p("A thread is only one option. The same article can feed your timeline for days with single posts, each taking a different angle:"),
          ul(
            "**The main takeaway** in one or two sentences.",
            "**One tip** from the article, with a concrete example.",
            "**A mistake** the article warns about, framed as \"Stop doing {mistake}. Do {better approach} instead.\"",
            "**A short list**: three or five points from the article, one per line.",
            "**A quote** from the piece that works without any context.",
            "**A question** the article answers, asked to your audience before you share your own answer.",
            "**A story** from the article, told in a few lines with the lesson at the end.",
            "**A behind-the-scenes post** about why you wrote the piece or what surprised you while researching it.",
          ),
          p("Spread these over a week or two rather than posting them all at once, and mix them with your other content so your timeline does not read like one long advert for the article."),
        ],
      },
      {
        id: "video-podcast",
        heading: "Repurpose videos and podcasts into X posts",
        blocks: [
          p("Audio and video take more work because you first need the words. Start with a transcript: many video and podcast tools can generate one, or you can take notes while you rewatch. Then treat it like a rough draft."),
          ul(
            "**Pull out the strongest moments.** Look for a clear opinion, a surprising answer, a useful framework or a funny story. Each one can become a post.",
            "**Quote guests fairly.** Use their exact words, credit them and tag them where it makes sense. Never twist a quote to make it more dramatic.",
            "**Post short clips natively.** If you have the rights to a clip, upload it with a caption that states the point, so people get the idea without leaving X.",
            "**Turn an episode into a thread.** One post per key takeaway, with the episode link at the end.",
            "**Answer the questions people asked.** Comments and questions on the video or episode are ready-made prompts for new posts.",
          ),
        ],
      },
      {
        id: "newsletter",
        heading: "Repurpose a newsletter issue",
        blocks: [
          p("Newsletters are the easiest to repurpose because they are already written in a personal voice. A simple habit is to post the best idea from each issue on X a day or two after it goes out, or the day before as a teaser."),
          ul(
            "Turn the main section into a thread and link to the archive or sign-up page in the last post.",
            "Post your favourite line from the issue as a single post.",
            "Share the question you answered in the issue and invite replies.",
            "With permission, turn reader replies into posts about what your audience is thinking.",
          ),
          p("It works the other way too. Posts that do well on X show you what to expand into a newsletter issue or a blog post, which then gives you new material to repurpose later. If you need fresh angles, these [tweet ideas](/blog/tweet-ideas) work well as prompts."),
        ],
      },
      {
        id: "tools",
        heading: "Tools that make repurposing faster",
        blocks: [
          p("You can repurpose with nothing but a notes app, but a few tools remove the fiddly parts:"),
          ul(
            "**A thread splitter.** The free [Twitter thread maker](/tools/twitter-thread-maker) takes pasted text and splits it into numbered posts that each fit 280 characters, cutting at natural breaks. Add a line with just `---` wherever you want a new post to start. No sign-up needed.",
            "**Thread it in GrowX.** The GrowX composer has a **Thread it** button that splits a long draft into parts that fit X's character counting, right where you schedule the thread.",
            "**GrowX AI (Premium).** With the [AI writer](/features/ai-tweet-writer), Thread it can also help shape a long draft into a thread, and Write, Improve and Hooks help you rework a paragraph into a post. It runs on your own computer using the AI model built into Chrome, so nothing is sent to GrowX and no API key is needed. It uses your niche and voice settings, and leaves {placeholders} instead of inventing facts.",
          ),
          note("Whatever tool you use, read every part before it goes out. A splitter cuts text to fit the limit, but only you can tell whether each part reads well on its own. If Chrome's built-in model is not available on your computer, GrowX's AI buttons fall back to templates and the plain thread splitter; the [GrowX AI guide](/blog/ai-tweet-writer-growx-ai) explains the requirements."),
        ],
      },
      {
        id: "schedule",
        heading: "Schedule repurposed posts so they do not bunch up",
        blocks: [
          p("The usual mistake with repurposing is posting everything from one piece on the same day. Spread it out instead:"),
          ol(
            "Write all the posts from one piece in a single session, while the material is fresh in your mind.",
            "Schedule the thread first, at one of your best times.",
            "Spread the single posts over the following one to two weeks, between your other content.",
            "Save the strongest ones for later. A good takeaway can come back in a few months with a new example.",
          ),
          p("In GrowX's [post scheduler](/features/twitter-post-scheduler), **Add to queue** drops each post into the next free slot, and the calendar shows how your week looks. Free accounts can keep up to 10 posts or threads waiting at once. Premium adds unlimited scheduling and **evergreen recycling**, which brings your best posts back every so many days (30 by default) with rotating variants."),
        ],
      },
      {
        id: "try",
        heading: "Start repurposing with GrowX",
        blocks: [
          p(`${TRY} Pick one article you are proud of and turn it into a thread and a week of posts.`),
        ],
      },
    ],
    faq: [
      {
        q: "Is it okay to post the same content on my blog and on Twitter?",
        a: "Yes, as long as you rewrite it for X. Most of your followers have not read the original, and a post that stands on its own is more useful to them than a pasted paragraph.",
      },
      {
        q: "How many tweets can I get from one blog post?",
        a: "It depends on the article, but a solid piece often holds a thread plus several single posts: the main takeaway, individual tips, a mistake to avoid, a quote and a question. Spread them out over a week or two.",
      },
      {
        q: "Should I put the blog link in the first post of a thread?",
        a: "Many creators put it at the end of the thread or in a reply, so the first post can focus on the hook. There is no published rule you can rely on, so test both on your own account.",
      },
      {
        q: "Can AI turn a blog post into a Twitter thread?",
        a: "It can help with a first draft. GrowX AI (Premium) can shape a long draft into a thread on your own computer, but you should still edit every part and add the real details yourself.",
      },
      {
        q: "How long should a thread made from a blog post be?",
        a: "Long enough to cover the key points and no longer. Five to ten parts suits most articles, and a GrowX thread can have up to 25 parts if you really need them.",
      },
    ],
  },
  {
    slug: "pinned-tweet-ideas",
    seoTitle: "Pinned Tweet Ideas: What to Pin on Twitter (X)",
    title: "Pinned Tweet Ideas: What to Pin on Twitter (X) to Turn Profile Visitors Into Followers",
    description:
      "Pinned tweet ideas with 18 fill-in examples: what to pin on Twitter, how to pin a post on X and how often to change it, from the team behind GrowX.",
    excerpt:
      "Your pinned post is the first thing most profile visitors read. Here are 18 pinned tweet ideas with fill-in examples, plus how to pair the pin with your bio and when to change it.",
    category: "Guides",
    keywords: [
      "pinned tweet ideas",
      "what to pin on Twitter",
      "pinned post X",
      "pinned tweet examples",
      "how to pin a tweet",
      "Twitter profile tips",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["twitter-bio-ideas", "first-1000-followers-on-x", "how-to-write-a-twitter-thread"],
    sections: [
      {
        id: "why",
        heading: "Why your pinned post matters",
        blocks: [
          p("Many follows on X happen on your profile. Someone sees one of your replies, a repost or a follow notification, taps your name and spends a few seconds deciding. In those seconds they read your name, your bio and the first post on the page. On X (Twitter), that first post is whatever you pinned, so your **pinned post** is the one post almost every profile visitor sees."),
          p("A good pinned tweet answers the question every visitor has: what do I get if I follow this account? A weak one, such as an old joke, a dated announcement or nothing at all, wastes that moment. This guide covers what to pin on Twitter, 18 pinned tweet ideas with fill-in examples, how to make the pin work with your bio, and how often to change it."),
        ],
      },
      {
        id: "how-to-pin",
        heading: "How to pin a post on X",
        blocks: [
          p("Pinning takes a few seconds on the web or in the app:"),
          ol(
            "Open the post you want to pin. It has to be one of your own.",
            "Tap or click the three-dot menu on the post.",
            "Choose **Pin to your profile** and confirm.",
          ),
          p("You can pin one post at a time, and pinning a new one replaces the old. To remove a pin, open the same menu and unpin it. You can pin a single post or the first post of a thread, which then works as the entry point to the whole thread."),
        ],
      },
      {
        id: "principles",
        heading: "What makes a good pinned tweet",
        blocks: [
          ul(
            "**Written for strangers.** Assume the reader has never heard of you. Skip in-jokes and references to earlier posts.",
            "**Clear about the account.** It shows what you post about, either by saying it directly or by being a strong example of it.",
            "**Evergreen.** It should still make sense in three months. Avoid dates, prices and news that will age.",
            "**Consistent with your bio.** If your bio promises tips on {topic}, the pinned post should deliver one.",
            "**One next step.** Follow, read the thread, join the newsletter or try the product. Pick one.",
          ),
        ],
      },
      {
        id: "intro-ideas",
        heading: "Pinned tweet ideas that introduce you",
        blocks: [
          p("These pinned tweet ideas use {placeholders}. Replace them with your own details and cut anything that does not fit your voice."),
          ol(
            "**The welcome post.** \"New here? I'm {name}. I post about {topic 1}, {topic 2} and {topic 3} for {audience}. Start with the thread below.\"",
            "**The what-to-expect post.** \"What you get by following me: {post type 1} every {weekday}, {post type 2} every {weekday}, and honest notes on {topic} in between.\"",
            "**The origin story.** \"{Timeframe} ago I was {starting point}. Today I {current situation}. Here is what changed, in {number} posts:\"",
            "**The mission line.** \"I want to help {audience} {result}. Everything I post here is a small step towards that.\"",
            "**The about-me thread.** \"{Number} things about me:\" followed by a short thread with your background, what you work on, one credential and one personal detail.",
            "**The build-in-public kickoff.** \"I'm building {project} in public. Follow along for weekly updates on {metric}, what worked and what didn't.\"",
            "**The learning-in-public post.** \"Day {number} of learning {skill}. I share what I study every day, mistakes included. Here is where I started:\"",
            "**The values post.** \"Three things I believe about {topic}: {belief 1}. {belief 2}. {belief 3}. If that sounds right, you'll like it here.\"",
          ),
        ],
      },
      {
        id: "value-ideas",
        heading: "Pinned tweet ideas that prove your value",
        blocks: [
          p("Introductions tell visitors who you are. These ideas show them, by putting your most useful work at the top of the page:"),
          ol(
            "**Your best thread.** Pin the thread that best represents your topic, with a first post such as \"How to {result} without {pain}, step by step:\". The guide on [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread) covers the structure.",
            "**A free resource.** \"I made a free {resource type} for {audience}: {what it includes}. Get it here: {link}\"",
            "**A checklist.** \"The {topic} checklist I use before every {task}: {item 1}, {item 2}, {item 3}. Save this for later.\"",
            "**A curated index.** \"My most useful threads on {topic}, in one place:\" followed by links to {thread 1}, {thread 2} and {thread 3}.",
            "**A before-and-after.** \"{Thing} before and after {change}. What I did: {step 1}, {step 2}, {step 3}.\" Add the two images if you have them.",
            "**A result with context.** \"{Result} in {timeframe}. What made the difference: {reason 1}, {reason 2}, {reason 3}. Full breakdown below.\" Only use real results you can stand behind.",
            "**The launch or offer.** \"I just launched {product}. It helps {audience} {benefit}. Try it: {link}\" Good while a launch is current; swap it afterwards.",
            "**The newsletter pitch.** \"Every {weekday} I send one short email about {topic} for {audience}. Here is the latest issue: {link}\"",
            "**A strong opinion.** \"Unpopular opinion in {niche}: {opinion}. Here is why:\" Works when it reflects what you really believe and post about.",
            "**A question for your audience.** \"If you could fix one thing about {topic}, what would it be? I read every reply.\" Great for starting conversations, weaker at explaining who you are.",
          ),
          p("Templates like these are a starting point, not a script. The free library of [52 tweet templates](/tools/tweet-templates) has more hooks, stories and launch posts you can adapt into a pin."),
        ],
      },
      {
        id: "bio",
        heading: "Make your pinned post and bio work together",
        blocks: [
          p("Your bio and your pinned post are read together, one right above the other. The bio makes a promise in 160 characters; the pinned post keeps it. If your bio says \"Weekly breakdowns of {topic}\", pin your best breakdown. If it says \"Free starter guide below\", the pinned post must be that guide."),
          ul(
            "Use the same words for your topic in both, so visitors connect them instantly.",
            "Let the bio name the call to action and the pinned post deliver it, rather than repeating the same pitch twice.",
            "Change them together. When your focus shifts, update both on the same day.",
          ),
          p("If your bio needs work first, the free [Twitter bio generator](/tools/twitter-bio-generator) gives you starting points, and these [Twitter bio ideas](/blog/twitter-bio-ideas) walk through a simple formula with examples for many niches."),
        ],
      },
      {
        id: "update",
        heading: "How often to update your pinned tweet",
        blocks: [
          p("There is no fixed schedule, but a pinned post should never be older than your current focus. Good moments to change it:"),
          ul(
            "**Your focus changes**: a new job, a new product or a new main topic.",
            "**You write something better**: a new thread that represents your topic more clearly than the current pin.",
            "**A launch ends**: swap the launch post for an evergreen introduction or resource once the offer is no longer new.",
            "**It looks dated**: old numbers, a finished event or a link that no longer works.",
          ),
          p("As a habit, look at your pinned post whenever you edit your bio, and at least every few months. A pin from years ago tells visitors nobody is looking after the account."),
        ],
      },
      {
        id: "measure",
        heading: "How to tell whether your pinned post works",
        blocks: [
          p("The job of a pinned post is to turn profile visitors into followers, so judge it by follows, not likes. A simple test: keep one pin for a couple of weeks, switch to another for the same length of time, and compare how many new followers you got in each period while posting roughly the same amount. It is not a lab experiment, but over a few rounds it shows which kind of pin suits your audience."),
          p("GrowX, a Chrome extension for growing on X, can help with the counting. Its [follower tracker](/features/twitter-unfollower-tracker) records once a day who followed and who unfollowed you (7 days of history on the free plan, full history on Premium), and the growth chart shows the trend. For where the profile fits into a wider plan, see the guide to [your first 1,000 followers on X](/blog/first-1000-followers-on-x)."),
        ],
      },
      {
        id: "try",
        heading: "Get your profile ready with GrowX",
        blocks: [
          p(`${TRY} Once your bio and pinned post are ready, the post scheduler and smart auto follow help the right people find your profile.`),
        ],
      },
    ],
    faq: [
      {
        q: "How many tweets can you pin on X?",
        a: "One at a time. Pinning a new post replaces the one that was pinned before.",
      },
      {
        q: "Should I pin a thread or a single post?",
        a: "Either works. Pin a thread when your best work is a step-by-step guide or a story, and a single post when one clear introduction or offer says enough.",
      },
      {
        q: "How often should I change my pinned tweet?",
        a: "Whenever your focus or main offer changes, when a launch ends, or when you write something that represents you better. Otherwise, check it every few months.",
      },
      {
        q: "Should my pinned tweet include a link?",
        a: "It can, if the link is your main next step, such as a newsletter or a product. Make the post useful on its own first, so visitors get value even if they never click.",
      },
      {
        q: "Does pinning a tweet give it more reach?",
        a: "Pinning mainly changes what profile visitors see first. Do not count on it to push the post back into timelines; its job is to turn visits into follows.",
      },
    ],
  },
  {
    slug: "personal-branding-on-twitter",
    seoTitle: "Personal Branding on Twitter: Build a Brand on X",
    title: "Personal Branding on Twitter: How to Build a Personal Brand on X, Step by Step",
    description:
      "Personal branding on Twitter, step by step: positioning, niche, voice, profile, content pillars and consistency, plus how GrowX helps you measure it.",
    excerpt:
      "A personal brand on X is what people expect when they see your name. Here is how to shape it on purpose, from positioning and voice to content pillars, relationships and measurement.",
    category: "Guides",
    keywords: [
      "personal branding on Twitter",
      "build a personal brand on X",
      "Twitter personal brand",
      "personal brand strategy",
      "X content pillars",
      "Twitter niche",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-grow-on-twitter-x", "twitter-bio-ideas", "twitter-reply-strategy"],
    sections: [
      {
        id: "what",
        heading: "What a personal brand on X actually is",
        blocks: [
          p("A personal brand is what people think of when they see your name: the topic they associate with you, the kind of posts they expect and whether they trust what you say. On X (Twitter) it forms quickly, because people judge an account from a few posts and a profile. **Personal branding on Twitter** is simply shaping that impression on purpose instead of leaving it to chance."),
          p("It is not about a logo, a slogan or pretending to be someone you are not. Strong personal brands on X tend to be narrow and consistent: a person known for one thing, who posts about it reliably and is helpful in the replies. This guide walks through how to build a personal brand on X in eight steps: positioning, niche, voice, profile, content pillars, consistency, relationships and measurement."),
        ],
      },
      {
        id: "positioning",
        heading: "Step 1: Positioning, known for what and by whom",
        blocks: [
          p("Positioning is the one sentence you want people to say about you. Write it down before you change anything else, because every later decision follows from it."),
          p("A fill-in version: `I help {audience} {result} by sharing {what you share}, based on {your experience}.` For example: \"I help first-time founders write better landing pages by sharing teardowns and rewrites, based on {number} years in copywriting.\" Keep it specific. \"I post about business\" is a topic; \"I help bakery owners get more local orders\" is a position."),
          ul(
            "**Audience**: who exactly should follow you? The narrower the group, the easier it is to write for them.",
            "**Result**: what do they get from your posts? Skills, ideas, shortcuts, entertainment or a window into your work.",
            "**Proof**: why you? Experience, results, something you built, or simply being a step ahead and sharing the journey.",
          ),
        ],
      },
      {
        id: "niche",
        heading: "Step 2: Choose a niche you can talk about for years",
        blocks: [
          p("Your niche is the territory your positioning covers. It needs to be narrow enough that people remember you for it, and wide enough that you will not run out of things to say."),
          ul(
            "**Look for an overlap.** Memorable niches often sit where two things meet, such as design and SaaS, or fitness and parenting.",
            "**Test it with an ideas list.** If you cannot list 30 post ideas for the niche today, it may be too narrow. If the list covers everything, it is too wide.",
            "**Allow some range.** Personal posts and side interests make you human. Just keep most of your feed in your lane, so a new visitor sees the niche immediately.",
          ),
        ],
      },
      {
        id: "voice",
        heading: "Step 3: Find your voice and write it down",
        blocks: [
          p("Voice is how you sound: the words you use, the length of your sentences, whether you are direct or playful, formal or casual. A consistent voice makes your posts recognisable before people even see your name."),
          ol(
            "Collect five of your posts or messages that sound most like you.",
            "Describe them in three adjectives, such as \"direct, practical, a bit dry\".",
            "Turn that into a short list of rules: words you use, words you avoid, emoji or none, how you open and close a post.",
            "Read every new draft against the list before you publish.",
          ),
          p("Writing your voice down also helps if you use AI. [GrowX AI](/features/ai-tweet-writer) (Premium) uses your **niche and voice settings** when it writes, improves posts or suggests hooks, so drafts start closer to how you sound. It runs on your own computer using the AI model built into Chrome, and it leaves {placeholders} instead of inventing facts, so the real details and the final edit stay with you."),
        ],
      },
      {
        id: "profile",
        heading: "Step 4: Make your profile match the brand",
        blocks: [
          p("Your profile is where people decide whether to follow, so every part of it should repeat the same positioning:"),
          ul(
            "**Name and photo**: a clear photo of your face for a personal brand, and a display name people can remember and search for.",
            "**Bio**: who you help, what you post, one piece of proof and one call to action. The free [Twitter bio generator](/tools/twitter-bio-generator) gives you starting points.",
            "**Header**: repeat your promise in a few words, or show your work.",
            "**Pinned post**: your best introduction, thread or resource. These [pinned tweet ideas](/blog/pinned-tweet-ideas) include fill-in examples.",
          ),
        ],
      },
      {
        id: "pillars",
        heading: "Step 5: Content pillars and formats",
        blocks: [
          p("Content pillars are the three to five recurring themes that make up your feed. They turn your positioning into actual posts. The landing page founder from step 1 might use four: teardowns of real pages, copywriting tips, lessons from their own launches, and questions for other founders."),
          ul(
            "**Teaching posts** show expertise and earn follows from strangers.",
            "**Behind-the-scenes posts** show that you actually do the work.",
            "**Stories and lessons** make you memorable and relatable.",
            "**Opinions and questions** start conversations and show what you stand for.",
          ),
          p("Mix formats inside each pillar: single posts, threads, images, lists and questions. A [Twitter content calendar](/blog/twitter-content-calendar) turns your pillars into a weekly plan, so you always know what goes out next."),
        ],
      },
      {
        id: "consistency",
        heading: "Step 6: Consistency without burnout",
        blocks: [
          p("A brand is built through repetition. People need to see you show up on the same topic many times before they connect your name with it. That makes consistency more important than volume: a steady pace you can keep for a year beats a burst you abandon after a month."),
          ul(
            "Set a realistic weekly target, for example one post a day and a handful of replies.",
            "Write in batches and schedule ahead, so busy weeks do not break the rhythm.",
            "Bring back your best evergreen posts instead of always writing new ones.",
          ),
          p("GrowX's post scheduler handles the scheduling side with a queue, a calendar and drafts, and its daily goals, streaks and milestones help you keep the habit going."),
        ],
      },
      {
        id: "relationships",
        heading: "Step 7: Build relationships, not just an audience",
        blocks: [
          p("A personal brand is also about who you are seen talking to. Thoughtful replies on other people's posts put your name in front of their audience and show your thinking in context. For a small account, replies are often where new people first notice you. The [Twitter reply strategy](/blog/twitter-reply-strategy) guide covers how to reply well."),
          ul(
            "Pick 10 to 20 accounts in your niche, some bigger than you and some your size, and reply to them regularly with something useful.",
            "Reply early, while a post is still fresh.",
            "Answer every genuine reply on your own posts.",
            "Support peers at your level: repost their best work and introduce them to each other.",
          ),
          p("GrowX's reply targets collect fresh posts from your sources, VIPs and anyone you add, ranked by freshness and how fast they take off, and nothing is sent until you press the button. The People area lets you keep tags and notes on the accounts you talk with and mark the ones that matter most as VIPs."),
        ],
      },
      {
        id: "measure",
        heading: "Step 8: Measure what you are known for",
        blocks: [
          p("Follower count is only part of the picture. To see whether your brand is taking shape, look at which topics and formats your audience responds to, and whether the right people are following you."),
          ul(
            "**Topics**: which pillars earn the most replies, reposts and bookmarks? Those are what people associate with you.",
            "**Formats**: do questions, images, plain text, threads or links work best for you?",
            "**Followers**: which posts bring new followers, and do they match the audience in your positioning?",
            "**Replies and mentions**: what do people ask you about? That is your brand in their words.",
          ),
          p("GrowX's [analytics](/features/twitter-analytics) help here. **What works** breaks your engagement down by topic and format, post analytics cover your latest 30 posts on the free plan, and on Premium **Which posts brought followers** shows new followers in the 24 hours after each post above your usual pace. Review once a month and move more of your calendar towards what works. For the wider growth plan, see [how to grow on Twitter](/blog/how-to-grow-on-twitter-x)."),
        ],
      },
      {
        id: "try",
        heading: "Build your personal brand with GrowX",
        blocks: [
          p(`${TRY} Set your niche and voice, plan your pillars and let the scheduler keep you consistent.`),
        ],
      },
    ],
    faq: [
      {
        q: "How long does it take to build a personal brand on Twitter?",
        a: "There is no fixed timeline. It depends on your niche, how consistently you post and how much you engage, and most people need months of steady posting before others clearly link them to a topic.",
      },
      {
        q: "Can I build a personal brand on X without showing my face?",
        a: "Yes. A consistent name, avatar, voice and topic can be just as recognisable. A real photo can make a personal account feel more trustworthy, but it is not required.",
      },
      {
        q: "Should a personal brand on Twitter stick to one topic?",
        a: "Mostly. Keep the majority of your posts in your niche so new visitors understand what you offer, and let personal posts and side interests add personality around it.",
      },
      {
        q: "How do I find my voice on Twitter?",
        a: "Start with posts and messages that already sound like you, describe them in a few words and turn that into simple writing rules. Your voice gets clearer the more you post.",
      },
      {
        q: "What is the difference between a personal brand and a company account on X?",
        a: "A personal brand is built around a person and their views, experience and relationships, while a company account speaks for a business. Many founders run both, using the personal account to share the story behind the company.",
      },
    ],
  },
  {
    slug: "build-in-public-on-twitter",
    seoTitle: "Build in Public on Twitter: What to Share and How",
    title: "Build in Public on Twitter: What to Share, What to Keep Private and How Often to Post",
    description:
      "Build in public on Twitter: what to share, what to keep private, a posting cadence, formats and honest pros and cons, plus GrowX templates to start.",
    excerpt:
      "Building in public turns your project into a story people can follow on X. Here is what to share, what to keep private, a cadence you can keep and an honest look at the trade-offs.",
    category: "Guides",
    keywords: [
      "build in public",
      "build in public on Twitter",
      "building in public tips",
      "build in public X",
      "build in public examples",
      "indie hacker Twitter",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["personal-branding-on-twitter", "how-to-write-a-twitter-thread", "first-1000-followers-on-x"],
    sections: [
      {
        id: "what",
        heading: "What building in public means",
        blocks: [
          p("To **build in public** means sharing the process of making something, not just the finished result. Founders post their progress, numbers and mistakes; developers share what they shipped this week; writers show drafts and how their audience grows; makers post photos from the workshop. On X (Twitter) it has become a recognisable style, especially among indie hackers and solo founders, often under the #buildinpublic hashtag."),
          p("The idea is simple: people follow stories, and a project in progress is a story with a built-in cliffhanger. Instead of launching to silence, you bring an audience along the way, learn from their feedback and earn trust before you ask anyone for anything. This guide covers building in public tips for X: what to share, what to keep private, how often to post, which formats work, and the honest pros and cons."),
        ],
      },
      {
        id: "share",
        heading: "What to share when you build in public",
        blocks: [
          ul(
            "**Progress**: what you shipped, built, wrote or fixed this week. Concrete beats vague: \"added CSV export\" says more than \"worked on features\".",
            "**Numbers you are comfortable sharing**: users, signups, revenue, traffic, waitlist size or hours spent. Pick the metrics that tell the story and that you are happy for strangers, customers and competitors to see. Ranges or growth rates work if exact figures feel like too much.",
            "**Lessons**: what worked, what failed and what you would do differently. Honest failures are useful to other builders, which is why they often make the most interesting posts.",
            "**Decisions**: why you chose a price, a tool, a feature or a direction. People like seeing the reasoning, and you get feedback before it is too late to change course.",
            "**Launches and milestones**: the first user, the first sale, a new version, a round number. Celebrate them and thank the people who helped.",
            "**Behind the scenes**: your setup, your routine, a screenshot of the messy first version.",
            "**Questions**: ask your audience to vote on a name, react to a landing page or describe their problem. It turns followers into participants.",
          ),
        ],
      },
      {
        id: "keep-private",
        heading: "What not to share",
        blocks: [
          p("Transparency is a choice, not an obligation. Some things should stay private however open you want to be:"),
          ul(
            "**Customer and user data**: names, emails, private messages or dashboard screenshots that show personal details, unless you have clear permission.",
            "**Other people's information**: co-founders, employees, partners and investors should agree before you share anything about them.",
            "**Security details**: infrastructure, admin screens, keys or tokens visible in a screenshot, or anything else that helps an attacker.",
            "**Confidential agreements**: contract terms, partner deals or anything covered by an agreement you signed.",
            "**Numbers you might regret**: if a figure could hurt you in a negotiation, a job search or a hard month, leave it out. You can always share more later, but you cannot unshare.",
            "**Your whole personal life**: building in public is about the project. Boundaries around health, family and money outside the business are healthy.",
          ),
          note("Before you post a screenshot, check every corner of it. Email addresses, browser tabs, notifications and open files are easy to miss."),
        ],
      },
      {
        id: "cadence",
        heading: "A posting cadence you can keep",
        blocks: [
          p("Building in public works as a continuing story, so regularity matters more than frequency. A rhythm many people can sustain:"),
          ul(
            "**A few times a week**: small progress posts, a screenshot, a lesson or a question.",
            "**Weekly**: an update with what you shipped, one or two numbers, a struggle and what is next.",
            "**Monthly**: a numbers post or a longer thread on what you learned.",
            "**At milestones**: a launch, a first customer or a version release, with a thank-you to the people who helped.",
          ),
          p("Pick one day for your weekly update and stick to it, so followers know when to expect it. Scheduling helps: write the update when you have the numbers, and let a queue publish it at a time your audience is around. GrowX's [post scheduler](/features/twitter-post-scheduler) can queue posts and threads, with up to 10 waiting at once on the free plan, and its [analytics](/features/twitter-analytics) show which of your updates earn replies and which formats work best for you."),
        ],
      },
      {
        id: "formats",
        heading: "Formats that work for building in public",
        blocks: [
          ul(
            "**The weekly update**: the week number, a few metrics, what you shipped, what you struggled with and the plan for next week.",
            "**The milestone post**: what you reached, how long it took from idea to now, and who you want to thank.",
            "**The numbers post**: the key figures for a period, plus one thing you would do differently.",
            "**The shipped post**: the feature, why you built it and where to try it.",
            "**The lesson thread**: one mistake or insight, the story behind it and what others can take from it. The guide on [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread) helps with the structure.",
            "**The before-and-after**: two screenshots of a page, a product or a design, with a line on what changed and why.",
            "**The decision post**: two options you are choosing between, and a question for your audience.",
          ),
        ],
      },
      {
        id: "templates",
        heading: "Build in public templates in GrowX",
        blocks: [
          p("GrowX, a Chrome extension for growing on X, includes a **Build in public** category among its 52 post templates, alongside hooks, threads, lists, stories, lessons, questions and announcements. Its four build-in-public templates cover the most common formats: **Weekly update**, **Milestone**, **Numbers** and **Feature shipped**. The weekly update follows this structure (the template itself adds a small emoji to the metric and status lines):"),
          ul(
            "Week {week} of building {project}:",
            "{metric1}",
            "{metric2}",
            "Shipped: {shipped}",
            "Struggle: {struggle}",
            "Next week: {next}",
          ),
          p("You fill in the {placeholders}, and you can save your own variations as templates so a weekly update takes minutes. The same 52 templates are free to browse in the [tweet templates](/tools/tweet-templates) library on this site."),
          p("If you use GrowX AI (Premium), it can turn rough notes into a draft update in your voice, on your own computer. It leaves {placeholders} for numbers instead of inventing them, which matters when the whole point of building in public is honesty."),
        ],
      },
      {
        id: "pros-cons",
        heading: "The honest pros and cons of building in public",
        blocks: [
          p("Building in public is not right for every project or every person. The upsides:"),
          ul(
            "**Early feedback**: people tell you what they want before you spend months building the wrong thing.",
            "**An audience at launch**: people who watched you build already know what you made and why.",
            "**Accountability**: a public weekly update is a reason to ship something every week.",
            "**Relationships**: other builders find you, and peers become friends, testers and collaborators.",
            "**Something real to post about**: your work supplies the material, so you rarely run out of ideas.",
          ),
          p("And the downsides:"),
          ul(
            "**Competitors can watch**: sharing ideas, numbers and channels makes them easier to copy.",
            "**Pressure to perform**: slow months are visible, and it is tempting to post only good news.",
            "**Time**: writing updates takes time away from building, especially early on.",
            "**Audience mismatch**: other builders may cheer you on without ever being your customers.",
            "**It can become the project**: some people end up optimising for posts instead of the product.",
          ),
          p("A middle path suits many people: share progress, lessons and decisions openly, keep sensitive numbers and strategy private, and make sure some of your posts speak to your actual customers, not only to other builders. For the bigger picture of building an audience around your work, see [personal branding on Twitter](/blog/personal-branding-on-twitter) and the guide to [your first 1,000 followers on X](/blog/first-1000-followers-on-x)."),
        ],
      },
      {
        id: "try",
        heading: "Start building in public with GrowX",
        blocks: [
          p(`${TRY} Fill in the weekly update template, queue it for your best time and start telling your story.`),
        ],
      },
    ],
    faq: [
      {
        q: "What should I post when building in public?",
        a: "Progress you made, numbers you are comfortable sharing, lessons from what worked and what failed, decisions you are weighing, and launches or milestones. Concrete details make the posts worth reading.",
      },
      {
        q: "Do I have to share revenue to build in public?",
        a: "No. You choose which numbers to share, and many people share users, signups, ranges or growth instead of exact revenue. Share only what you would be comfortable with customers and competitors seeing.",
      },
      {
        q: "How often should I post build in public updates on X?",
        a: "A weekly update on a fixed day is a good backbone, with smaller progress posts in between when you have something to show. Regularity matters more than volume.",
      },
      {
        q: "Can building in public hurt my business?",
        a: "It can if you share sensitive data, confidential deals or strategy that competitors can copy. Check screenshots carefully and keep anything you might regret private.",
      },
      {
        q: "Is building in public only for startup founders?",
        a: "No. Writers, designers, developers, students and creators of all kinds share their process in public. The same rules apply: be concrete, be honest and respect other people's privacy.",
      },
    ],
  },
];
