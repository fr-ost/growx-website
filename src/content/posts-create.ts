import type { Block, Post } from "./posts";

/**
 * Create guides: scheduling posts, best time to post, writing threads and the on-device AI writer.
 * Same rules as posts.ts: every product claim matches docs/PRODUCT_FACTS.md (extension v2.4.4); no invented
 * statistics, studies, testimonials or result promises; no universal "best time" claims.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-29";

export const createPosts: Post[] = [
  {
    slug: "how-to-schedule-tweets",
    seoTitle: "How to Schedule Tweets on X (Twitter): A Practical Guide",
    title: "How to Schedule Tweets on X (Twitter): Native Options, Queue Slots and a Free Scheduler",
    description:
      "How to schedule tweets and posts on X (Twitter): native options, queue slots, threads and images, plus how the free GrowX scheduler works in Chrome.",
    excerpt:
      "Everything you need to schedule posts on X: what X offers itself, what a good Twitter scheduler must handle, and how GrowX schedules from your own Chrome.",
    category: "Create",
    keywords: [
      "how to schedule tweets",
      "schedule posts on X",
      "Twitter scheduler",
      "tweet scheduler free",
      "schedule a thread on X",
      "X post scheduler",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["best-time-to-post-on-twitter", "how-to-write-a-twitter-thread", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "intro",
        heading: "Why schedule tweets instead of posting live",
        blocks: [
          p("If you search **how to schedule tweets**, you probably already know the problem: good ideas arrive at the wrong time, and the weeks you are busiest are the weeks your account goes quiet. Scheduling fixes that. You write when you have energy, pick when each post should go out, and let a tool publish it for you. Your feed stays consistent even when your calendar is not."),
          p("This guide covers the options for scheduling posts on X (Twitter), what a good Twitter scheduler needs to handle, and a simple weekly routine that makes it stick. It also explains how the free scheduler in **GrowX**, a Chrome extension for X, works, including its limits, so you can decide whether it fits the way you work."),
        ],
      },
      {
        id: "native",
        heading: "Can you schedule posts on X itself?",
        blocks: [
          p("Depending on your account, X's own web composer may offer a schedule option (a small calendar icon next to the media buttons), and X Pro, the dashboard that replaced TweetDeck and is tied to a paid X subscription, has scheduling too. What is available has changed several times over the years and can differ by account type, so open the composer on x.com and check what yours shows."),
          p("Native scheduling is fine for the occasional post. Where it tends to fall short is everything around the single post: a queue you can fill in one sitting, reusable time slots, drafts and templates, a calendar view, and analytics that tell you which times actually worked. That is where a dedicated tweet scheduler earns its place."),
        ],
      },
      {
        id: "checklist",
        heading: "What a good Twitter scheduler needs to handle",
        blocks: [
          p("Before you pick a tool, free or paid, check it against the things that actually go wrong when posts are published without you watching:"),
          ul(
            "**Threads, not just single posts.** If you write threads, the scheduler must publish every part in order, each as a reply to the one before.",
            "**Images.** X allows up to four images per post, so your scheduler should too.",
            "**X's own character counting.** X counts every link as 23 characters, and most emoji and CJK characters as 2. A tool that counts differently can schedule a post that X will not accept as written.",
            "**A queue with time slots.** Picking a date and time for every post gets tedious. Slots let you add a post to the next free time without thinking about it.",
            "**Sensible behaviour when something goes wrong.** What happens if you were signed out, X showed a warning, or the post is hours late? A good scheduler holds back rather than firing off stale posts.",
            "**Where it runs and what it needs.** Some schedulers keep access to your X account on their servers. Others work inside your own browser. Know which one you are choosing and what that means for you.",
          ),
        ],
      },
      {
        id: "growx-steps",
        heading: "How to schedule a tweet with GrowX, step by step",
        blocks: [
          p("GrowX keeps posting in the **Create** area of its dashboard, and there is also a quick post box in the extension popup for one-off posts. Full details are on the [post scheduler page](/features/twitter-post-scheduler). To schedule a post:"),
          ol(
            "Install GrowX from the Chrome Web Store and make sure you are signed in to X in the same Chrome profile.",
            "Open the GrowX dashboard and go to **Create**.",
            "Write your post. The composer counts characters the way X does, so the number you see is the one X will apply. Add up to four images if you need them.",
            "Choose **Post now**, **Schedule** (pick a date and time) or **Add to queue** (GrowX uses the next free slot).",
            "Open the **calendar** to see what is going out and when, and edit anything that still needs work before it is published.",
          ),
          p("If you are not ready to commit to a time, save the post as a **draft**. If you keep writing the same kind of post, save it as one of your own templates, next to the 52 built-in templates for hooks, threads, lists and stories."),
        ],
      },
      {
        id: "queue",
        heading: "Queue slots: the easiest way to post consistently",
        blocks: [
          p("A queue is the difference between scheduling posts and running a posting schedule. Instead of choosing a time for each post, you define slots once, and every post you add drops into the next open one. GrowX's queue uses Buffer-style slots and starts with three a day, at 09:00, 13:00 and 18:30, every day. Treat those as placeholders and change them to the times your audience is actually active."),
          p("To find those times, GrowX has a **best time to post** heat map built from your own posts' engagement and from when your followers are active. We explain how to read it in [the best time to post on Twitter](/blog/best-time-to-post-on-twitter)."),
          note("On the free plan, up to 10 posts or threads can wait in the queue at once. That covers a few days of regular posting at a time; Premium removes the limit."),
        ],
      },
      {
        id: "threads",
        heading: "Scheduling threads and posts with images",
        blocks: [
          p("Threads are where a scheduler saves the most time, because posting a long thread by hand means writing, posting and replying to yourself over and over while the first part is already live. In GrowX you write the whole thread in the composer, up to 25 parts, and schedule or queue it like any other post. The **Thread it** splitter can break a long draft into parts that fit X's limit, and each part shows its own count."),
          p("If your account has X Premium (X's own subscription), you can write long posts of up to 25,000 characters, and the composer supports that too. Even then, many people prefer threads for step-by-step content, because each part can be read, liked and reposted on its own. For a full walkthrough see [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread), or paste a draft into the free [thread maker](/tools/twitter-thread-maker) to split it into numbered posts in your browser."),
        ],
      },
      {
        id: "computer",
        heading: "What happens if your computer is off",
        blocks: [
          p("This is the most important thing to understand about scheduling with GrowX, so here it is plainly: GrowX publishes through your signed-in x.com tab in Chrome. It never asks for your X password and does not keep your login on a server. That is good for privacy, but it means **your computer must be on and Chrome must be running** when a post is due."),
          ul(
            "If Chrome is closed or the computer is asleep at the scheduled time, the post cannot go out and waits.",
            "A post that ends up more than 6 hours late is **never posted by itself**. It waits as \"missed\" so you can decide whether to post it, reschedule it or delete it. A morning post about today's news should not appear at midnight.",
            "GrowX only posts as the X account a post was written for, so switching accounts in Chrome will not publish it under the wrong one.",
            "Posting has its own safety rules: a daily cap (20 posts by default), a minimum gap between posts (5 minutes) and an automatic pause if X shows any warning.",
          ),
          p("If you need posts to go out while your laptop is closed for days, a server-based scheduler or X's native option is the better fit. If your computer is on during the day anyway, scheduling from Chrome works well and keeps everything in your own browser."),
        ],
      },
      {
        id: "plans",
        heading: "Free and Premium scheduling in GrowX",
        blocks: [
          p("You can schedule posts and threads with GrowX for free, with up to 10 waiting in the queue at once. The Premium plan adds:"),
          ul(
            "**Unlimited scheduling**, so you can plan weeks ahead instead of a few days.",
            "**Evergreen recycling**: your best posts go out again every so many days (30 by default) with rotating variants, or are reposted, so good content keeps working.",
            "**Auto-plug**: once a post takes off (50 likes by default), GrowX replies to it with your call to action, such as your newsletter or product.",
            "**GrowX AI** for drafting, improving and threading posts on your own computer, covered in [our AI tweet writer guide](/blog/ai-tweet-writer-growx-ai).",
          ),
        ],
      },
      {
        id: "routine",
        heading: "A weekly batching routine for scheduled posts",
        blocks: [
          p("A scheduler only helps if there is a habit around it. A routine that works for many people:"),
          ol(
            "Once a week, block an hour to write. Aim for one post per queue slot you plan to fill, plus one thread.",
            "Read every draft aloud, cut filler and check that each post makes sense without extra context.",
            "Add the posts to the queue, then use the calendar to pin anything time-sensitive to a specific day.",
            "Leave room for live posts. Scheduled content keeps you consistent; reacting to your niche in real time is what makes you part of the conversation.",
            "At the end of the week, check which posts and which times did best, and adjust your slots.",
          ),
          note("Scheduling is not a substitute for being present. Check replies to your scheduled posts, especially soon after they go out, and answer the people who took the time to respond."),
        ],
      },
      {
        id: "try",
        heading: "Schedule your next week of posts",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including unlimited scheduling, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "Can I schedule tweets for free?",
        a: "Yes. Depending on your account, X's own composer may offer a basic schedule option, and GrowX lets you schedule for free with up to 10 posts or threads waiting in the queue at once. Unlimited scheduling is part of GrowX Premium.",
      },
      {
        q: "Do I need to keep my computer on for scheduled tweets to post?",
        a: "With GrowX, yes. It posts through your signed-in x.com tab in Chrome, so the computer and Chrome must be running, and a post more than 6 hours late waits as missed instead of going out by itself.",
      },
      {
        q: "Can I schedule a Twitter thread?",
        a: "Yes. In GrowX you write the whole thread, up to 25 parts, and schedule or queue it like a single post, with each part counted the way X counts characters.",
      },
      {
        q: "Can I schedule posts with images on X?",
        a: "Yes. GrowX supports up to four images per post, the same as X.",
      },
      {
        q: "Does GrowX need my X password to schedule posts?",
        a: "No. GrowX works inside your own signed-in x.com session in Chrome. It never asks for your X password and does not use X OAuth.",
      },
    ],
  },
  {
    slug: "best-time-to-post-on-twitter",
    seoTitle: "Best Time to Post on Twitter (X): How to Find Yours",
    title: "The Best Time to Post on Twitter (X): Why There Is No Universal Answer and How to Find Yours",
    description:
      "What is the best time to post on Twitter (X)? Why generic charts mislead, how to test your own posting times and how GrowX maps them from your own data.",
    excerpt:
      "There is no single best time to post on X for everyone. Here is how to find the best time for your own audience and turn it into a posting schedule.",
    category: "Create",
    keywords: [
      "best time to post on Twitter",
      "best time to post on X",
      "when to tweet",
      "best time to tweet",
      "Twitter posting schedule",
      "X engagement by time",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-schedule-tweets", "how-to-grow-on-twitter-x", "first-1000-followers-on-x"],
    sections: [
      {
        id: "intro",
        heading: "Is there a best time to post on Twitter?",
        blocks: [
          p("Search for the **best time to post on Twitter** and you will find confident charts naming a precise hour and day. The trouble is that each chart disagrees with the next, and none of them was built from your audience. The honest answer is that there is no universal best time to post on X. There is a best time for **your** account, and you can find it with a few weeks of deliberate testing."),
          p("This guide explains why generic advice misleads, which timing patterns are worth testing, how to run a simple experiment on your own posts, and how **GrowX** helps by turning your own data into a heat map and your best times into queue slots."),
        ],
      },
      {
        id: "why-generic",
        heading: "Why generic best-time charts mislead",
        blocks: [
          p("Most best-time charts are averages across many accounts. Averages hide exactly the things that decide when your posts do well:"),
          ul(
            "**Where your followers live.** A creator with a mostly European audience and one with a mostly American audience can have very different best hours, even if they post about the same topic.",
            "**What your niche does all day.** Developers, parents, traders, students and sports fans are online at different times and in different moods.",
            "**How X shows posts.** Much of what people read comes through the algorithmic For You feed, so a post can keep finding readers for hours after it goes out. The exact minute you post matters less than old advice suggests.",
            "**Your account's size and history.** A small account's first hour depends on a handful of followers being online. A large account has someone online at almost any hour.",
          ),
          p("So treat any chart, including the patterns in this article, as a starting hypothesis to test, not a rule to follow."),
        ],
      },
      {
        id: "what-timing-changes",
        heading: "What posting time actually changes",
        blocks: [
          p("Timing matters because early engagement matters. When a post gets replies, likes and reposts soon after it is published, more people tend to see it. If you post while most of your followers are asleep, the first readers are few, and the post can stall before the people who would enjoy it ever see it."),
          p("But timing is a multiplier, not the main ingredient. A strong post at an ordinary time usually beats a weak post at the perfect time. Fix the content first, with a clear hook and one idea per post, then use timing to give your good posts a fairer start."),
        ],
      },
      {
        id: "patterns",
        heading: "Patterns worth testing (not rules)",
        blocks: [
          p("Without promising anything, these are patterns many accounts notice when they look at their own numbers. Use them to decide what to test first:"),
          ul(
            "**Work-day rhythms.** Many accounts with professional audiences see more activity around the start of the work day, at lunch and in the early evening, and quieter weekends.",
            "**Evenings and weekends for hobbies.** Accounts about games, sport, entertainment or side projects often find their audience more active outside working hours.",
            "**Live moments.** If your niche reacts to events such as launches, matches, earnings or conferences, the best time is while it is happening, which no fixed schedule can predict.",
            "**Consistency itself.** Posting at roughly the same times each week helps regular readers find you, and it makes your results easier to compare.",
          ),
        ],
      },
      {
        id: "experiment",
        heading: "How to find your own best time to tweet",
        blocks: [
          p("You do not need a data team to answer **when to tweet**. You need a few weeks, comparable posts and a simple comparison:"),
          ol(
            "**Check where your audience is.** Look at who follows and engages with you. If most of them share one or two time zones, plan around their day, not yours.",
            "**Pick three or four time windows to test**, for example morning, midday, early evening and late evening in your audience's time zone.",
            "**Rotate posts across those windows** for two to four weeks. Keep the content comparable, and do not save all your best posts for one slot.",
            "**Compare engagement rate, not raw likes.** Engagement rate divides engagements by views, so it adjusts for how many people saw each post and one viral post does not distort the picture.",
            "**Look at days, not just hours.** Some accounts have a clear weekday and weekend split.",
            "**Keep the winners and keep testing one new slot.** Audiences change, so re-check every month or two.",
          ),
          note("Small accounts have noisy data. If you post a few times a week, give the test more weeks before you trust the result."),
        ],
      },
      {
        id: "heatmap",
        heading: "Using the GrowX best-time heat map",
        blocks: [
          p("Doing this by hand means copying numbers into a spreadsheet. GrowX does the bookkeeping for you. Its **Best time to post** view is a heat map of the week by 24 hours, built from two things: your own posts' engagement, and when your followers are active. The brighter cells are hours that have worked for you, not for an average account."),
          p("The numbers come from GrowX's [post analytics](/features/twitter-analytics), which reads views, likes, reposts, replies, bookmarks and engagement rate for your recent posts every 3 hours while x.com is open in Chrome. On the free plan it covers your latest 30 posts. The **What works** view answers the other half of the question: which topics and formats, such as questions, images, threads or links, earn the most engagement for you."),
          ul(
            "Use the heat map to choose which windows to test, then to confirm the winners.",
            "Read it together with What works, because a format that does well at one time may not do well at another.",
            "Expect the map to become more useful as you post more; a handful of posts only gives a rough picture.",
          ),
        ],
      },
      {
        id: "queue-slots",
        heading: "Turn your best times into queue slots",
        blocks: [
          p("Knowing your best times only helps if you actually post then. That is what queue slots are for. GrowX's queue starts with three slots a day, at 09:00, 13:00 and 18:30. Replace them with the hours your heat map highlights, then use **Add to queue** and each new post drops into the next open slot. The [post scheduler](/features/twitter-post-scheduler) also has a calendar for anything that needs a fixed date."),
          p("Scheduled posts go out through your signed-in x.com tab, so Chrome and your computer need to be on at those times. Pick slots when your computer is usually awake. Our guide on [how to schedule tweets](/blog/how-to-schedule-tweets) covers the details, including what happens to a post that is running late."),
        ],
      },
      {
        id: "timezones",
        heading: "Time zones and global audiences",
        blocks: [
          p("If your followers are spread across continents, there may be no single best hour. Two approaches work:"),
          ul(
            "**Pick a primary audience** and post for their day, accepting that everyone else will catch your posts later through the feed.",
            "**Spread your slots** so different regions get a post during their waking hours, then check the heat map to see whether one region responds more.",
          ),
          p("Whichever you choose, write down your slot times in your audience's time zone as well as your own, so you do not accidentally schedule everything for the middle of their night. And keep posting between tests: a steady account with average timing grows; a perfectly timed account that posts once a month does not."),
        ],
      },
      {
        id: "try",
        heading: "Find your best time with your own data",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "What is the best time to post on Twitter?",
        a: "There is no single best time for every account. It depends on where your followers live, your niche and how X's feed surfaces your posts, so the reliable answer comes from testing your own posting times and comparing engagement rate.",
      },
      {
        q: "What is the best day to post on X?",
        a: "It varies by audience. Many accounts with professional audiences are busier on weekdays, while hobby and entertainment accounts often do well at weekends, so compare your own weekday and weekend posts before deciding.",
      },
      {
        q: "How often should I tweet?",
        a: "As often as you can while keeping quality up. A steady rhythm, such as one or two useful posts a day plus replies, usually matters more than volume.",
      },
      {
        q: "Does posting time still matter with the For You feed?",
        a: "Less than it used to, because posts can keep reaching people for hours. Early engagement still helps, so posting while your followers are awake gives a post a better start.",
      },
      {
        q: "How does GrowX find my best time to post?",
        a: "GrowX builds a week by 24-hour heat map from your own posts' engagement and from when your followers are active. You can then set your queue slots to those hours.",
      },
    ],
  },
  {
    slug: "how-to-write-a-twitter-thread",
    seoTitle: "How to Write a Twitter Thread on X: Hooks & Structure",
    title: "How to Write a Twitter Thread People Finish: Hooks, Structure, Numbering and Splitting",
    description:
      "How to write a Twitter (X) thread: hooks, a reusable structure, numbering, X's character counting and scheduling, plus the GrowX thread splitter.",
    excerpt:
      "A practical guide to writing X threads: a hook that earns the click, a structure you can reuse, numbering, splitting by X's character rules and scheduling.",
    category: "Create",
    keywords: [
      "how to write a Twitter thread",
      "Twitter thread maker",
      "X thread",
      "how to make a thread on X",
      "thread hooks",
      "Twitter thread template",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["ai-tweet-writer-growx-ai", "how-to-schedule-tweets", "best-time-to-post-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "What makes a Twitter thread worth reading",
        blocks: [
          p("A thread is a series of posts on X (Twitter) linked as replies to each other, so they read top to bottom like a short article. Threads suit anything that needs more room than one post: a step-by-step process, a story, a breakdown of something you learned or a list of resources. Done well, they show expertise in a way single posts rarely can. Done badly, people stop reading after the first post."),
          p("This guide covers **how to write a Twitter thread** people finish: the hook, a structure you can reuse, numbering, splitting text the way X counts characters, and scheduling. Along the way we show where **GrowX**, a Chrome extension for X, saves time, and which free tools you can use without installing anything."),
        ],
      },
      {
        id: "hook",
        heading: "Start with a hook that earns the click",
        blocks: [
          p("The first post decides everything, because it is the only part most people see in their feed. A good hook makes a specific promise and gives a reason to open the thread now. Patterns that work across many niches:"),
          ul(
            "**The result plus the method:** \"I rewrote our onboarding emails three times. Here is what finally worked:\"",
            "**The list promise:** \"7 mistakes from my first year of freelancing, so you can skip them:\"",
            "**The contrarian take:** \"Most advice about cold email is backwards. A thread:\"",
            "**The story opener:** \"Our only server went down in the middle of a launch. What happened next changed how we build.\"",
            "**The resource:** \"The free tools I use to run a one-person business, by category:\"",
          ),
          p("Be specific and honest. If the hook promises seven mistakes, deliver seven, and never claim results you cannot back up. A hook that overpromises gets clicks and loses followers."),
        ],
      },
      {
        id: "structure",
        heading: "A simple thread structure you can reuse",
        blocks: [
          p("Most good threads follow the same shape. Use it as a skeleton and fill it in:"),
          ol(
            "**Hook (post 1):** the promise. One clear idea, no warm-up.",
            "**Context (post 2):** why this matters, or why you are in a position to say it, in a sentence or two.",
            "**Body (post 3 onwards):** one point per post. Each post should make sense if someone sees it alone, because people reply to and repost individual parts.",
            "**Recap:** a short summary of the key points for people who skimmed.",
            "**Call to action (last post):** ask for a follow, a repost of the first post or a reply, or point to your newsletter or product. One ask, not five.",
          ),
          p("If the hook feels hard, write the body first. Once you know what the thread actually says, the honest hook is usually obvious."),
        ],
      },
      {
        id: "numbering",
        heading: "Numbering and formatting",
        blocks: [
          p("Numbering tells readers how long the thread is and where they are in it. Common styles:"),
          ul(
            "**1/, 2/, 3/** at the start or end of each post: simple and familiar.",
            "**1/7, 2/7**: shows the total, which can encourage people to finish a short thread. It also means renumbering everything if you add a part, so decide the length first.",
            "**A thread emoji in the first post** to signal that more is below. Remember that most emoji count as 2 characters on X.",
          ),
          p("Keep formatting light: short paragraphs, line breaks between ideas, and a list where it genuinely helps. Walls of text are hard to read on a phone, which is where many people will see your thread."),
        ],
      },
      {
        id: "splitting",
        heading: "Splitting text the way X counts characters",
        blocks: [
          p("Standard posts on X are limited to 280 characters, and X does not count every character the same way. This catches people out when they split a draft by hand:"),
          ul(
            "**Every link counts as 23 characters**, however long or short the URL is, because X shortens it.",
            "**Most emoji and CJK characters** (Chinese, Japanese and Korean) **count as 2.**",
            "**Accounts with X Premium**, X's own subscription, can write long posts of up to 25,000 characters. Threads are still useful for step-by-step content, since each part can be read, liked and reposted on its own.",
          ),
          p("When you split, break at sentence or paragraph boundaries rather than mid-sentence, and leave room for your numbering. The free [tweet character counter](/tools/tweet-character-counter) checks a post against X's rules, and the free [Twitter thread maker](/tools/twitter-thread-maker) splits a long text into numbered posts right in your browser."),
        ],
      },
      {
        id: "length",
        heading: "How long should a thread be?",
        blocks: [
          p("As long as the content needs and no longer. Plenty of strong threads are well under ten posts. If yours is heading past fifteen, check whether it is really two threads, or whether some posts repeat each other. Cutting the weakest parts almost always makes a thread better, and a reader who finishes a short thread is more likely to follow you than one who abandons a long one."),
          p("GrowX supports threads of up to 25 parts, which covers even long tutorials, but treat that as a ceiling, not a target."),
        ],
      },
      {
        id: "growx",
        heading: "Writing threads faster with GrowX",
        blocks: [
          p("Writing a thread directly in X's composer works, but editing the middle of a long thread there is awkward. The GrowX composer, in the **Create** area of the dashboard, is built for drafting threads:"),
          ul(
            "Write the whole thread in one place, **up to 25 parts**, each with its own character count using X's rules, and up to four images per post.",
            "Paste a long draft and use **Thread it** to split it into parts that fit. With [GrowX AI](/features/ai-tweet-writer) (Premium) available, Thread it can also help shape the draft into a thread; otherwise the plain splitter does the job.",
            "Start from one of the **52 templates** for hooks, threads, lists and stories, or save your own structure as a template.",
            "Keep unfinished threads as **drafts** and come back to them later.",
          ),
        ],
      },
      {
        id: "schedule",
        heading: "Scheduling and publishing a thread",
        blocks: [
          p("Threads take time to write, so it pays to publish them when your audience is around. In GrowX you can **Post now**, **Schedule** a thread for a specific time, or **Add to queue** so it goes out in the next free slot. The [post scheduler](/features/twitter-post-scheduler) page explains the queue and the calendar."),
          p("Two practical points. First, scheduled posts are published through your signed-in x.com tab in Chrome, so your computer must be on at the scheduled time; a post more than 6 hours late waits as \"missed\" rather than going out by itself. Second, stay around after a thread goes out. Replying to the first comments keeps the conversation going, and it is a good habit in its own right."),
        ],
      },
      {
        id: "mistakes",
        heading: "Thread mistakes to avoid",
        blocks: [
          ul(
            "A vague hook such as \"Some thoughts on marketing:\" that gives nobody a reason to click.",
            "Padding: posts that only say \"Let's dive in\" or repeat the previous point in different words.",
            "Posts that make no sense on their own, so a repost of part four confuses everyone who sees it.",
            "Burying the best point at the end. Put a strong point early so the people who stop reading still get value.",
            "A crowded first post. Many writers keep links out of the hook so it stays short and clear, and add them later in the thread.",
            "Asking for five different things at the end. Pick one call to action.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Write your next thread with GrowX",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including GrowX AI, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "How many posts can a Twitter thread have?",
        a: "In GrowX, a thread can have up to 25 parts. Most good threads are much shorter, so cut any part that repeats another.",
      },
      {
        q: "How do I number a Twitter thread?",
        a: "Add 1/, 2/, 3/ to each post, or 1/7, 2/7 if you want to show the total length. Decide the length before numbering so you do not have to renumber later.",
      },
      {
        q: "How many characters can each post in a thread have?",
        a: "Standard X posts allow 280 characters, with every link counted as 23 and most emoji and CJK characters counted as 2. Accounts with X Premium can write longer posts.",
      },
      {
        q: "Can I schedule a thread on X?",
        a: "Yes. GrowX lets you schedule or queue a whole thread and publishes it through your signed-in x.com tab while Chrome is running.",
      },
      {
        q: "Is there a free Twitter thread maker?",
        a: "Yes. The GrowX website has a free thread maker that splits long text into numbered posts in your browser, and a free tweet character counter that follows X's counting rules.",
      },
    ],
  },
  {
    slug: "ai-tweet-writer-growx-ai",
    seoTitle: "AI Tweet Generator: Write Tweets With On-Device AI",
    title: "AI Tweet Writer: How to Write Better Tweets With AI, Privately, Using GrowX AI",
    description:
      "An AI tweet generator that runs on your computer: how GrowX AI writes, improves and threads X (Twitter) posts privately in Chrome, and its honest limits.",
    excerpt:
      "How to write tweets with AI without losing your voice or your facts, and how GrowX AI does it on your own computer with the AI model built into Chrome.",
    category: "Create",
    keywords: [
      "AI tweet generator",
      "AI tweet writer",
      "write tweets with AI",
      "AI Twitter post generator",
      "on-device AI writer",
      "AI thread writer",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-write-a-twitter-thread", "how-to-schedule-tweets", "best-twitter-growth-tools"],
    sections: [
      {
        id: "intro",
        heading: "What an AI tweet writer is good for",
        blocks: [
          p("An **AI tweet generator** can take a rough idea and give you a first draft, a handful of alternative hooks or a tighter version of a post you already wrote. Used well, it removes the blank-page problem and speeds up editing. Used badly, it fills your feed with generic posts that sound like everyone else's, or with confident claims nobody checked."),
          p("This guide explains how to write tweets with AI in a way that keeps your voice and your facts intact, and how **GrowX AI**, the writing assistant inside the GrowX Chrome extension for X (Twitter), works: what it does, why it runs on your own computer, and where its limits are."),
        ],
      },
      {
        id: "on-device",
        heading: "GrowX AI runs on your computer, not in the cloud",
        blocks: [
          p("Many AI tweet writers send your drafts to a cloud service, and some ask you to paste in an API key and pay for what you use. GrowX AI works differently. It uses **the AI model built into Chrome** and runs on your own computer."),
          ul(
            "**Private:** your drafts are processed on your machine, and nothing is sent to GrowX.",
            "**No API key:** there is nothing extra to sign up for or paste in, and no pay-per-use bill.",
            "**Your voice:** it uses the niche and voice settings you give GrowX, so suggestions start closer to how you actually write.",
            "**One download:** the first time, Chrome downloads the model once; after that it is ready when you open the composer.",
          ),
        ],
      },
      {
        id: "features",
        heading: "What GrowX AI can do",
        blocks: [
          p("GrowX AI shows up where you already work: in the composer in **Create** and next to your reply targets in **Engage**."),
          ul(
            "**Write:** turn a topic or a few notes into a draft post.",
            "**Improve:** tighten a draft you wrote so it is clearer and shorter without changing the point.",
            "**Hooks:** suggest alternative opening lines, which is especially useful for the first post of a thread.",
            "**Thread it:** shape a long draft into a thread whose parts fit X's character counting.",
            "**Reply ideas:** suggest replies to fresh posts in your [reply targets](/features/twitter-reply-targets). Nothing is sent by itself: you choose, edit and press the button.",
            "**Weekly summary:** a short recap to help you review your week on X.",
          ),
          p("For a feature overview, see the [AI tweet writer](/features/ai-tweet-writer) page."),
        ],
      },
      {
        id: "placeholders",
        heading: "It never invents facts: how {placeholders} work",
        blocks: [
          p("The biggest risk with any AI writer is made-up detail: a statistic, a client name or a result that never happened. Posting that on X under your name damages trust quickly. GrowX AI is built not to invent facts. Where a post needs a specific number, name or result, it leaves a placeholder in curly braces for you to fill in."),
          p("For example, a draft might read: \"I cut our support backlog from {number} to {number} tickets a week by changing one thing: {what you changed}.\" You replace each placeholder with the real detail, or rewrite the sentence if you do not have one. That keeps the post true, and true specifics are what make posts worth reading anyway."),
          note("If you post a draft with a {placeholder} still in it, everyone will notice. Search your draft for curly braces before you schedule it."),
        ],
      },
      {
        id: "limits",
        heading: "Requirements and honest limits",
        blocks: [
          p("Running AI on your own computer has trade-offs, and it is better to know them up front:"),
          ul(
            "**It needs a recent desktop version of Chrome** on a computer with enough memory and free disk space for the model. GrowX is a desktop extension, so there is no mobile version.",
            "**If the built-in model is not available** on your computer, the AI buttons fall back to GrowX's templates and the plain thread splitter. You can still write and split threads, just without AI suggestions.",
            "**It is a writing aid, not an autopilot.** Read and edit every draft before you post. You know your audience, your facts and your tone; the model only suggests.",
            "**Suggestions can be generic.** If a draft sounds like anyone could have written it, add a detail only you know, or ask for another version.",
            "**It is part of GrowX Premium.** You can use it free during the 30-day Premium trial and then decide; see [pricing](/pricing).",
          ),
        ],
      },
      {
        id: "workflow",
        heading: "A workflow: from idea to scheduled post",
        blocks: [
          ol(
            "Collect raw ideas during the week: things you learned, questions people asked you, mistakes you made and fixed.",
            "In the GrowX composer, use **Write** on one idea to get a first draft, or type your own rough version.",
            "Use **Hooks** to see a few different openings and pick the most specific one.",
            "Fill every {placeholder} with a real detail, then use **Improve** to tighten the wording.",
            "For bigger ideas, use **Thread it**, then check that each part reads well on its own.",
            "Edit the final version by hand, read it aloud, and post it, schedule it or add it to your queue.",
          ),
          p("A good post usually needs two or three passes. The AI saves time on the first draft and on the variations; the final edit is yours. If you write threads often, our guide on [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread) covers structure and numbering in detail."),
        ],
      },
      {
        id: "editing",
        heading: "How to edit an AI draft before you post",
        blocks: [
          p("Whatever tool wrote the first version, run every draft through the same short checklist before it goes anywhere near your feed:"),
          ol(
            "**Is it true?** Every number, name and claim should be something you can stand behind. Delete anything you cannot.",
            "**Is it specific?** Swap general words for concrete ones: the tool you used, the step you took, the mistake you made.",
            "**Does it sound like you?** Read it aloud. If you would never say a phrase out loud, rewrite it in your own words.",
            "**Is the first line doing its job?** Readers decide from the opening line whether to keep reading, so put the most interesting part there.",
            "**Can anything go?** Cut filler openers, stacked adjectives and hashtags that add nothing. Shorter is usually clearer.",
            "**Does it fit?** Check the length against X's counting, where links count as 23 characters and most emoji as 2. The free [tweet character counter](/tools/tweet-character-counter) does this for you.",
          ),
          p("This takes a minute or two per post, and it is the step that turns a generic AI draft into something your followers will actually want to read."),
        ],
      },
      {
        id: "habits",
        heading: "Habits that get better AI-written tweets",
        blocks: [
          ul(
            "**Feed it specifics.** \"Three things I learned shipping a Chrome extension\" gets a better draft than \"productivity tips\".",
            "**Set your niche and voice once** in GrowX so every suggestion starts in the right place.",
            "**One idea per post.** If a draft tries to say three things, split it or cut two of them.",
            "**Keep your own stories.** AI can help structure a story; it cannot live it for you. Personal experience is a big part of why people follow an account.",
            "**Do not automate conversations.** Reply ideas are a starting point. Generic replies sent at volume look like spam and build no relationships, which is why GrowX never posts a reply by itself.",
            "**Read it as your audience would.** Before it goes out, read the final text once more from a follower's point of view, and make sure it is something you are happy to have your name on.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Try GrowX AI free",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including GrowX AI, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "Is GrowX AI free?",
        a: "GrowX AI is a Premium feature, and you can use it free during the 30-day Premium trial with no credit card. It needs no API key and has no per-use charges, because it runs on the AI model built into Chrome.",
      },
      {
        q: "Does GrowX AI send my drafts to a server?",
        a: "No. It runs on your own computer using the AI model built into Chrome, and nothing is sent to GrowX.",
      },
      {
        q: "Why do the AI buttons show templates instead of AI suggestions?",
        a: "That happens when Chrome's built-in model is not available on your computer, for example on an older Chrome version or a machine without enough memory or disk space. GrowX then falls back to templates and the plain thread splitter.",
      },
      {
        q: "Can AI write a whole Twitter thread for me?",
        a: "GrowX AI can draft a thread and shape it with Thread it, but you should edit every part and fill in the real details. It leaves {placeholders} instead of inventing facts.",
      },
      {
        q: "Will GrowX AI post or reply for me automatically?",
        a: "No. It only suggests text. You decide what to post, and replies are sent only when you press the button.",
      },
    ],
  },
];
