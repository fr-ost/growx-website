import type { Block, Post } from "./posts";

/**
 * Marketing and engagement guides: Twitter marketing strategy, likes, views, reposts and X Communities.
 * Same rules as posts.ts: every product claim matches docs/PRODUCT_FACTS.md (extension v2.4.4); no invented
 * statistics, studies, testimonials, benchmarks or result promises. X product details are hedged because
 * X changes its features often.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-31";

const SAFETY_NOTE =
  "No tool can promise zero risk on X. GrowX is designed to respect the limits X signals, but you remain responsible for following X's rules.";

export const marketingPosts: Post[] = [
  {
    slug: "twitter-marketing-strategy",
    seoTitle: "Twitter Marketing Strategy: X Marketing for Business",
    title: "Twitter Marketing Strategy: How to Market Your Business on X, Step by Step",
    description:
      "A practical Twitter marketing strategy for business: goals, audience, content pillars, a posting routine, a 30/60/90-day plan and where GrowX helps on X.",
    excerpt:
      "A step-by-step Twitter marketing strategy for small businesses and creators, from goals and positioning to a posting routine, measurement and a 30/60/90-day plan.",
    category: "Guides",
    keywords: [
      "Twitter marketing strategy",
      "X marketing for business",
      "Twitter strategy for small business",
      "Twitter marketing plan",
      "X marketing strategy",
      "social media marketing on X",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["how-to-grow-on-twitter-x", "twitter-analytics-guide", "how-often-to-post-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "What a Twitter marketing strategy is (and is not)",
        blocks: [
          p("A **Twitter marketing strategy** is a short, written plan for how your business uses X to reach a specific goal: who you want to reach, what you will post, how often, how you will join conversations and how you will know it is working. It is not a pile of scheduled promos, and it is not a follower count target on its own."),
          p("X tends to reward businesses that behave like people: they share what they know, answer questions and show up in the conversations their customers already have. This guide walks through each part of a practical plan for **X marketing for business**, ends with a simple 30/60/90-day plan, and shows where **GrowX**, a Chrome extension for X (Twitter), can take some of the routine work off your hands."),
        ],
      },
      {
        id: "goals",
        heading: "Start with one business goal",
        blocks: [
          p("Every decision gets easier when you know what X is for. Pick one primary goal for the next three months, and write down what success would look like in your own numbers:"),
          ul(
            "**Awareness:** more of the right people know you exist. Watch views, profile visits and follower growth from your niche.",
            "**Leads or sales:** people click through to your site, sign up or ask about your product. Watch link clicks, sign-ups and the questions you get in replies.",
            "**Community and support:** customers talk to you and to each other. Watch replies, conversations and how quickly you answer.",
            "**Hiring or partnerships:** the right people see your work and reach out. Watch the quality of conversations, not the volume.",
          ),
          p("One goal does not mean ignoring the others; it tells you which post to write when you only have time for one."),
        ],
      },
      {
        id: "audience",
        heading: "Define who you want to reach",
        blocks: [
          p("\"Everyone on X\" is not an audience. Describe the people you want in one sentence, for example \"owners of small coffee shops who handle their own marketing\" or \"backend developers choosing a monitoring tool\". Then find where they already spend time:"),
          ul(
            "Search X for the problems your product solves and open the **Latest** results. Note who asks, who answers and which words they use.",
            "List 20 to 30 accounts your customers follow: peers, industry voices, publications, complementary tools and competitors.",
            "Read the replies under their posts, not just the posts. Replies show what your audience cares about, complains about and asks for.",
          ),
        ],
      },
      {
        id: "positioning",
        heading: "Positioning: what you want to be known for",
        blocks: [
          p("Positioning is your one-sentence answer to \"why should I follow you?\" A small business rarely out-posts a big brand, but it can be more specific, more helpful and more human. Good positioning on X usually combines a clear topic with a point of view, such as \"practical email marketing for independent shops, without the jargon\"."),
          p("Then make your profile say it in seconds:"),
          ul(
            "**Name and handle** that match your brand or the person behind it. A **Twitter strategy for small business** often works best with a founder or team member posting as a person, alongside or instead of a brand account.",
            "**Bio** that states who you help and how, plus one reason to trust you. The free [Twitter bio generator](/tools/twitter-bio-generator) gives you drafts to edit.",
            "**Pinned post** that shows your best work or explains what you offer, so visitors know what to do next.",
            "**Header image and link** that point to one clear place, not five.",
          ),
        ],
      },
      {
        id: "pillars",
        heading: "Pick three to five content pillars",
        blocks: [
          p("Content pillars are the recurring topics you post about. They keep you consistent, help readers understand what you are about, and make ideas easier to find. A balanced set for a small business might look like this:"),
          ul(
            "**Expertise:** tips, how-tos and lessons from your field. This is the pillar that earns follows.",
            "**Behind the scenes:** how you work, what you are building, decisions and mistakes. This builds trust.",
            "**Customer problems:** answers to the questions you hear every week. This attracts buyers.",
            "**Industry conversation:** your take on news and trends in your niche. This keeps you current.",
            "**Offers:** launches, updates and promotions. Keep this the smallest pillar so your feed never reads like an ad.",
          ),
        ],
      },
      {
        id: "routine",
        heading: "A posting routine you can keep",
        blocks: [
          p("Consistency matters more than volume. Choose a rhythm you can sustain for months: for many small teams that means one post each weekday, or a few posts a week plus daily replies. Our guide on [how often to post on Twitter](/blog/how-often-to-post-on-twitter) covers the trade-offs."),
          ol(
            "**Batch once a week.** Draft the week's posts in one session, one or two per pillar.",
            "**Schedule the planned posts** for the hours your audience is online, and leave room for live posts about what is happening that day.",
            "**Spend 15 minutes a day on replies**, both on your own posts and on others in your niche.",
            "**Review every Friday.** Note which posts earned replies and clicks, and pick one thing to change next week.",
          ),
        ],
      },
      {
        id: "engagement",
        heading: "Engagement: join conversations, do not just broadcast",
        blocks: [
          p("The fastest way for a small account to be seen is to be useful in other people's conversations. A thoughtful reply on a fresh post from a bigger account in your niche puts you in front of an audience that already cares about the topic."),
          ul(
            "Reply early, while a post is still fresh and the conversation is small.",
            "Add something: an example, an experience, a question or a respectful counterpoint.",
            "Answer every genuine reply and question you get, especially from customers.",
            "Never paste links to your product into other people's threads. Let your profile do the selling.",
          ),
          p("Our [Twitter reply strategy](/blog/twitter-reply-strategy) guide explains how to pick the right conversations."),
        ],
      },
      {
        id: "followers",
        heading: "Grow followers who could become customers",
        blocks: [
          p("Follower count is a means, not the goal. A few hundred followers who match your audience are worth more than thousands who will never buy. For a business, growth on X usually comes from three habits working together: useful posts, good replies and proactively connecting with the right people by following accounts in your niche who are likely to be interested."),
          p("Keep it human. Follow at a steady pace, follow people whose posts you would actually read, and stay well within X's limits. Bursts of follows and unfollows look like spam to X and to people."),
        ],
      },
      {
        id: "measure",
        heading: "Measure what matters",
        blocks: [
          p("Tie your numbers to the goal you chose. A few to check every week:"),
          ul(
            "**Engagement rate** (engagements divided by views), which lets you compare posts fairly whatever their reach.",
            "**Replies and conversations**, a sign your posts start discussions rather than collecting passive taps.",
            "**Follower growth and unfollows**, to see whether new followers stick around.",
            "**Clicks, sign-ups or inquiries** from your own website analytics, if leads are the goal.",
          ),
          p("Look for patterns over several weeks rather than reacting to one post. The [Twitter analytics guide](/blog/twitter-analytics-guide) explains which numbers to read and how."),
        ],
      },
      {
        id: "plan",
        heading: "A simple 30/60/90-day plan",
        blocks: [
          ul(
            "**Days 1 to 30: set up and listen.** Write down your goal, audience and positioning. Update your bio and pinned post. Build your list of niche accounts, reply to them daily and post a few times a week across your pillars. Do not judge results yet.",
            "**Days 31 to 60: find your rhythm.** Move to a fixed posting schedule, publish your first thread and start following people in your niche at a steady pace. Review engagement rate weekly and rework the pillar that keeps earning the least response.",
            "**Days 61 to 90: double down.** Repeat the topics and formats that worked, turn your best posts into threads or new angles, and add one clear call to action, such as a newsletter, a demo or a free resource, to your pinned post. On day 90, compare against the goal you wrote on day 1 and plan the next quarter.",
          ),
        ],
      },
      {
        id: "growx",
        heading: "Where GrowX fits in your X marketing",
        blocks: [
          p("GrowX works inside your own signed-in x.com session in Chrome. It does not replace your strategy; it handles the repetitive parts:"),
          ul(
            "**Scheduler:** the [post scheduler](/features/twitter-post-scheduler) has queue slots (09:00, 13:00 and 18:30 by default), a calendar, drafts and a **best time to post** heat map built from your own posts' engagement and when your followers are active. Chrome needs to be running for scheduled posts to go out. The free plan keeps up to 10 posts waiting at once; Premium is unlimited.",
            "**Analytics:** views, likes, reposts, replies, bookmarks and engagement rate for your recent posts (your latest 30 on the free plan), plus **What works**, which compares topics and formats.",
            "**Reply targets:** [Reply targets](/features/twitter-reply-targets) collect fresh posts from your sources, VIPs and anyone you add, ranked by freshness and how fast they take off. You write every reply, and nothing is sent until you press the button.",
            "**Auto follow of a niche audience:** [smart auto follow](/features/twitter-auto-follow) follows the newest followers of source profiles you choose, such as peers and industry accounts, scores other candidates by how likely they are to follow back, and paces follows with random delays, breaks and caps. On Premium, include keywords and location keywords help a local or specialist business focus its follows.",
          ),
          note(SAFETY_NOTE),
        ],
      },
      {
        id: "try",
        heading: "Put your plan into action",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "What is the best Twitter marketing strategy for a small business?",
        a: "Pick one goal, define a specific audience, post consistently around three to five content pillars and spend time replying in your niche every day. Measure engagement rate and follower growth over weeks, then repeat what works.",
      },
      {
        q: "How often should a business post on X?",
        a: "Choose a rhythm you can keep for months, such as one post each weekday or a few posts a week plus daily replies. Consistency matters more than volume.",
      },
      {
        q: "Should a small business use a brand account or a personal account on X?",
        a: "Both can work. Many small businesses get more conversation from a founder or team member posting as a person, with the brand account used for updates and support.",
      },
      {
        q: "How long does Twitter marketing take to show results?",
        a: "Usually weeks to months of consistent posting and replying before clear patterns appear. Give a plan about 90 days and judge it on trends, not single posts.",
      },
      {
        q: "Is it okay to promote products on Twitter?",
        a: "Yes, but keep promotion to a small share of your posts. Lead with useful content and conversation so offers feel welcome when they appear.",
      },
    ],
  },
  {
    slug: "how-to-get-more-likes-on-twitter",
    seoTitle: "How to Get More Likes on Twitter (X) Without Shortcuts",
    title: "How to Get More Likes on Twitter (X): Hooks, Formats, Timing and Real Community",
    description:
      "How to get more likes on Twitter (X) with better hooks, formats, images, timing and replies, why bought likes backfire, and how GrowX helps you measure them.",
    excerpt:
      "There is no shortcut to more likes on X. Here is what actually earns them: better first lines, formats, images, timing, replies and a circle of real readers.",
    category: "Engage",
    keywords: [
      "how to get more likes on Twitter",
      "more likes on X",
      "get likes on Twitter",
      "Twitter likes",
      "tweet engagement tips",
      "X engagement",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-increase-twitter-engagement", "twitter-reply-strategy", "how-to-get-more-reposts-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "How to get more likes on Twitter, honestly",
        blocks: [
          p("A like is the smallest thing someone can do on X, which is exactly why it is useful: it is a quick signal that a post landed. If you want to know **how to get more likes on Twitter**, the honest answer is that there is no shortcut. Likes come from posts that are clear, relevant to the people who see them and published when those people are around."),
          p("This guide covers the parts you control: hooks, formats, images, timing, replying and building a small community of real readers. It also explains why buying likes or joining engagement pods backfires, and how **GrowX**, a Chrome extension for X (Twitter), helps you see which posts earn **more likes on X**."),
        ],
      },
      {
        id: "hooks",
        heading: "Write a first line that earns the tap",
        blocks: [
          p("Most people decide in a second whether to keep reading. A strong first line makes everything after it possible. A few patterns that work in many niches:"),
          ul(
            "**Be specific.** \"I cut our onboarding from {number} steps to {number}\" beats \"Some thoughts on onboarding\".",
            "**Lead with the payoff.** Put the useful part first and the explanation after.",
            "**Name the reader.** \"If you run a small online shop, check this setting today\" tells the right people the post is for them.",
            "**Take a clear position.** A real opinion gives people something to agree with, and agreement often shows up as a like.",
          ),
          p("Then keep the promise. A hook that overpromises might earn a click, but readers who feel tricked scroll on without liking."),
        ],
      },
      {
        id: "formats",
        heading: "Formats that tend to collect likes",
        blocks: [
          p("Likes are a mix of agreement and appreciation. Formats that make people nod, smile or feel helped tend to earn them:"),
          ul(
            "**Short, relatable observations** about your niche that people recognise from their own experience.",
            "**Practical tips** someone can use today, in one or two lines.",
            "**Small wins and honest updates.** People enjoy cheering for someone who shares progress, including what went wrong.",
            "**Lists** of tools, lessons or mistakes, easy to skim and easy to appreciate.",
            "**Threads** for deeper ideas. Readers who make it to the end often like the first post on the way back.",
          ),
          p("If you are short on ideas, the free library of [52 tweet templates](/tools/tweet-templates) gives you fill-in structures for hooks, lists, stories and threads."),
        ],
      },
      {
        id: "images",
        heading: "Use images that add something",
        blocks: [
          p("An image makes a post stand out in a busy feed, but only when it adds information or emotion the text cannot. Good candidates:"),
          ul(
            "A screenshot of the thing you are talking about.",
            "A simple chart or diagram made from your own work.",
            "A before and after.",
            "A photo from your desk, workshop or event that shows the real person behind the account.",
          ),
          p("Write alt text for every image so people who use screen readers can follow along. Skip stock photos and memes that have nothing to do with the point; they take up space without earning attention."),
        ],
      },
      {
        id: "timing",
        heading: "Post when your readers are around",
        blocks: [
          p("Most likes arrive in the first hours after a post goes out, because feeds on X favour fresh posts. A great post published while your audience sleeps has to work harder to be seen. Look at when your own followers are active instead of trusting a generic chart; our guide to [the best time to post on Twitter](/blog/best-time-to-post-on-twitter) shows how to find your hours."),
          p("Then stay around after posting. Answering early replies keeps the conversation going and gives the post a better start."),
        ],
      },
      {
        id: "replying",
        heading: "Reply more than you post",
        blocks: [
          p("The most underrated way to get more likes on Twitter is to reply to other people. A good reply on a fresh post from a bigger account in your niche is seen by that account's audience, and a useful or funny reply often collects likes of its own. It also sends people to your profile, where your other posts can earn likes too."),
          ul(
            "Reply early, while the post is fresh and the reply section is short.",
            "Add something specific: an example, a counterpoint, a resource or a follow-up question.",
            "Answer the replies on your own posts. People notice when the author shows up.",
          ),
          p("Our [Twitter reply strategy](/blog/twitter-reply-strategy) guide goes deeper on choosing which conversations to join."),
        ],
      },
      {
        id: "community",
        heading: "Build a small circle of real readers",
        blocks: [
          p("Behind most accounts that get steady likes is a group of people who know each other: peers in the same niche who read, reply and cheer each other on. It forms naturally when you show up in the same conversations week after week."),
          ul(
            "Pick 20 to 30 accounts at your level or a little above, and engage with them regularly and genuinely.",
            "Like and reply to people who engage with you. A like is a small thank you.",
            "Share and credit other people's good work. Generosity tends to come back.",
          ),
          p("This is different from an engagement pod. Nobody is obliged to like anything, and the likes you get come from people who actually read you."),
        ],
      },
      {
        id: "backfire",
        heading: "Why bought likes and engagement pods backfire",
        blocks: [
          p("Buying likes, or joining a group where members agree to like each other's posts, can look like a shortcut. In practice it works against you:"),
          ul(
            "**It breaks X's rules.** X's rules on platform manipulation and spam cover buying engagement and coordinated activity meant to inflate it, which can lead to limited reach or account restrictions.",
            "**It sends the wrong signals.** Likes from accounts that never read your niche suggest your posts appeal to the wrong people, which can make it harder to reach the right ones.",
            "**It ruins your data.** If a post's likes are fake, you cannot tell what actually worked, so you stop learning.",
            "**It does not sell anything.** Bought likes never become readers, subscribers or customers.",
          ),
          p("Likes are only worth having when they come from people who might read your next post."),
        ],
      },
      {
        id: "measure",
        heading: "Measure likes the right way",
        blocks: [
          p("Raw like counts mostly reflect how many people saw a post. To compare posts fairly, look at likes relative to views, or at **engagement rate**: likes, replies, reposts and other engagements divided by views. The free [engagement rate calculator](/tools/twitter-engagement-rate-calculator) does the arithmetic."),
          p("A post with fewer likes but a higher engagement rate may be the better idea to repeat. Compare formats over a few weeks rather than judging single posts. For more on engagement in general, see [how to increase Twitter engagement](/blog/how-to-increase-twitter-engagement)."),
        ],
      },
      {
        id: "growx",
        heading: "How GrowX helps",
        blocks: [
          ul(
            "**Post analytics:** [Twitter analytics](/features/twitter-analytics) show views, likes, reposts, replies, bookmarks and engagement rate for your recent posts, your latest 30 on the free plan.",
            "**What works:** compares topics and formats such as questions, images, text, threads and links by engagement, so you can see what your audience responds to.",
            "**Top fans:** shows who likes and replies to you most, the core of your circle of readers.",
            "**Reply targets:** [Reply targets](/features/twitter-reply-targets) collect fresh posts (younger than 120 minutes by default) from your sources, VIPs and anyone you add, ranked by freshness and how fast they take off. You write every reply, and nothing is sent until you press the button.",
            "**Best time to post:** a week by 24-hour heat map from your own posts' engagement and when your followers are active, with queue slots to post at those hours.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Earn your next likes",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "Why are my tweets not getting any likes?",
        a: "Usually because too few interested people see them yet. Post when your audience is online, write clearer first lines and reply to others in your niche so more people discover your profile.",
      },
      {
        q: "Is it safe to buy likes on Twitter?",
        a: "No. Buying engagement goes against X's rules on platform manipulation and spam, can limit your reach or your account, and the likes never turn into real readers.",
      },
      {
        q: "Do images get more likes on X?",
        a: "An image that adds information or emotion can help a post stand out, but an unrelated image does not. Test posts with and without images and compare engagement rate.",
      },
      {
        q: "What is a good number of likes for a tweet?",
        a: "It depends on how many people saw the post. Compare likes with views, or use engagement rate, rather than chasing a fixed number.",
      },
      {
        q: "Do replies help me get more likes?",
        a: "Yes. Useful replies on fresh posts in your niche put you in front of new people, earn likes of their own and bring visitors to your profile.",
      },
    ],
  },
  {
    slug: "how-to-get-more-views-on-twitter",
    seoTitle: "How to Get More Views on Twitter: Grow Impressions on X",
    title: "How to Get More Views on Twitter (X): Impressions, Reach and What Moves Them",
    description:
      "How to get more views on Twitter: what X impressions are, what tends to increase reach, and how to measure views and engagement rate with GrowX analytics.",
    excerpt:
      "What views and impressions on X really measure, the habits that tend to increase reach, and how to judge your progress with views and engagement rate together.",
    category: "Insights",
    keywords: [
      "how to get more views on Twitter",
      "Twitter impressions",
      "increase reach on X",
      "more views on X",
      "X impressions",
      "Twitter reach",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["twitter-algorithm-explained", "twitter-analytics-guide", "how-to-go-viral-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "More views on X starts with understanding them",
        blocks: [
          p("Search **how to get more views on Twitter** and you will find plenty of tricks. Most do not hold up. Views on X come from a simple loop: your post is shown to some people, the interested ones respond, and that response helps it get shown to more people like them."),
          p("This guide explains what views and **Twitter impressions** are, what tends to increase reach on X, and how to measure progress properly, with notes on where **GrowX**, a Chrome extension for X (Twitter), helps along the way."),
        ],
      },
      {
        id: "what-views-are",
        heading: "What views and impressions are",
        blocks: [
          p("X added a view count to posts in late 2022 and, at the time of writing, shows it under most posts. X describes it as the number of times a post has been seen. Older Twitter analytics called the same idea **impressions**, and you will still see both words, often used interchangeably. Exactly how a view is counted is X's decision, and it may change."),
          p("Two things are worth keeping in mind:"),
          ul(
            "**Views are not people.** Someone who sees a post twice can count twice, so views measure exposure, not unique readers.",
            "**Views are not interest.** A post someone scrolls past can still count. That is why views only make sense next to engagement.",
          ),
        ],
      },
      {
        id: "sources",
        heading: "Where views come from",
        blocks: [
          ul(
            "**Your followers**, in the Following feed and in For you.",
            "**The For you feed** recommending your post to people who do not follow you yet.",
            "**Reposts and quote posts**, which carry your post into other timelines.",
            "**Replies**, both on your posts and your own replies on other people's posts, which appear in front of their audience.",
            "**Your profile**, when someone visits after seeing you somewhere else.",
            "**Search**, when someone looks up a topic or hashtag you posted about.",
          ),
          p("Small accounts get most of their extra reach from the For you feed and from replies, simply because their follower base is still small."),
        ],
      },
      {
        id: "engagement",
        heading: "Engagement from interested people",
        blocks: [
          p("The most reliable way to increase reach on X is to write posts that the people who see them want to respond to. When early readers reply, repost, like, bookmark or spend time on a post, that suggests to the system it is worth showing to more people with similar interests. Engagement from people who care about your topic is the point; random attention does little."),
          ul(
            "Stick to a clear niche, so the people who see your posts are the ones likely to respond.",
            "Write a first line that tells the right reader the post is for them.",
            "Invite replies with specific questions or a clear opinion.",
            "Answer the replies you get, which keeps the conversation going.",
          ),
        ],
      },
      {
        id: "timing",
        heading: "Timing and consistency",
        blocks: [
          p("Fresh posts get their best chance in the first hours, so post when your followers are online. Find your own hours in [the best time to post on Twitter](/blog/best-time-to-post-on-twitter) rather than borrowing someone else's."),
          p("Consistency matters just as much. An account that posts regularly gives the system more chances to test its posts with new people, and gives followers a habit of seeing you. A steady few posts a week usually beats a burst followed by silence. Avoid posting many times in a short window, which crowds your own posts and can look automated."),
        ],
      },
      {
        id: "replies",
        heading: "Replies on bigger accounts",
        blocks: [
          p("While your account is small, your replies can earn more views than your own posts. A useful reply on a fresh post from a bigger account in your niche shows up in front of an audience that already cares about the topic. Early replies sit near the top while the conversation is small; replies posted hours later are easily buried."),
          ul(
            "Reply within the first stretch after a post goes out.",
            "Add a specific example, a resource or a respectful counterpoint, not \"great post\".",
            "Keep it short enough to read at a glance.",
            "Do not paste links to your own content into other people's threads.",
          ),
        ],
      },
      {
        id: "threads",
        heading: "Threads and formats that hold attention",
        blocks: [
          p("Time spent reading is one of the signals that a post was worth showing. Formats that hold attention give your posts a better chance:"),
          ul(
            "**Threads** for step-by-step guides and breakdowns. A strong first post pulls readers into the rest, and each part can be shared on its own. See [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread), and use the free [Twitter thread maker](/tools/twitter-thread-maker) to split a long draft into numbered posts.",
            "**Images** such as screenshots, charts you made and before and after shots, which stop the scroll.",
            "**Lists** that are easy to skim and worth bookmarking.",
            "**Stories** with a turn and a lesson, which people tend to read to the end.",
          ),
        ],
      },
      {
        id: "for-you",
        heading: "Earning a place in the For you feed",
        blocks: [
          p("The For you feed is where most new views come from. It mixes posts from accounts people follow with recommendations from accounts they do not, chosen because the system predicts they will find them interesting. X has published parts of how it works, but not its current weights, so be sceptical of anyone selling exact rules."),
          p("The practical takeaway: relevance to a clear niche, early engagement, real conversation and an account in good standing all help. Our guide to [the Twitter algorithm explained](/blog/twitter-algorithm-explained) covers what is publicly known and what is guesswork."),
        ],
      },
      {
        id: "avoid",
        heading: "What does not help",
        blocks: [
          ul(
            "**Hashtag stuffing.** One or two relevant tags at most; more make a post harder to read.",
            "**Deleting and reposting** a slow post. Repeated text can look like spam; rewrite the idea with a new angle on another day.",
            "**Buying views or engagement.** It goes against X's rules on platform manipulation, brings no real readers and makes your data useless.",
            "**Rage bait.** It can spike views, but the mutes, blocks and reports that come with it work against you.",
            "**Judging by single posts.** Views swing from day to day. Look at weeks, not hours.",
          ),
        ],
      },
      {
        id: "measure",
        heading: "Measure views together with engagement rate",
        blocks: [
          p("Views tell you how far a post travelled; engagement rate tells you whether it was worth the trip. **Engagement rate** is engagements (likes, replies, reposts, bookmarks and so on) divided by views. A post with fewer views but a higher engagement rate is often the better idea to repeat, because the people who saw it cared. The free [engagement rate calculator](/tools/twitter-engagement-rate-calculator) does the arithmetic."),
          p("Track a few numbers each week: median views per post, which is steadier than the average because one big post can distort it, engagement rate, follower growth and the formats that perform best. Change one thing at a time so you can tell what made the difference."),
        ],
      },
      {
        id: "growx",
        heading: "Where GrowX fits",
        blocks: [
          ul(
            "**Post analytics:** [Twitter analytics](/features/twitter-analytics) show views, likes, reposts, replies, bookmarks and engagement rate for your recent posts, refreshed every 3 hours while x.com is open. The free plan covers your latest 30 posts.",
            "**What works:** compares topics and formats (questions, images, text, threads, links) by engagement.",
            "**Which posts brought followers** (Premium): new followers in the 24 hours after each post above your usual pace, so you can see which views turned into followers.",
            "**Reply targets:** [Reply targets](/features/twitter-reply-targets) surface fresh posts from your sources, VIPs and anyone you add, ranked by freshness and how fast they take off, so you can reply early. You write every reply, and nothing is sent until you press the button.",
            "**Best time to post:** a heat map from your own posts' engagement and when your followers are active, plus queue slots in the scheduler so posts go out at those hours while Chrome is running.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Start tracking your reach",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including Full analytics, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "What is the difference between views and impressions on Twitter?",
        a: "They describe the same idea: how many times a post was seen. X shows views under posts, while older Twitter analytics used the word impressions, and you will still see both.",
      },
      {
        q: "Why did my views on X suddenly drop?",
        a: "Views naturally rise and fall with topics, timing and what else is happening on X. Compare several weeks of data before concluding something is wrong, and check your account for any notices.",
      },
      {
        q: "Do replies help increase reach on X?",
        a: "Yes. Useful early replies on fresh posts from bigger accounts in your niche put you in front of their audience, which can bring views and profile visits.",
      },
      {
        q: "Is a high view count on a tweet always good?",
        a: "Only alongside engagement. A post with many views but few replies or likes reached people who did not care much, so check engagement rate as well.",
      },
      {
        q: "Can I buy views on Twitter?",
        a: "You should not. Bought views and engagement go against X's rules on platform manipulation, bring no real readers and make your analytics useless.",
      },
    ],
  },
  {
    slug: "how-to-get-more-reposts-on-twitter",
    seoTitle: "How to Get More Retweets and Reposts on X (Twitter)",
    title: "How to Get More Reposts on Twitter (X): Shareable Formats That Earn Retweets",
    description:
      "How to get more retweets and reposts on X (Twitter): shareable formats, data you own, threads, quote posts and asking without begging, plus where GrowX helps.",
    excerpt:
      "Reposts carry your posts into timelines you cannot reach yourself. Here is how to write posts people are glad to share, and how to ask without begging.",
    category: "Engage",
    keywords: [
      "how to get more retweets",
      "more reposts on X",
      "retweet",
      "how to get more reposts on Twitter",
      "quote posts",
      "shareable tweets",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["how-to-write-a-twitter-thread", "how-to-go-viral-on-twitter", "how-to-get-more-likes-on-twitter"],
    sections: [
      {
        id: "intro",
        heading: "From retweets to reposts",
        blocks: [
          p("When Twitter became X in 2023, the **retweet** was renamed the **repost**. The idea stayed the same: one tap shares your post with someone else's followers. That is why reposts matter so much for growth. A like stays between you and the reader; a repost carries your post into a timeline you could not reach yourself."),
          p("This guide covers **how to get more retweets** (or **more reposts on X**, if you prefer the new word) the honest way: understanding why people share, writing in formats built to be passed on, using quote posts and asking without begging. No buying, no pods, no tricks. Along the way you will see where **GrowX**, a Chrome extension for X (Twitter), helps."),
        ],
      },
      {
        id: "why-people-repost",
        heading: "Why people repost",
        blocks: [
          p("A repost puts the reposter's name next to your work in front of their followers. People do it when sharing makes them look good or helps their audience:"),
          ul(
            "**It is useful.** A tip, tool or checklist their followers will thank them for.",
            "**It says what they think.** An opinion they agree with but had not put into words.",
            "**It is a reference.** Something they want to find again or point others to.",
            "**It is a moment.** News, a launch or a milestone they want to celebrate with you.",
            "**It is generous.** Support for a peer whose work they like.",
          ),
          p("Write with that in mind. The question is not \"will people like this?\" but \"would someone be glad to show this to their followers?\""),
        ],
      },
      {
        id: "formats",
        heading: "Formats built to be shared",
        blocks: [
          ul(
            "**Lists:** tools, books, mistakes, resources. Easy to skim, easy to save, easy to pass on.",
            "**Frameworks:** a simple, named way to think about a problem, such as three questions to ask before hiring a freelancer. Frameworks give people language they can reuse.",
            "**Checklists and templates:** something the reader can copy and use today.",
            "**Threads:** a full guide or breakdown with a strong first post.",
            "**Quotable one-liners:** a clear, short line that says what many people in your niche feel.",
            "**Before and after:** an image that shows a change at a glance.",
          ),
          p("For starting points, the free library of [52 tweet templates](/tools/tweet-templates) and our list of [tweet ideas](/blog/tweet-ideas) cover most of these formats."),
        ],
      },
      {
        id: "data",
        heading: "Share data you own",
        blocks: [
          p("Original information is one of the most shareable things you can post, because nobody else has it. You do not need a research budget, just real numbers and observations from your own work:"),
          ul(
            "What happened when you changed one thing, with the actual before and after.",
            "A summary of the questions customers asked this month and what they had in common.",
            "Your honest monthly numbers for a project, including what went wrong.",
            "A comparison you ran yourself, with a note on how you did it.",
          ),
          note("Only share numbers you can stand behind. Made-up or exaggerated figures get called out quickly, and one corrected post can cost more trust than a dozen good ones earn."),
        ],
      },
      {
        id: "threads",
        heading: "Threads that get reposted",
        blocks: [
          p("A thread gives people more than one thing to share. Make the first post strong enough to stand alone, since that is what most reposts will carry, and make each part self-contained so it still makes sense when shared by itself. End with a short summary that someone could repost as a single post."),
          p("Our guide on [how to write a Twitter thread](/blog/how-to-write-a-twitter-thread) covers structure and numbering, and the free [Twitter thread maker](/tools/twitter-thread-maker) splits a long draft into numbered posts that fit X's limits."),
        ],
      },
      {
        id: "writing",
        heading: "Write lines people want to pass on",
        blocks: [
          ul(
            "**One idea per post.** Shareable posts are easy to summarise. If an idea needs a paragraph of context, make it a thread.",
            "**Lead with the point.** Readers decide fast, so put the useful part first.",
            "**Make it about the reader.** \"How to\" and \"you\" travel further than \"I did\" without a lesson.",
            "**Be clear before clever.** A joke that needs explaining will not be shared.",
            "**Leave space.** Short lines and line breaks make a post easier to read in a busy feed.",
          ),
        ],
      },
      {
        id: "asking",
        heading: "Asking for reposts without begging",
        blocks: [
          p("Asking is fine when it is rare, honest and tied to a reason. \"Repost if you agree\" on every post reads as engagement bait. A specific, occasional ask works much better:"),
          ul(
            "\"If this checklist helps, repost it for someone who is just starting out.\"",
            "\"We are hiring a {role}. A repost would help us reach the right people.\"",
            "\"Launch day. If you know someone who struggles with {problem}, this is for them.\"",
          ),
          p("Save asks for posts that genuinely help others or matter to you, such as launches, job posts and free resources. If you ask every day, people stop hearing it."),
        ],
      },
      {
        id: "quote-posts",
        heading: "Quote posts: yours and other people's",
        blocks: [
          p("A quote post shares a post with your own comment on top. Used well, it is one of the best tools for reach on X:"),
          ul(
            "**Quote your own older posts** with a new insight, an update or a result. It brings a good idea back into the feed with fresh context, and newer followers see it for the first time.",
            "**Quote others to add something:** a counterpoint, an example or a summary. Credit generously; authors often repost a thoughtful quote.",
            "**Respond to people who quote you.** A quote is a conversation starting in someone else's timeline, and replying keeps it going.",
          ),
          p("Avoid quote posts that only mock someone. They can spread, but mostly among people you would not want as your audience."),
        ],
      },
      {
        id: "no-buying",
        heading: "Why buying reposts backfires",
        blocks: [
          p("Paid reposts and groups that trade reposts look like a shortcut, but they go against X's rules on platform manipulation and spam, which can limit your reach or lead to account restrictions. They also put your posts in front of people who are not interested, which points the system at the wrong audience, and they make your analytics meaningless. Real reposts from real readers are slower, but they are the only kind that bring followers."),
        ],
      },
      {
        id: "measure",
        heading: "Track what gets shared",
        blocks: [
          p("Look at reposts relative to views rather than raw counts, and note which formats and topics get reposted most. Over a few weeks a pattern usually appears, such as lists outperforming opinions or your own data outperforming general tips, and you can lean into it."),
        ],
      },
      {
        id: "growx",
        heading: "Where GrowX helps",
        blocks: [
          ul(
            "**Analytics:** [Twitter analytics](/features/twitter-analytics) show views, likes, reposts, replies, bookmarks and engagement rate for your recent posts, and **What works** compares formats such as questions, images, text, threads and links.",
            "**Composer and templates:** write posts and threads of up to 25 parts with up to 4 images per post, start from 52 built-in templates, and let **Thread it** split a long draft.",
            "**Scheduler:** the [post scheduler](/features/twitter-post-scheduler) puts posts into queue slots at your best times. Chrome needs to be running for scheduled posts to go out.",
            "**Evergreen recycling** (Premium): your best posts go out again every so many days (30 by default) with rotating variants, or are reposted, so shareable posts reach followers who missed them.",
            "**GrowX AI** (Premium): suggests alternative hooks and improves drafts on your own computer, using the AI model built into Chrome.",
          ),
        ],
      },
      {
        id: "try",
        heading: "Write your next shareable post",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including evergreen recycling, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "Are retweets and reposts the same thing?",
        a: "Yes. X renamed retweets to reposts in 2023. Both mean sharing someone's post with your own followers.",
      },
      {
        q: "What kind of tweets get the most retweets?",
        a: "Posts people are glad to show their followers: useful lists, simple frameworks, checklists, original data from your own work and strong threads. Test formats and compare reposts relative to views.",
      },
      {
        q: "Is it okay to ask people to retweet?",
        a: "Occasionally, with a specific reason, such as a launch, a job post or a free resource. Asking on every post reads as engagement bait.",
      },
      {
        q: "Should I quote my own old tweets?",
        a: "Sometimes. Quoting an older post with a new insight or update gives it fresh context, and spacing these out avoids flooding your followers' feeds.",
      },
      {
        q: "Can I buy retweets on X?",
        a: "You should not. Buying reposts goes against X's rules on platform manipulation and spam, can limit your account and never brings real readers.",
      },
    ],
  },
  {
    slug: "x-communities-guide",
    seoTitle: "X Communities Guide: How to Use Twitter Communities",
    title: "X Communities Guide: How to Find, Join and Use Twitter Communities to Meet Your Niche",
    description:
      "How to use X Communities (Twitter Communities): finding and joining, posting, rules and moderation, meeting your niche, and how GrowX reply targets help.",
    excerpt:
      "X Communities are focused spaces where your niche already gathers. Here is how to find good ones, post well, respect the rules and turn conversations into relationships.",
    category: "Engage",
    keywords: [
      "X Communities",
      "Twitter Communities",
      "how to use X Communities",
      "join X Communities",
      "X Community rules",
      "Twitter niche community",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["twitter-lists-guide", "twitter-reply-strategy", "how-to-increase-twitter-engagement"],
    sections: [
      {
        id: "intro",
        heading: "What X Communities are",
        blocks: [
          p("**X Communities** are groups on X built around a shared interest, from programming languages and design to gardening, local cities and specific games. Twitter introduced Communities in 2021, and they still work as small, focused spaces inside the wider platform: each Community has its own feed, its own rules and a team of admins and moderators."),
          p("If you are trying to meet your niche, **Twitter Communities** can be a direct route to people who care about the same things you do. This guide covers **how to use X Communities**: finding and joining them, posting, following the rules and turning conversations into relationships. X changes its features often, so treat the details here as accurate at the time of writing and check the app for what it currently offers."),
        ],
      },
      {
        id: "find",
        heading: "Finding Communities worth joining",
        blocks: [
          p("Depending on your app version, you will usually find Communities in X's main menu, with a way to search them by keyword. X may move or rename that entry, so look around if it is not where you expect."),
          ul(
            "**Search by topic** using the words your niche actually uses, not just the broad category.",
            "**Watch for Community labels** on posts in your feed. Posts shared in a Community usually show its name, and a Community where people you respect post is a good lead.",
            "**Check the people you follow.** Peers in your niche may already be members.",
            "**Look before you join.** Read recent posts. You want a Community that is active, on topic and moderated, not one that is empty or full of spam.",
          ),
          p("Size is not the main thing. A smaller Community where people actually talk can be more useful than a huge one where posts disappear in minutes."),
        ],
      },
      {
        id: "join",
        heading: "Joining a Community",
        blocks: [
          p("Some Communities let anyone join with a tap; others ask you to request to join and wait for approval, depending on how the admins set them up and what X currently allows. Either way, before you join:"),
          ol(
            "Read the Community's rules, which are usually shown on the Community page.",
            "Read a week or so of recent posts to understand the tone and what gets a good response.",
            "Make sure your profile explains who you are, since members often check before they reply. Our [Twitter bio ideas](/blog/twitter-bio-ideas) and the free [Twitter bio generator](/tools/twitter-bio-generator) can help.",
          ),
          p("Assume your membership may be visible to others, and join Communities you are comfortable being associated with."),
        ],
      },
      {
        id: "posting",
        heading: "Posting to a Community vs your timeline",
        blocks: [
          p("At the time of writing, the X composer lets you choose where a post goes: your own timeline or a Community you belong to. The difference matters:"),
          ul(
            "**Your timeline** reaches your followers and anyone the For you feed recommends it to. It is your public body of work.",
            "**A Community** puts the post in front of members who chose that topic. Community posts can generally be read by people outside the Community, while replying is usually limited to members, and X has at times offered a way to also show a Community post to your followers. These details may change.",
          ),
          p("A simple rule: post niche questions, work in progress and topic-specific discussion to the Community, and keep posts meant for your broader audience on your timeline. Do not paste the same post into several Communities at once; repeated identical posts look like spam to members and to X."),
        ],
      },
      {
        id: "rules",
        heading: "Rules and moderation",
        blocks: [
          p("Every Community has its own rules on top of X's rules. Admins write them, and admins and moderators enforce them. Typical rules include staying on topic, limiting self-promotion, no spam and treating members with respect."),
          ul(
            "**Moderators can remove posts and members**, and admins can change the rules or the Community's settings.",
            "**Members can usually report posts** that break a Community's rules, so moderators can act on them.",
            "**Breaking a Community's rules can get you removed**, and breaking X's rules can affect your account, whatever a Community allows.",
          ),
          p("If you are unsure whether a post fits, ask a moderator or skip it. Being known as a helpful member is worth more than one promotional post."),
        ],
      },
      {
        id: "meet-your-niche",
        heading: "Using Communities to meet your niche",
        blocks: [
          p("The real value of a Community is not the post you publish; it is the people you meet. Treat it like a room full of potential peers:"),
          ul(
            "**Answer questions.** Helpful answers are the fastest way to become known in a Community.",
            "**Share work in progress** and ask for specific feedback.",
            "**Notice the regulars.** The same people tend to show up and help. Follow the ones whose posts you would read anyway.",
            "**Continue on the main timeline.** Reply to their regular posts too, so the relationship does not live in one place.",
          ),
          p("Over time, the members you meet can become the core of your audience: people who reply, share and introduce you to others. Our [Twitter reply strategy](/blog/twitter-reply-strategy) covers how to reply well wherever you are."),
        ],
      },
      {
        id: "start-your-own",
        heading: "Should you start your own Community?",
        blocks: [
          p("Running a Community takes real time: writing rules, approving members, removing spam and keeping conversations alive. It can be worth it if you already have an audience around a clear topic and want a dedicated space for them. X has at times limited who can create a Community, for example to X Premium subscribers, so check X's help pages for the current requirements before you plan around it."),
          p("If you are just starting out, joining and contributing to existing Communities is usually the better use of your time."),
        ],
      },
      {
        id: "mistakes",
        heading: "Mistakes to avoid in X Communities",
        blocks: [
          ul(
            "Joining dozens of Communities and posting the same link in each.",
            "Treating a Community as an ad channel instead of a conversation.",
            "Ignoring the rules because a similar post did well somewhere else.",
            "Arguing with moderators in public instead of contacting them or moving on.",
            "Only posting and never replying to anyone else.",
          ),
        ],
      },
      {
        id: "growx",
        heading: "How GrowX complements Communities",
        blocks: [
          p("GrowX does not read or post to X Communities. It works with your own timeline and the accounts you choose, which makes it a useful complement to the relationships you start in a Community:"),
          ul(
            "**Reply targets:** add the members you want to keep talking with, and [Reply targets](/features/twitter-reply-targets) collect their fresh posts (younger than 120 minutes by default), together with posts from your sources and VIPs, ranked by freshness and how fast they take off. You write every reply, and nothing is sent until you press the button.",
            "**People:** tag members with the Community's name, add notes about what you talked about, and use VIP and watch flags. With **VIP alerts** (Premium), you get a notification when a VIP posts.",
            "**X Lists and source profiles:** put members you like in an X List, as explained in our [Twitter Lists guide](/blog/twitter-lists-guide). On Premium, [smart auto follow](/features/twitter-auto-follow) can use X Lists as a source, and any account in your niche can be a source profile whose newest followers GrowX follows at a paced, human speed.",
          ),
          note("GrowX never sends DMs. " + SAFETY_NOTE),
        ],
      },
      {
        id: "try",
        heading: "Keep the conversations going",
        blocks: [
          p("GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature, including VIP alerts, free for 30 days, no credit card needed."),
        ],
      },
    ],
    faq: [
      {
        q: "What is the difference between X Communities and X Lists?",
        a: "A Community is a shared group with its own feed, rules and moderators that members post into. A List is a personal feed of accounts you choose to read, and those accounts do not post into it.",
      },
      {
        q: "Can people outside a Community see my Community posts?",
        a: "At the time of writing, Community posts can generally be read by people outside the Community, while replying is usually limited to members. X may change this, so check the app before posting anything you want kept within the group.",
      },
      {
        q: "How do I find X Communities in my niche?",
        a: "Open Communities from X's main menu and search with the words your niche actually uses. You can also watch for Community labels on posts from people you follow.",
      },
      {
        q: "Can I leave an X Community after joining?",
        a: "Yes. You can leave a Community from its page at any time, and you can join others whenever you like, subject to each Community's join settings.",
      },
      {
        q: "Does GrowX work with X Communities?",
        a: "GrowX does not read or post to Communities. It complements them with Reply targets, the People list and, on Premium, X Lists as an auto follow source for the members you meet.",
      },
    ],
  },
];
