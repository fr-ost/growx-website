import type { Block, Post } from "./posts";

/**
 * Insights and Engage guides: unfollower tracking, reading X (Twitter) analytics, replying and engagement.
 * Same rules as posts.ts: every product claim matches docs/PRODUCT_FACTS.md (extension v2.4.4); no invented
 * statistics, studies, testimonials or result promises. Example numbers are labelled as made up.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-29";
const TRY =
  "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed.";

export const insightPosts: Post[] = [
  {
    slug: "who-unfollowed-me-on-twitter",
    seoTitle: "Who Unfollowed Me on Twitter? How to See It on X",
    title: "Who Unfollowed Me on Twitter? How to See Who Unfollowed You on X and What to Do About It",
    description:
      "Who unfollowed me on Twitter? X won't tell you. See how an unfollower tracker like GrowX shows who unfollowed you on X, and what to do with that list.",
    excerpt:
      "X doesn't tell you who unfollowed you, but a daily comparison of your follower list can. Here is how unfollower trackers work, where they can mislead you, and what to do with the names you see.",
    category: "Insights",
    keywords: [
      "who unfollowed me on Twitter",
      "see who unfollowed you on X",
      "Twitter unfollower tracker",
      "X unfollower tracker",
      "Twitter unfollowers",
      "follower tracker",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["twitter-analytics-guide", "unfollow-non-followers-twitter", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "no-notification",
        heading: "Does X tell you who unfollowed you?",
        blocks: [
          p("Short answer: no. X sends a notification when someone new follows you, but nothing when someone leaves. The only built-in sign is your follower count going down, and that number does not say who left or when. If you have ever searched **who unfollowed me on Twitter**, you probably noticed the count drop after a post and wondered whether it was something you said."),
          p("You could check by hand: save a copy of your follower list today and compare it with tomorrow's. That works for an account with fifty followers. Past a few hundred it turns into an afternoon of scrolling, because X only loads the list a page at a time. Doing that comparison for you, every day, is the whole job of a **Twitter unfollower tracker**."),
        ],
      },
      {
        id: "how-trackers-work",
        heading: "How a Twitter unfollower tracker works",
        blocks: [
          p("Every unfollower tracker, GrowX included, works the same basic way, because X offers no list of unfollows to read. It takes a snapshot of your full follower list, waits, takes another snapshot and compares the two."),
          ul(
            "**In the new list but not the old one**: a new follower.",
            "**In the old list but not the new one**: someone who no longer follows you.",
          ),
          p("That second group is an inference, not a message from X, so it can include accounts that never pressed unfollow:"),
          ul(
            "Accounts that were **suspended** by X or **deactivated** by their owner also disappear from your follower list.",
            "People you removed as followers or blocked yourself drop off the list too.",
            "Comparing incomplete lists would make people who simply were not loaded look like unfollowers, which is why a tracker needs the complete list each time.",
          ),
          p("Keep this in mind before you react to a name. Open the profile first: if X says the account does not exist or is suspended, that person did not unfollow you."),
        ],
      },
      {
        id: "growx-tracker",
        heading: "How GrowX shows who unfollowed you on X",
        blocks: [
          p("GrowX is a Chrome extension for X (Twitter). Its **Follower tracker** lives in the Insights area of the dashboard. Once a day it compares your full follower list with the previous one and shows two lists: who followed you and who **unfollowed** you."),
          ul(
            "**It reads through an x.com tab that is already open**, in your own signed-in session, one small step per minute at most. It never asks for your X password.",
            "**Free plan**: 7 days of follower history, enough to connect a drop to last week's posts.",
            "**Premium**: the full follower history, plus **one-click unfollow back** when you decide someone who left should not stay in your following list either.",
            "**Your data stays in your browser.** The history is stored locally in Chrome, not uploaded to GrowX.",
          ),
          p("The [unfollower tracker feature page](/features/twitter-unfollower-tracker) has the details."),
        ],
      },
      {
        id: "not-personal",
        heading: "Why people unfollow (it is rarely about you)",
        blocks: [
          p("Seeing a familiar name on the unfollow list stings. Before you draw conclusions, remember the ordinary reasons people leave:"),
          ul(
            "They are cleaning up their own following list, often with a tool that removes everyone who does not follow back.",
            "They followed you hoping for a follow back and left when it did not come.",
            "Your topic drifted away from the reason they followed in the first place.",
            "They took a break, deactivated or moved to a different account.",
            "They saw more of you in their timeline than they wanted on a busy day.",
          ),
          p("None of these calls for a reaction. Do not message people to ask why they left, do not post about unfollowers, and do not change your whole voice because of one name. One unfollow is noise. A pattern is information."),
        ],
      },
      {
        id: "baseline",
        heading: "Know your normal before you worry",
        blocks: [
          p("Every account loses some followers, even while it grows. Before you treat any day as a bad one, find your normal. Let the tracker run for a week or two and note the usual daily range of new followers and unfollowers. A day with a few more unfollows than usual is not a signal. A day with several times your usual number is worth a closer look."),
          p("Watch the net figure as well as the unfollows. The more you post, the more people you reach, and some of them will decide you are not for them. That is a healthy trade as long as new followers keep outpacing the people who leave. The growth chart in GrowX Insights shows the overall trend, so one noisy day does not distract you from the direction you are heading."),
        ],
      },
      {
        id: "patterns",
        heading: "Look for patterns after your posts",
        blocks: [
          p("The useful question is not who left but **when** people leave and what you posted just before. Because GrowX compares lists daily, you can line up each day's unfollows with that day's posts."),
          ol(
            "Note the days where unfollows are clearly above your normal level.",
            "Look at what you posted in the 24 hours before: topic, format and how many posts.",
            "Check whether the same kind of post shows up before several bad days, for example off-topic opinions, a run of promotional posts or an unusually busy posting day.",
            "Compare with new followers on the same days. A post that loses a few followers and brings in many more is usually worth it.",
            "Change one thing at a time and watch the following week.",
          ),
          p("With Premium, the **weekly report** does part of this for you: this week against last week for new followers, unfollowers and best posts, as a notification every Monday. The [Twitter analytics guide](/blog/twitter-analytics-guide) explains how to read the rest of your numbers."),
        ],
      },
      {
        id: "unfollow-back",
        heading: "Should you unfollow back?",
        blocks: [
          p("Sometimes. If someone followed you, you followed back as a courtesy and they left soon after, there is little reason to keep following them. Unfollowing back also keeps your following-to-followers ratio healthy and leaves room under X's following limits."),
          p("Do not make it automatic, though. Keep the people you follow for their content: customers, friends and creators you learn from, whether or not they follow you. With GrowX Premium you can unfollow back in one click from the tracker, and only when you click. For a wider tidy-up of everyone who never followed back, use the cleanup scan described in [how to unfollow non-followers safely](/blog/unfollow-non-followers-twitter)."),
        ],
      },
      {
        id: "quality",
        heading: "Follower quality matters more than the count",
        blocks: [
          p("Not every unfollow is a loss. Your follower count includes inactive accounts and some bots, and when those leave or are removed by X, the number drops while your real audience stays the same. A count that grows slowly with real, active people is worth more than a big number nobody behind it reads."),
          p("GrowX Premium includes a **follower quality** check: on request, it sorts your newest followers into real and active, inactive (90 days or more), likely bot and private. If many of your recent followers are inactive or likely bots, losing some of them is just your list correcting itself. If real, active followers are leaving, look harder at your recent posts."),
          note("A tracker tells you who is gone, not why. Treat the list as a prompt to look at your own posts, never as a verdict on any one person."),
        ],
      },
      {
        id: "try",
        heading: "Track your unfollowers with GrowX",
        blocks: [
          p(`${TRY} The free plan already shows who unfollowed you over the last 7 days; compare plans on the [pricing page](/pricing).`),
        ],
      },
    ],
    faq: [
      {
        q: "Does Twitter notify you when someone unfollows you?",
        a: "No. X notifies you about new followers but not about unfollows. The only built-in sign is a lower follower count, which does not say who left.",
      },
      {
        q: "Can I see who unfollowed me on X without a tool?",
        a: "Only by saving your follower list and comparing it with a later copy by hand, which is practical for small accounts only. An unfollower tracker automates exactly that comparison.",
      },
      {
        q: "Why does someone show up as an unfollower when they did not unfollow me?",
        a: "Trackers infer unfollows by comparing follower lists, so accounts that were suspended or deactivated, or that you removed or blocked, also disappear. Open the profile to check before you react.",
      },
      {
        q: "Is it safe to use a Twitter unfollower tracker?",
        a: "No tool can promise zero risk on X, and you should avoid any tracker that asks for your X password. GrowX works in your signed-in session, reads through an x.com tab that is already open at a slow pace, and the tracker only unfollows someone back when you click.",
      },
      {
        q: "How far back can GrowX show my unfollowers?",
        a: "The free plan keeps 7 days of follower history. Premium keeps the full history and adds one-click unfollow back.",
      },
    ],
  },
  {
    slug: "twitter-analytics-guide",
    seoTitle: "Twitter Analytics Guide: How to Read X Analytics",
    title: "Twitter Analytics Guide: How to Read X Analytics and Turn the Numbers Into Better Posts",
    description:
      "A practical Twitter analytics guide: the X metrics that matter, how to work out engagement rate and how GrowX shows which posts brought you followers.",
    excerpt:
      "Which X metrics matter, how to calculate engagement rate, and a simple weekly routine for turning your Twitter analytics into better posts.",
    category: "Insights",
    keywords: [
      "Twitter analytics",
      "X analytics",
      "how to read Twitter analytics",
      "engagement rate",
      "Twitter engagement rate",
      "Twitter post analytics",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-increase-twitter-engagement", "who-unfollowed-me-on-twitter", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "intro",
        heading: "What Twitter analytics are for",
        blocks: [
          p("Most people open **Twitter analytics** to check whether yesterday's post did well, feel good or bad about the view count, and close the tab. That is the least useful way to use them. Analytics on X are worth reading for one reason: to decide what to post next. Every number in this guide is judged by that test."),
          p("You can read your numbers in several places: under each post on X, in X's own analytics screens (what they show depends on your account), or in a tool such as **GrowX**, a Chrome extension that collects your post numbers into one Insights dashboard. The ideas below work wherever your numbers come from."),
        ],
      },
      {
        id: "metrics",
        heading: "The X analytics metrics that matter",
        blocks: [
          ul(
            "**Views**: how many times a post was shown. This is reach, not interest. A big view count with few interactions means many people scrolled past.",
            "**Likes**: the lightest signal of approval. Useful in volume, but cheap to give.",
            "**Reposts**: people putting your post in front of their own followers. Reposts are how posts travel beyond your audience.",
            "**Replies**: conversation. A post with real replies is starting discussions, and answering them keeps the thread alive.",
            "**Bookmarks**: people saving a post to come back to. Many bookmarks usually mean the post was useful: a checklist, a how-to or a resource.",
            "**Engagement rate**: interactions per view. The one number that lets you compare posts with very different reach.",
          ),
          p("Follower numbers sit next to these: new followers, unfollowers and growth over time. They answer a different question, which is whether your posts are building an audience or only entertaining the one you already have."),
        ],
      },
      {
        id: "engagement-rate",
        heading: "How to calculate engagement rate",
        blocks: [
          p("Engagement rate is interactions divided by views. Add up the likes, reposts, replies and bookmarks on a post, divide by its views and multiply by 100 to get a percentage."),
          p("For example, with made-up numbers: a post with 2,000 views and 50 interactions has an engagement rate of 2.5%. Another with 20,000 views and 200 interactions has 1%. The second post reached more people, but the first landed better with the people who saw it. To learn what your audience responds to, follow the rate. To learn what spreads, look at views and reposts."),
          note("There is no universal \"good\" engagement rate. It varies by niche, account size and format. Compare each post with your own typical rate, not with numbers you read about other accounts."),
          p("Two cautions. Small posts give noisy rates: 3 likes on 40 views looks great but tells you little. And posts keep collecting views for a while, so judge a post after a day or two, not after an hour."),
        ],
      },
      {
        id: "what-works",
        heading: "Find the topics and formats that work for you",
        blocks: [
          p("Single posts are random. Groups of posts show patterns. Label your last few weeks of posts by topic (what each one was about) and by format, then compare the typical engagement rate of each group."),
          ul(
            "**Formats** worth separating: questions, posts with images, plain text, threads and posts with links.",
            "**Topics**: your two to five recurring themes, for example tutorials, opinions, behind-the-scenes posts and reactions to news.",
          ),
          p("You will often find that one or two formats clearly beat the rest for your audience, and that a topic you post about constantly earns less than one you rarely touch. GrowX's **What works** view does this grouping for you by engagement, so you can see which topics and formats pull their weight without building a spreadsheet."),
        ],
      },
      {
        id: "followers",
        heading: "Which posts actually brought followers",
        blocks: [
          p("Engagement and follower growth are related but not the same. A joke can collect likes from your existing followers and bring in nobody new. A plain, useful thread might get fewer likes and still attract followers for days. If growth is your goal, you need to know which posts did that."),
          p("The manual way: note your follower count before a post and again a day later, and compare the gain with a normal day. It is rough, because posts and replies overlap, but over a few weeks the standouts show. GrowX Premium does this for you: for each post it looks at new followers in the 24 hours afterwards and highlights the posts that brought followers above your usual pace."),
          p("Look at the profile side as well. When a post clearly drew attention but few people followed, the post may be fine and the profile may be the problem. A clear bio and a pinned post that shows what new followers will get turn more of those visits into follows."),
        ],
      },
      {
        id: "mistakes",
        heading: "Common Twitter analytics mistakes",
        blocks: [
          p("Most analytics errors come from reading too much into too little data, or from measuring the wrong thing."),
          ul(
            "**Chasing views alone.** Reach without interactions or new followers is mostly people scrolling past.",
            "**Overreacting to one viral post.** A single outlier tells you little. Patterns that repeat across several posts are what you can act on.",
            "**Changing everything at once.** If you change topic, format and timing in the same week, you cannot tell which change helped.",
            "**Ignoring replies.** Replies are conversations waiting for an answer, and answering them is part of how a post performs.",
            "**Comparing yourself with other accounts.** Different niches and audience sizes produce very different numbers.",
          ),
        ],
      },
      {
        id: "weekly",
        heading: "A 20-minute weekly analytics review",
        blocks: [
          ol(
            "Compare this week with last week: new followers, unfollowers and total views.",
            "List your three best posts by engagement rate and your three best by new followers. Note what they have in common.",
            "Check the weakest posts too. Was it the topic, the format or the timing?",
            "Look at when your posts did best. GrowX's best-time-to-post heat map (a week by 24 hours) is built from your own posts' engagement and when your followers are active.",
            "Choose one change for next week, such as one more thread, a different posting time or a new topic, and write it down.",
          ),
          p("GrowX Premium sends a **weekly report** every Monday with this week against last week (new followers, unfollowers and best posts), which covers the first step. If you schedule your posts, the [post scheduler](/features/twitter-post-scheduler) lets you turn best-time findings straight into queue slots."),
          p("Keep a short log of these weekly decisions. After a couple of months you can look back and see which changes actually moved your numbers, which is far more useful than any single week's report."),
        ],
      },
      {
        id: "growx-insights",
        heading: "How GrowX Insights collects your numbers",
        blocks: [
          p("GrowX does not use X OAuth or ask for your password. It reads your numbers through an **x.com tab that is already open** in your signed-in session, one small step per minute at most, and refreshes your post analytics every 3 hours while x.com is open. Everything is stored in your browser."),
          ul(
            "**Free**: views, likes, reposts, replies, bookmarks and engagement rate for your latest 30 posts, What works by topic and format, top fans (who likes and replies to you most), a growth chart, daily goals and streaks, and 7 days of follower history.",
            "**Premium**: full analytics, including which posts brought followers, plus follower quality, the weekly report and your full follower history.",
          ),
          p("See the [analytics feature page](/features/twitter-analytics) for details, and the guide to [seeing who unfollowed you](/blog/who-unfollowed-me-on-twitter) for the follower tracker."),
        ],
      },
      {
        id: "try",
        heading: "Read your X analytics with GrowX",
        blocks: [
          p(`${TRY} Then use the [engagement guide](/blog/how-to-increase-twitter-engagement) to act on what you find.`),
        ],
      },
    ],
    faq: [
      {
        q: "How do I calculate engagement rate on Twitter?",
        a: "Add a post's likes, reposts, replies and bookmarks, divide by its views and multiply by 100. GrowX shows this rate for each of your recent posts.",
      },
      {
        q: "What is a good engagement rate on X?",
        a: "There is no single good number, because it varies by niche, account size and format. Compare each post with your own typical rate and work on raising that.",
      },
      {
        q: "Do views and impressions mean the same thing on X?",
        a: "Broadly, yes: both describe how many times a post was shown. X displays a view count on posts, and many guides still use the older word impressions.",
      },
      {
        q: "How often does GrowX update my X analytics?",
        a: "Every 3 hours while an x.com tab is open. GrowX reads the numbers through that tab, one small step per minute at most.",
      },
      {
        q: "Are GrowX analytics free?",
        a: "The core is free: your latest 30 posts with views, likes, reposts, replies, bookmarks and engagement rate. Premium adds full analytics, including which posts brought followers, plus follower quality and a weekly report.",
      },
    ],
  },
  {
    slug: "twitter-reply-strategy",
    seoTitle: "Twitter Reply Strategy: Get Followers by Replying",
    title: "Twitter Reply Strategy: How to Get More Followers by Replying on X Without Becoming a Reply Guy",
    description:
      "A Twitter reply strategy that grows your account: reply early to the right posts on X, write replies people notice, and find fresh posts with GrowX.",
    excerpt:
      "Replying early and well to the right posts is a reliable way for a small account to get seen on X. Here is how to do it without becoming a reply guy.",
    category: "Engage",
    keywords: [
      "Twitter reply strategy",
      "reply guy strategy",
      "how to get more followers by replying",
      "engagement on X",
      "Twitter replies",
      "X reply targets",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-increase-twitter-engagement", "first-1000-followers-on-x", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "why-replies",
        heading: "Why replying is the fastest way to get seen on X",
        blocks: [
          p("A new or small account has a reach problem: when you post, few people see it, because few people follow you. Replies get around that. When you reply to a post from a bigger account in your niche, your reply appears in front of that account's readers, people who already care about your topic. If the reply is good, some of them tap your name, read your profile and follow."),
          p("That is the whole **Twitter reply strategy** in one paragraph. The rest is execution: replying to the right posts, at the right time, with replies worth reading. Done badly, it turns you into the person everyone mutes. Done well, it is a dependable way to get more followers by replying on X, and it costs nothing but time."),
        ],
      },
      {
        id: "timing",
        heading: "Why early replies get seen",
        blocks: [
          p("Timing matters more than most people think. A post collects most of its attention in the hours after it is published. Replies that arrive while it is still gathering views sit in front of everyone who opens it afterwards, and they have time to collect likes and replies of their own. A reply added after the post has gone quiet is read by almost nobody."),
          p("So the goal is to find posts that are **fresh** and **starting to take off**, and to reply while readers are still arriving. Refreshing your timeline every few minutes is not a plan. A short list of accounts you watch on purpose is."),
        ],
      },
      {
        id: "who",
        heading: "Pick the right accounts to reply to",
        blocks: [
          ul(
            "**Same niche.** Their readers should be people who would want to follow you.",
            "**A few steps bigger than you.** Huge accounts get so many replies that yours gets buried, and accounts your size have little audience to share. Accounts somewhat larger than yours, with active reply sections, are the sweet spot.",
            "**Real conversations.** Look for accounts whose posts get genuine replies, not only likes.",
            "**People you find interesting.** You will reply better, and more consistently, to people you would read anyway.",
          ),
          p("A few dozen accounts is plenty. That is enough to always have something fresh to reply to, and small enough that people start to recognise your name."),
          p("Review the list once a month. Drop accounts whose reply sections have filled up with spam or whose topics have drifted away from yours, and add people you found through other good replies. The accounts that thoughtful repliers talk to are often worth adding too."),
        ],
      },
      {
        id: "writing",
        heading: "How to write replies that earn follows",
        blocks: [
          p("A good reply makes a reader think \"I want more from this person\". Patterns that work:"),
          ul(
            "**Add a specific example** from your own work: what happened when you tried the thing the post describes.",
            "**Extend the idea** with a next step, an exception or the part the author left out.",
            "**Disagree respectfully, with a reason.** Thoughtful disagreement often starts a better conversation than agreement.",
            "**Ask a sharp follow-up question** that the author and readers want answered.",
            "**Lead with the point.** Long replies get cut off, so the first line has to carry it.",
          ),
          p("Avoid the habits that mark a reply guy: \"Great post!\", a one-word reaction, a link to your own content, repeating what the post already said, or turning every thread into a pitch. Keep replies relevant, reasonably short and in your normal voice."),
        ],
      },
      {
        id: "example",
        heading: "A weak reply and a stronger one",
        blocks: [
          p("Imagine a post from a founder in your niche: \"We stopped offering a free plan and signups went up.\" Three possible replies:"),
          ul(
            "**Weak**: \"So true! Great insight.\" It adds nothing, and nobody reading it has a reason to look at your profile.",
            "**Better**: \"Did paid conversions go up too, or only signups?\" A real question that the author and readers want answered.",
            "**Strong**: \"We tried the same last year. Signups rose, but so did support requests, until we added a short onboarding call. Did you see anything similar?\"",
          ),
          p("The strong version shares a specific experience, adds something the post left out and ends with a question that invites the author to respond. It also tells readers what you work on, which is exactly what makes someone tap your name."),
        ],
      },
      {
        id: "reply-guy",
        heading: "Reply guy or valuable replier?",
        blocks: [
          p("The difference is not how often you reply but whether each reply adds something. A reply guy answers everything a big account posts, within seconds, with flattery or a joke that would fit any post. A valuable replier picks posts where they have something to say, and says it well. A handful of good replies a day does more for you than dozens of forgettable ones, and it will not get you muted."),
          p("Two habits help. Skip a post when you have nothing to add, and do not reply to the same account several times a day. Then answer the people who respond to your replies, because that is how strangers become mutuals."),
        ],
      },
      {
        id: "reply-targets",
        heading: "How GrowX Reply targets finds fresh posts",
        blocks: [
          p("The hard part of a reply strategy is finding the right posts at the right moment. GrowX, a Chrome extension for X (Twitter), has a **Reply targets** list in its Engage area for exactly this."),
          ul(
            "It collects **fresh posts**, by default younger than 120 minutes, from your source profiles, your VIPs and any accounts you add.",
            "It ranks them by **freshness and how fast they are taking off**, so posts picking up speed rise to the top while there is still time to reply early.",
            "You can **reply and like from GrowX**, but only when you press the button. Nothing is sent from Reply targets by itself, and GrowX does not send DMs.",
            "**AI reply ideas (Premium)** suggest angles using the AI model built into Chrome, on your own computer. Treat them as a starting point and write the final reply in your own words.",
          ),
          p("Read more on the [Reply targets feature page](/features/twitter-reply-targets) and the [AI tweet writer page](/features/ai-tweet-writer)."),
        ],
      },
      {
        id: "people",
        heading: "Keep track of the people you reply to",
        blocks: [
          p("Replying builds relationships, and relationships need memory. The **People** list in GrowX lets you tag accounts, add notes such as what you last talked about, mark VIPs and accounts to watch, and see your mutuals and the fans you don't follow back yet. With **VIP alerts (Premium)** you get a notification when a VIP posts, so you can be among the first replies on the accounts that matter most to you."),
          p("The **Top fans** view in Insights shows who likes and replies to you most. Those people deserve replies too: answering your own audience is the easiest engagement you will ever get."),
        ],
      },
      {
        id: "routine",
        heading: "A 20-minute daily reply routine",
        blocks: [
          ol(
            "Open Reply targets and pick 5 to 10 posts where you have something real to add.",
            "Write each reply fresh. Lead with the point and keep it short.",
            "Like the posts you replied to only if you actually liked them.",
            "Go back to the replies on your own posts and answer them.",
            "Once a week, check your follower growth chart and adjust the accounts on your list.",
          ),
          p("GrowX's daily goals can include a replies target, and streaks make the habit easier to keep. For the posting side, read [how to increase Twitter engagement](/blog/how-to-increase-twitter-engagement)."),
        ],
      },
      {
        id: "try",
        heading: "Find reply targets with GrowX",
        blocks: [p(`${TRY} Reply targets and the People list are part of the free plan.`)],
      },
    ],
    faq: [
      {
        q: "What is a reply guy on Twitter?",
        a: "Someone who replies to big accounts constantly with low-effort, flattering or attention-seeking comments. The fix is fewer, better replies that add something to the conversation.",
      },
      {
        q: "How many replies a day should I post on X?",
        a: "There is no magic number. Pick an amount you can keep up with good quality, for example a 10 to 20 minute block each day, and judge the results over weeks rather than days.",
      },
      {
        q: "Does replying to big accounts get you followers?",
        a: "It can, when your reply is early, relevant and good enough that readers want more from you. Your profile and recent posts then have to convince them, so nothing is guaranteed.",
      },
      {
        q: "Does GrowX reply or like posts automatically?",
        a: "No. Reply targets lets you reply and like from the GrowX dashboard, but only when you press the button. Nothing is sent from it by itself.",
      },
      {
        q: "How fresh are the posts in GrowX Reply targets?",
        a: "By default they are younger than 120 minutes, ranked by freshness and by how fast they are taking off.",
      },
    ],
  },
  {
    slug: "how-to-increase-twitter-engagement",
    seoTitle: "How to Increase Twitter Engagement: Practical X Tips",
    title: "How to Increase Twitter Engagement: Practical X Tips for More Likes, Replies and Reposts",
    description:
      "How to increase Twitter engagement: practical X tips on hooks, formats, timing and replies, plus how GrowX helps you measure what earns likes and replies.",
    excerpt:
      "Practical tactics for more likes, replies and reposts on X, from hooks and formats to timing and replies, and how to measure which ones work for you.",
    category: "Engage",
    keywords: [
      "how to increase Twitter engagement",
      "X engagement tips",
      "more likes and replies on Twitter",
      "Twitter engagement rate",
      "increase engagement on X",
      "Twitter engagement tips",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["twitter-reply-strategy", "twitter-analytics-guide", "how-to-grow-on-twitter-x"],
    sections: [
      {
        id: "intro",
        heading: "What Twitter engagement is and how to measure it",
        blocks: [
          p("Engagement on X is what people do with your posts after they see them: like, reply, repost or bookmark. If you want to know **how to increase Twitter engagement**, start by measuring it the same way every time. The simplest measure is **engagement rate**: interactions divided by views. It lets you compare a post that reached 300 people with one that reached 30,000."),
          p("Below are practical X engagement tips you can apply this week. None of them is a trick. They come down to writing posts people want to respond to, putting them in front of the right people at the right time, and taking part in conversations instead of only broadcasting."),
        ],
      },
      {
        id: "hooks",
        heading: "Write a first line that stops the scroll",
        blocks: [
          p("On a busy timeline your first line decides whether anyone reads the second. A strong hook is specific and makes a promise the rest of the post keeps."),
          ul(
            "**Lead with the result or the claim**: \"I rewrote our pricing page three times. Here is what changed.\"",
            "**Use a concrete detail** instead of a generic one: a number, a name or a time frame from your own experience.",
            "**Open a loop** with a question or a surprising statement that the post then answers.",
            "**Cut warm-up sentences.** If the post still works without its first line, delete that line.",
          ),
          p("Avoid hooks that overpromise. Clickbait can earn a click, but it costs trust and follows. GrowX includes **52 templates** (hooks, threads, lists, stories and more), and **GrowX AI (Premium)** can suggest hooks using the AI model built into Chrome, on your own computer."),
        ],
      },
      {
        id: "formats",
        heading: "Use formats that invite a response",
        blocks: [
          ul(
            "**Questions** people can answer in a few seconds. \"What's one tool you'd never give up?\" beats \"Thoughts on productivity?\"",
            "**Images and screenshots** of real work, results or examples. They stand out in the timeline and give people something concrete to react to.",
            "**Threads** for anything that needs steps. A useful thread earns bookmarks and reposts. You can draft one with the free [thread maker](/tools/twitter-thread-maker).",
            "**Lists** such as \"5 mistakes I made in my first year\" are easy to scan and easy for others to add to in the replies.",
            "**Short opinions** that take a clear position. People reply to positions, not to hedges.",
          ),
          p("Mix formats and let your own numbers decide. One audience loves threads; another only engages with short posts. Track posts with links as their own group too, so you can compare them with posts that keep the reader on X."),
        ],
      },
      {
        id: "conversation",
        heading: "Start conversations, then keep them going",
        blocks: [
          p("Replies are the most valuable engagement because they start conversations, and conversations keep a post alive. When people reply to you, answer, especially in the first hour. Ask a follow-up question, thank someone for a good point or add a detail. Every reply you write gives them, and everyone reading along, another reason to come back."),
          p("Ending a post with a genuine question helps, as long as it is one you actually want answered. \"Agree?\" at the end of every post quickly reads as filler."),
          p("The same goes for quote posts. When someone quotes you with a real comment, reply there too. That conversation happens in front of their followers, not only yours."),
        ],
      },
      {
        id: "timing",
        heading: "Post consistently at your best times",
        blocks: [
          p("Consistency does two things: your followers learn to expect you, and you collect enough posts to see patterns. Pick a pace you can keep for months, for example one or two posts a day, rather than ten posts one day and none for a week."),
          p("Your best posting times depend on your audience, so use your own data. GrowX builds a **best time to post** heat map (a week by 24 hours) from your own posts' engagement and when your followers are active. Its **queue** fills time slots (09:00, 13:00 and 18:30 every day by default), so you can write in one sitting and publish across the week. The free plan holds up to 10 posts or threads waiting at once, and Premium removes that limit. See the [post scheduler](/features/twitter-post-scheduler)."),
        ],
      },
      {
        id: "replying",
        heading: "Reply to others every day",
        blocks: [
          p("Engagement runs both ways. Accounts that reply thoughtfully to others in their niche get noticed by those people and their readers, and many of them return the favour. A short daily block of replies on fresh posts from accounts a bit bigger than yours is one of the best uses of your time on X."),
          p("GrowX's **Reply targets** list helps by surfacing fresh posts from accounts you care about, ranked by how new they are and how fast they are taking off. You still write and send every reply yourself, with a button press. The full approach is in our [Twitter reply strategy guide](/blog/twitter-reply-strategy)."),
        ],
      },
      {
        id: "recycle",
        heading: "Get more from posts that already worked",
        blocks: [
          p("Your best posts were seen by only part of your audience, and people who followed you since then never saw them at all. Two Premium features help you get more out of them:"),
          ul(
            "**Evergreen recycling (Premium)** posts your best posts again on a cycle you choose (every 30 days by default) with rotating variants of the wording, or reposts them.",
            "**Auto-plug (Premium)**: once one of your posts takes off (50 likes by default), GrowX replies to that post with your call to action, such as a newsletter, a product or a related thread. You switch it on and write the call to action yourself.",
          ),
          p("Recycle timeless content such as how-tos, checklists and lessons, not news or anything tied to a date, and vary the wording so it never reads as a copy."),
        ],
      },
      {
        id: "measure",
        heading: "Measure, then change one thing at a time",
        blocks: [
          p("Tips only matter if they work for you. Each week, compare the typical engagement rate of your posts with the week before, and look at which topics and formats came out on top. Change one thing at a time, so you know what made the difference."),
          p("GrowX **Insights** collects views, likes, reposts, replies, bookmarks and engagement rate for your latest 30 posts on the free plan, refreshed every 3 hours through an x.com tab you already have open. Its **What works** view groups results by topic and format (questions, images, text, threads and links). Premium adds which posts brought followers and a weekly report. See the [analytics feature page](/features/twitter-analytics), and the [Twitter analytics guide](/blog/twitter-analytics-guide) for how to read the numbers."),
        ],
      },
      {
        id: "avoid",
        heading: "What not to do",
        blocks: [
          ul(
            "**Engagement bait** such as \"Like if you agree, repost if you don't\". It may lift one post and cheapens your account.",
            "**Engagement groups and bought likes.** They inflate your numbers with people who will never read you, which makes your analytics useless, and they can break X's rules on platform manipulation.",
            "**Tagging big accounts** that have nothing to do with the post.",
            "**Posting the same text again and again** without changes.",
            "**Judging a post after 20 minutes.** Give it a day before you decide what worked.",
            "**Deleting posts that underperform** straight away. A quiet post still tells you something, and constant deleting makes your analytics harder to read.",
          ),
          note("No tactic guarantees engagement. Your niche, your audience and the quality of each post decide the result, which is why measuring matters more than any single tip."),
        ],
      },
      {
        id: "try",
        heading: "Grow your X engagement with GrowX",
        blocks: [p(`${TRY} Start with one tactic from this list, measure it for two weeks, and keep what works.`)],
      },
    ],
    faq: [
      {
        q: "Why is my Twitter engagement so low?",
        a: "Common causes are posts aimed at nobody in particular, weak first lines, rarely replying to others and posting when your followers are not active. Check your engagement rate by topic and format to see which applies to you.",
      },
      {
        q: "Does posting more often increase engagement on X?",
        a: "Consistency usually matters more than volume. Posting more only helps if quality holds, so raise frequency gradually and watch your engagement rate.",
      },
      {
        q: "Do images get more engagement on Twitter?",
        a: "Images help many posts stand out in the timeline, but it depends on your audience. Track posts with images as their own group and compare their engagement rate with text-only posts.",
      },
      {
        q: "Does GrowX post scheduled tweets when my computer is off?",
        a: "No. GrowX runs in Chrome, so your computer and Chrome need to be on at posting time. If a post ends up more than 6 hours late, it is never posted by itself; it waits as missed so you can decide.",
      },
      {
        q: "Can GrowX like or reply to posts for me?",
        a: "Not on other people's posts: replies and likes from Reply targets are sent only when you press the button. The one automatic reply is Premium auto-plug, which you switch on and which replies to your own post with your call to action.",
      },
    ],
  },
];
