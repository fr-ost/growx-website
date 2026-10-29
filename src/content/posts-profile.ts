import type { Block, Post } from "./posts";

/**
 * Profile and audience guides: Twitter bios, shadowbans, follow for follow, follower ratio and X Lists.
 * Same rules as posts.ts: every product claim matches docs/PRODUCT_FACTS.md (extension v2.4.4); no invented
 * statistics, studies, testimonials or result promises. Example numbers and bios are labelled as made up.
 */
const p = (text: string): Block => ({ type: "p", text });
const ul = (...items: string[]): Block => ({ type: "ul", items });
const ol = (...items: string[]): Block => ({ type: "ol", items });
const note = (text: string): Block => ({ type: "note", text });

const DATE = "2026-10-30";
const TRY =
  "GrowX is free to install from the Chrome Web Store, and you can [create a free account](/signup) to try every Premium feature free for 30 days, no credit card needed.";

export const profilePosts: Post[] = [
  {
    slug: "twitter-bio-ideas",
    seoTitle: "Twitter Bio Ideas: How to Write an X Bio (Examples)",
    title: "Twitter Bio Ideas: How to Write an X Bio That Turns Profile Visits Into Followers",
    description:
      "Twitter bio ideas with a simple formula, X bio examples for many niches, and tips on your photo, header and pinned post from the team behind GrowX.",
    excerpt:
      "A good bio tells visitors who you help, what you post and why to trust you, in 160 characters. Here is a simple formula, examples for many niches and the rest of a profile that earns follows.",
    category: "Guides",
    keywords: [
      "Twitter bio ideas",
      "how to write a Twitter bio",
      "X bio examples",
      "Twitter bio examples",
      "Twitter profile tips",
      "Twitter pinned post",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["first-1000-followers-on-x", "twitter-follow-back-score-growx", "follow-for-follow-twitter"],
    sections: [
      {
        id: "why-bio",
        heading: "Why your X bio decides who follows you",
        blocks: [
          p("When someone sees your reply, a repost or a new follow from you, they either tap your name or keep scrolling. If they tap, your profile becomes a landing page: in a few seconds they scan your name, photo, header, **bio**, pinned post and latest posts, then decide whether to follow. On X (Twitter), the bio carries most of that decision, because it is the only place where you explain yourself in words."),
          p("That is why searches for **Twitter bio ideas** are so common, and why copying a clever line rarely works. A bio does not need to be witty. It needs to tell a stranger, in 160 characters, what they get if they follow you. Below: a formula, X bio examples for many niches, and the rest of a profile that turns visits into follows."),
        ],
      },
      {
        id: "formula",
        heading: "How to write a Twitter bio: a four-part formula",
        blocks: [
          p("Most bios that work answer four questions. You will not always fit all four, but checking your draft against them shows what is missing."),
          ol(
            "**Who you help, or who it is for.** Name the audience: founders, new runners, junior developers, home cooks. People follow accounts that are clearly meant for them.",
            "**What you post.** Your two or three recurring topics, so visitors know what will appear in their timeline. This is the part most bios leave out.",
            "**Proof.** One reason to believe you: a role, a result, a project, years of experience or something you built. Keep it specific and true.",
            "**A call to action.** What to do next: read the pinned thread, join a newsletter, see your work. One action, not three.",
          ),
          p("A fill-in template: `I help {audience} {result}. Posts on {topic 1} and {topic 2}. {proof}. {call to action}`. Write a long version first, then cut words until it fits. Who and what are essential. Proof and the call to action go in when there is room."),
        ],
      },
      {
        id: "examples",
        heading: "X bio examples for different niches",
        blocks: [
          p("The examples below use {placeholders} so you can swap in your own details. They are templates, not real people's bios. Treat them as Twitter bio ideas to adapt, not lines to copy word for word."),
          ul(
            "**SaaS founder**: \"Building {product}, a {category} tool for {audience}. Sharing revenue, mistakes and lessons as we grow. Try it free: {link}\"",
            "**Freelance designer**: \"Brand and web designer for {industry} startups. Weekly design breakdowns and before-and-after redesigns. Booking {month} projects now.\"",
            "**Software developer**: \"{Language} developer at {company}. I explain {topic} without the jargon. New thread on {topic 2} every {weekday}.\"",
            "**Marketer**: \"Helping {audience} win customers from {channel}. Ex-{company}. Daily posts on {topic}, no fluff. Newsletter: {link}\"",
            "**Writer**: \"I write {newsletter}, a weekly letter on {topic} for {audience}. Short ideas here, the long version in your inbox: {link}\"",
            "**Fitness coach**: \"Coach for busy {audience}. Simple training and food habits that fit a full calendar. {credential}. Free starter plan below.\"",
            "**Personal finance**: \"Plain-English money tips for {audience}. Budgeting, investing basics and the mistakes I made so you don't have to.\"",
            "**Student**: \"{Field} student learning in public. Posting what I study each day, from {topic} to {topic 2}. Day {number} of {goal}.\"",
            "**Photographer**: \"{Style} photographer in {city}. Behind-the-scenes shots, simple lighting tips and the story behind each photo. Bookings: {link}\"",
            "**Local business**: \"{Business type} in {neighbourhood}. Fresh {product} daily, new specials every {weekday}. Open {hours}. Come say hi.\"",
            "**Nonprofit**: \"We help {group} in {region} get {outcome}. Stories from the field, ways to volunteer and where donations go. Get involved: {link}\"",
            "**Podcast host**: \"Host of {podcast}: conversations with {guests} about {topic}. New episode every {weekday}. Clips and takeaways here.\"",
            "**Indie game developer**: \"Solo dev making {game}, a {genre} game about {hook}. Devlogs, GIFs and the bugs I'm secretly proud of. Wishlist: {link}\"",
            "**Teacher**: \"{Subject} teacher, {number} years in the classroom. Lesson ideas, free resources and what actually works with {age group}.\"",
            "**Consultant**: \"I help {industry} teams fix {problem}. Ex-{role} at {company}. Posting the frameworks I use with clients.\"",
          ),
          p("Placeholders change the length once you fill them in, so paste your final version into the free [tweet character counter](/tools/tweet-character-counter) to check it against the 160-character limit. X's profile editor has the last word when you press save."),
        ],
      },
      {
        id: "styles",
        heading: "Bio styles that work, and habits to drop",
        blocks: [
          p("Within the formula there is plenty of room for your own voice. A few styles hold up well:"),
          ul(
            "**Plain and direct**: who you help and what you post, nothing else. Hard to misread and easy to remember.",
            "**Learning in public**: what you are working towards, and a promise to share the journey. Good for students, career changers and new founders without big credentials yet.",
            "**Credential first**: lead with your strongest proof when it is what your audience cares about most, such as a role at a known company or a product people use.",
            "**One human detail**: a single line about a hobby or quirk after the useful part, which gives people an easy opening.",
          ),
          p("And habits worth dropping:"),
          ul(
            "**Strings of labels** such as \"Entrepreneur. Visionary. Coffee lover.\" They say nothing about what you post.",
            "**Every job title you have ever held.** Pick the one that matters to the people you want to reach.",
            "**\"Follow back\" pleas** or \"F4F\". They attract people who want a follow, not readers; see [follow for follow on Twitter](/blog/follow-for-follow-twitter) for why that matters.",
            "**Too many hashtags, @mentions or emoji.** Hashtags and @mentions in a bio are clickable and lead visitors away from your profile.",
          ),
        ],
      },
      {
        id: "photo-header",
        heading: "Profile photo, header and name",
        blocks: [
          p("Visitors notice the visuals before they read a word, and an unfinished profile makes even a great bio look less trustworthy."),
          ul(
            "**Profile photo.** A clear, well-lit photo of your face for a personal account, or a simple logo for a brand. It has to work as a tiny circle next to every reply, so crop tightly and avoid busy backgrounds. X recommends 400 x 400 pixels.",
            "**Header.** The wide banner (X recommends 1500 x 500 pixels) is free advertising space: repeat your promise in a few words, show your work or point to your newsletter. Keep important text away from the edges and the lower left, where the profile photo overlaps it.",
            "**Name.** Your display name can be up to 50 characters. A short descriptor, such as \"{Name} | {topic}\", tells readers what you do from a reply alone. Keep it readable and do not stuff it with keywords.",
          ),
        ],
      },
      {
        id: "pinned-link",
        heading: "Pinned post and link: the rest of your landing page",
        blocks: [
          p("Your **pinned post** sits at the top of your profile, so it is the first post every visitor reads. Use it to show your account at its best:"),
          ul(
            "**An introduction**: who you are, what you post about and what people can expect, in a few lines or a short thread.",
            "**Your best thread**: a useful how-to that represents your topic. The guide to [writing a Twitter thread](/blog/how-to-write-a-twitter-thread) covers how to structure one.",
            "**Your best resource**: a free guide, template or newsletter issue, with one clear sentence on who it is for.",
          ),
          p("Replace the pinned post when something better comes along. One from two years ago tells visitors nobody is looking after the account."),
          p("The **website** field holds one link, separate from the 160 bio characters. Point it at the single most useful next step, such as your newsletter, product or portfolio, and let the call to action in your bio explain it, for example \"Free weekly letter on {topic} below\"."),
          p("Finally, visitors scroll. A profile whose last post is weeks old gives people little reason to follow, so a steady rhythm of even one or two posts a day keeps it looking alive."),
        ],
      },
      {
        id: "follow-backs",
        heading: "Why a complete profile matters for follow-backs",
        blocks: [
          p("Whenever you follow someone or reply to them, many of them check your profile before deciding whether to follow back. A default avatar, an empty bio and no posts look like a bot or a throwaway account, and plenty of people skip those without a second look. Growth tools that score accounts often make the same judgement."),
          p("GrowX, a Chrome extension for growing on X, is one example. Its filters skip accounts without a profile photo, and its follow-back score counts a photo and a bio among its signals, so an account without a bio scores lower. That is how one tool rates accounts, not a statement about how X itself ranks anyone, but it reflects a common instinct: a complete profile looks like a real person who might follow back. The [follow-back score guide](/blog/twitter-follow-back-score-growx) explains every signal."),
          p("The practical lesson: finish your profile before you follow people at any scale, whether by hand or with [Twitter auto follow](/features/twitter-auto-follow). Every follow you send is an invitation to look at your profile, so make sure there is something worth seeing when they arrive."),
        ],
      },
      {
        id: "checklist",
        heading: "A 10-minute Twitter profile checklist",
        blocks: [
          ol(
            "Write a bio that says who you help and what you post, then add proof and one call to action if they fit, all within 160 characters.",
            "Use a clear profile photo that still works as a small circle, and put your promise or your work in the header.",
            "Pin your best introduction, thread or resource, and point the website field at one useful next step.",
            "Remove outdated jobs, finished launches and dead links.",
            "Ask a friend to look at your profile for five seconds and tell you what you post. If they cannot, rewrite the bio.",
          ),
          p("Revisit the checklist whenever your focus changes. For the bigger picture, the guide to [your first 1,000 followers on X](/blog/first-1000-followers-on-x) shows where the profile fits into a growth plan."),
        ],
      },
      {
        id: "try",
        heading: "Grow your X profile with GrowX",
        blocks: [
          p(`${TRY} Once your profile is ready, the post scheduler and smart auto follow help the right people find it.`),
        ],
      },
    ],
    faq: [
      {
        q: "How many characters can a Twitter bio have?",
        a: "Up to 160 characters. Your display name can have up to 50, and the separate website field holds one link that does not count toward the bio.",
      },
      {
        q: "What should I put in my X bio?",
        a: "Who you help or who the account is for, what you post about, one piece of proof and a single call to action. If space is tight, keep the first two.",
      },
      {
        q: "Should I use emoji or hashtags in my Twitter bio?",
        a: "Use them sparingly. One or two emoji can work as separators, but hashtags and @mentions in a bio are clickable and lead visitors away from your profile.",
      },
      {
        q: "How often should I update my Twitter bio?",
        a: "Whenever your focus, role or main offer changes, and otherwise every few months. Check your pinned post and link at the same time.",
      },
      {
        q: "Does my Twitter bio affect follow-backs?",
        a: "It can. People usually check your profile before following back, and an empty one looks like a bot. GrowX's own follow-back score, for example, rates accounts without a bio lower.",
      },
    ],
  },
  {
    slug: "twitter-shadowban",
    seoTitle: "Twitter Shadowban: How to Check and Fix It on X",
    title: "Twitter Shadowban: Am I Shadowbanned on X, Why It Happens and How to Fix It",
    description:
      "Twitter shadowban explained: what X really limits, how to check if you are shadowbanned, common causes, how to recover, and how GrowX paces automation safely.",
    excerpt:
      "X doesn't call it a shadowban, but it does limit the visibility of some accounts and posts. Here is how to tell, what usually causes it and what to do about it.",
    category: "Guides",
    keywords: [
      "Twitter shadowban",
      "am I shadowbanned on X",
      "how to fix a shadowban",
      "X shadowban",
      "Twitter visibility filtering",
      "Twitter shadowban check",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["mass-follow-twitter-limits", "bulk-follow-twitter-safely", "how-growx-auto-follow-works"],
    sections: [
      {
        id: "what-is",
        heading: "What people mean by a Twitter shadowban",
        blocks: [
          p("A **Twitter shadowban** is the sense that X is hiding your account or your posts without telling you. You keep posting and everything looks normal on your screen, but views drop, replies dry up and friends say they cannot find you in search. Searches for **am I shadowbanned on X** usually start right there."),
          p("X does not use the word shadowban officially. It has, however, described limiting the visibility of some posts and accounts as part of how it enforces its rules: leaving accounts out of search suggestions, excluding posts from search results, ranking replies lower in a conversation and showing posts to fewer people. These measures are sometimes called **visibility filtering**. So in everyday use, a shadowban is a catch-all name for several real mechanisms that X can apply without always sending a notice."),
          p("Keep one more thing in mind before you worry: reach on X also moves for ordinary reasons. A weaker week of posts, a change of topic, a holiday or a shift in what the timeline favours can all cut your views. Treat \"shadowban\" as a theory to test, not as the first explanation."),
        ],
      },
      {
        id: "types",
        heading: "The kinds of limits people call a shadowban",
        blocks: [
          ul(
            "**Search suggestion limits**: your account does not appear under the search box when someone starts typing your name or handle.",
            "**Search limits**: your posts do not show up in search results, even when someone searches for an exact phrase from them.",
            "**Reply limits**: your replies sit at the bottom of conversations or are tucked behind a prompt to show more replies, so most readers never see them.",
            "**Reduced distribution**: your posts are shown to fewer people in recommended timelines such as For You.",
            "**Post labels**: X has said it may add a label to some posts whose reach it has limited for breaking its rules.",
          ),
          p("Some of these affect a single post, others a whole account. X does not publish thresholds or timelines for any of them, and it can change how they work at any time, so anyone who claims to know the exact rules is guessing."),
        ],
      },
      {
        id: "signs",
        heading: "Am I shadowbanned on X? Common signs",
        blocks: [
          p("No single sign proves anything, but several together are worth investigating:"),
          ul(
            "A **sudden, sharp drop** in views across all your posts that does not line up with any change in what, when or how often you post.",
            "Your replies get **no interaction at all** in conversations where you used to get some, and friends report that they cannot see them.",
            "Your account **does not appear in search suggestions** when other people search for your name.",
            "An exact-phrase search for a recent post **finds nothing**, while other posts with similar wording show up.",
            "New followers **stop almost completely** while you are posting and replying as usual.",
            "A **notice from X** in your notifications or email about limits on your account or a post.",
          ),
          p("A slow decline over months, one quiet post or a slow weekend are normal noise, so compare whole weeks, not single posts. The free [engagement rate calculator](/tools/twitter-engagement-rate-calculator) helps you separate a reach problem (fewer views, steady engagement rate) from a content problem (steady views, falling engagement rate)."),
        ],
      },
      {
        id: "check",
        heading: "How to check for a shadowban yourself",
        blocks: [
          p("You do not need a special website for this. Third-party shadowban checkers can only look at the same public views you can, they cannot see how X treats your account internally, and they can fall behind when X changes how search and replies work. A careful manual check tells you just as much:"),
          ol(
            "Ask a friend who does **not** follow you, or use a second account, so you see what strangers see.",
            "From that account, type your name and handle into the search box and check whether you appear in the suggestions.",
            "Search for an exact phrase from one of your recent posts, in quotes, and look at the Latest results.",
            "Open a recent conversation you replied to. Is your reply visible, and where does it sit?",
            "Check your notifications and the email address on your account for any message from X about your account or a post.",
            "Look at your numbers over the last few weeks, not the last few days.",
          ),
          p("If everything looks normal from the outside, the drop is most likely about content, timing or audience, and the fix is in your posts rather than your settings."),
        ],
      },
      {
        id: "causes",
        heading: "Common causes of visibility limits on X",
        blocks: [
          p("X's rules on spam and platform manipulation describe the behaviour it acts against. The patterns that most often lead to limits include:"),
          ul(
            "**Aggressive follow and unfollow churn**: following many accounts quickly and unfollowing them soon after.",
            "**Repetitive posts**: the same text, link or set of hashtags posted again and again, or near-identical replies under many posts.",
            "**Mass tagging**: mentioning lots of accounts that have nothing to do with the post.",
            "**Automation that ignores limits**: tools that act at machine pace, around the clock, or keep going after X shows a warning.",
            "**Reports and blocks**: many people reporting or blocking you in a short time.",
            "**Content that breaks X's rules**, including media that should have been marked as sensitive.",
            "**A sudden change in behaviour**, such as a new or long-dormant account that starts following, posting and replying at high volume overnight.",
          ),
          p("Most of these are about patterns over time rather than any single action. That is the good news: patterns can be changed."),
        ],
      },
      {
        id: "fix",
        heading: "How to fix a shadowban: what actually helps",
        blocks: [
          ol(
            "**Pause automation.** Stop auto follow, auto unfollow and any bulk actions for a few days, whatever tool you use.",
            "**Stop aggressive patterns.** No follow and unfollow churn, no mass tagging, no copy-and-paste replies.",
            "**Read X's notices.** If X tells you an account or a post was limited, follow its instructions. If it asks you to confirm an email address or phone number, or to remove a post, do it through X's own screens. If you think a decision is a mistake, appeal through X's Help Center.",
            "**Post normally.** Original posts at a steady, human pace and replies that add something. Normal activity is what rebuilds a normal pattern.",
            "**Wait and measure.** X does not say how long limits last. Compare weekly numbers instead of refreshing your analytics every hour.",
            "**Restart slowly.** When you bring automation back, start at the slowest pace and build up only after a clean stretch with no warnings.",
          ),
          note("Do not open a new account to get around a limit. X's rules prohibit using new accounts to evade enforcement, and a fresh account has no history in its favour anyway."),
        ],
      },
      {
        id: "growx",
        heading: "How GrowX avoids the patterns that cause limits",
        blocks: [
          p("If you use a growth tool, how it behaves when X pushes back matters more than how fast it can go. GrowX is a Chrome extension for X (Twitter) that works in your own signed-in session and is built to back off:"),
          ul(
            "**Follow verification**: GrowX checks that follows actually stuck. If X silently stops applying them, which is one form of shadow limit, GrowX notices instead of carrying on.",
            "**Adaptive slow-down** after any warning from X, and hard **stops** on sign-out, locks, verification challenges or repeated automation warnings. It never clicks through a challenge for you.",
            "**Safe paces**: the Safe preset waits 45 to 110 seconds between follows, rests every 12 follows and stays under about 18 an hour and 150 a day, with random delays and occasional longer pauses. Optional warm-up and active hours keep a new account quieter still.",
            "**Posting safety**: a daily post cap (20 by default), a minimum gap of 5 minutes between posts and a pause on any X warning.",
            "**Emergency stop**: press **Alt+Shift+S** to stop everything at once.",
          ),
          p("GrowX never sends DMs, and it never replies to or likes other people's posts by itself. The [Twitter auto follow](/features/twitter-auto-follow) page lists every safety setting, and the guides to [X follow limits](/blog/mass-follow-twitter-limits) and [bulk following safely](/blog/bulk-follow-twitter-safely) explain the paces in detail."),
          note("No tool can promise zero risk on X. GrowX lowers the chance of tripping limits, but you remain responsible for following X's rules."),
        ],
      },
      {
        id: "prevent",
        heading: "Habits that keep your reach healthy",
        blocks: [
          ul(
            "Post original content on a steady schedule rather than in bursts.",
            "Reply with substance to a handful of fresh posts each day. The [Twitter reply strategy](/blog/twitter-reply-strategy) guide shows how.",
            "Follow people who match your niche, at a human pace, and give them a few days to follow back before you tidy up.",
            "Unfollow gradually, in small batches, never hundreds in an afternoon.",
            "Skip engagement groups, follow trains and bought engagement.",
            "Keep your profile complete, so people can see a real person behind your posts.",
          ),
          p("None of these habits is exciting, and that is the point. Accounts that grow steadily on X tend to look boring to a spam filter: consistent, relevant and human."),
        ],
      },
      {
        id: "try",
        heading: "Grow on X without the risky patterns",
        blocks: [
          p(`${TRY} Start on the Safe pace with warm-up switched on, and let follow verification watch for silent limits.`),
        ],
      },
    ],
    faq: [
      {
        q: "Does X (Twitter) actually shadowban accounts?",
        a: "X does not use the word, but it has described limiting the visibility of some posts and accounts, for example in search suggestions, search results and reply ranking. Many people call that a shadowban.",
      },
      {
        q: "How long does a Twitter shadowban last?",
        a: "X does not publish how long limits last. Many people find temporary limits lift once the behaviour that caused them stops, so pause automation, post normally and compare weekly numbers.",
      },
      {
        q: "Can a shadowban checker tell me for sure?",
        a: "No. Only X knows how it treats your account, and checkers see the same public views you do. A manual check from an account that does not follow you is just as informative.",
      },
      {
        q: "Can an auto follow tool get me shadowbanned?",
        a: "Aggressive automation is one of the common causes, so pace matters. GrowX verifies follows, slows down after warnings and stops on locks or challenges, but no tool can promise zero risk on X.",
      },
      {
        q: "Should I delete my account and start over?",
        a: "Usually not. A new account starts with no history, and X's rules prohibit new accounts used to evade enforcement. Fix the behaviour, appeal through X if needed and give it time.",
      },
    ],
  },
  {
    slug: "follow-for-follow-twitter",
    seoTitle: "Follow for Follow on Twitter (F4F): Does It Work?",
    title: "Follow for Follow on Twitter (F4F): Does It Work, and What to Do Instead",
    description:
      "Does follow for follow on Twitter work? The honest pros and cons of F4F on X, a targeted alternative, and how to tune GrowX for follow backs or real niche fans.",
    excerpt:
      "F4F can grow a follower count fast, but those followers rarely read you. Here is an honest look at follow for follow on X, and how to aim for people who will.",
    category: "Guides",
    keywords: [
      "follow for follow Twitter",
      "F4F",
      "follow back Twitter",
      "F4F Twitter",
      "Twitter mutuals",
      "IFB meaning",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["twitter-follow-back-score-growx", "unfollow-non-followers-twitter", "twitter-follower-ratio"],
    sections: [
      {
        id: "what-is-f4f",
        heading: "What follow for follow means on Twitter",
        blocks: [
          p("**Follow for follow**, or **F4F**, is a simple deal: I follow you, you follow me back. On Twitter it shows up in bios as \"F4F\", \"IFB\" (I follow back), \"follow back\" or \"mutuals\", and in posts that invite people to drop their handle in the replies and follow everyone else who does. The goal is a bigger follower count, fast."),
          p("Following back someone who follows you is completely normal on X. Problems start when the whole strategy becomes a trade of follows, often in bulk. X's rules on platform manipulation and spam cover attempts to artificially inflate follower counts, and aggressive follow and unfollow churn is one of the patterns that gets accounts limited. So the real question is not only whether F4F works, but what kind of audience it builds."),
        ],
      },
      {
        id: "pros",
        heading: "The case for F4F",
        blocks: [
          p("F4F is popular for a reason. In moderation, it has real upsides:"),
          ul(
            "**Social proof for a new account.** A profile with a few hundred followers looks more established than one with twelve, and some visitors judge by that number.",
            "**Predictable follow backs.** People who advertise IFB usually do follow back, so the return on each follow is easier to predict.",
            "**A starting circle.** Mutuals see your posts in their Following timeline, and a few of them may become real connections if you share interests.",
            "**Momentum.** Watching the count move can keep a beginner posting long enough to find their voice.",
          ),
        ],
      },
      {
        id: "cons",
        heading: "The problems with follow for follow",
        blocks: [
          ul(
            "**Inflated counts, low engagement.** People who followed you for a follow back did not follow you for your posts. Your follower count grows while likes, replies and reposts stay flat, so your engagement rate falls.",
            "**Ratio problems.** F4F means following a lot of accounts. Everyone can follow up to 5,000, and beyond that X ties the limit to your follower count, so a heavy following list can box you in. The [Twitter follower ratio guide](/blog/twitter-follower-ratio) explains the numbers.",
            "**A noisy timeline.** Your Following feed fills with posts from people outside your niche, which makes it harder to spot conversations worth joining.",
            "**Churn.** F4F accounts often unfollow once you have followed back, or during their own cleanups, and you end up following people who no longer follow you.",
            "**Weak credibility in your niche.** A large count made of unrelated accounts does not impress the people you most want to reach. They look at who engages with you, not at the number.",
            "**Risk.** Follow trains and fast follow and unfollow cycles look spam-like and can lead to limits on your account.",
          ),
        ],
      },
      {
        id: "targeted",
        heading: "Targeted following: the alternative that builds an audience",
        blocks: [
          p("The alternative is to follow real people in your niche who are likely to care about what you post. A follow back is a bonus, not the deal. You may get fewer follow backs than from accounts that promise one, but each follow back is someone who might actually read you."),
          ol(
            "**Pick source accounts** in your niche: creators, brands or communities your ideal audience already follows.",
            "**Follow their recent followers.** Someone who followed a niche account recently is active now and has shown interest in your topic.",
            "**Check the basics**: a real photo, a bio and recent posts. Skip private, empty and inactive accounts.",
            "**Follow at a human pace**, with breaks, and stay well inside X's limits.",
            "**Give them a reason to follow back**: a clear bio, a strong pinned post and regular posts. The [Twitter bio ideas guide](/blog/twitter-bio-ideas) helps with the profile side.",
            "**Talk to them.** Replying to the people you followed turns a follow into a relationship.",
          ),
        ],
      },
      {
        id: "growx-score",
        heading: "How GrowX scores follow back words",
        blocks: [
          p("GrowX is a Chrome extension for X growth whose **smart auto follow** works the targeted way. You add source profiles in your niche, it follows each source's newest followers first, and it queues everyone else by a **follow-back score** from 1 to 99. The score looks at signals such as follow ratio, audience size, recent activity, account age, photo and bio, and **follow-back words in the bio**. The default minimum score is 55."),
          p("Out of the box, the boost list includes words such as `follow back`, `f4f`, `ifb` and `mutuals`, because people who write them usually mean it. That can lift your follow-back rate, but it also tilts your queue towards F4F accounts. If you would rather build a real niche audience, change it:"),
          ul(
            "**Remove the F4F words** from the boost list in the Grow filters, so those bios are scored like everyone else.",
            "**Add them to your exclude keywords** if you want to skip F4F accounts entirely. Exclude keywords are part of the free filters.",
            "**Use include keywords (Premium)** to require niche words in a bio, such as your industry or the tools you write about.",
            "**Choose sources carefully.** Niche sources matter more than any word list, and the source leaderboard shows the follow-back rate, retention and cost of each one.",
          ),
          p("The [follow-back score guide](/blog/twitter-follow-back-score-growx) explains every signal, and the [Twitter auto follow](/features/twitter-auto-follow) page covers sources, filters and paces."),
        ],
      },
      {
        id: "cleanup",
        heading: "Unfollowing people who didn't follow back",
        blocks: [
          p("Whichever approach you choose, some people will not follow back. Leaving them in your following list inflates your following count, hurts your ratio and uses up room under the 5,000 cap. The fix is a regular, gradual cleanup."),
          ul(
            "**Cleanup scan (free)**: GrowX scans your following and followers and lists who is **not following back** and who is **inactive**. You review, filter and select, then GrowX unfollows at a safe pace of up to 30 an hour and 200 a day, re-checking each account right before it unfollows. The free plan handles up to 200 per run.",
            "**Automatic cleanup (Premium)**: GrowX unfollows its own follows that did not follow back after 2, 5 or 7 days, only during autopilot breaks and 40 to 90 seconds apart, within the same caps. It never touches accounts you followed yourself or imported.",
          ),
          p("Give people a few days before you unfollow. Following and unfollowing within hours is exactly the churn X frowns on. And keep the accounts you follow for their content, whether or not they follow you back. The [Twitter unfollow tool](/features/twitter-unfollow-tool) page has the details."),
        ],
      },
      {
        id: "balance",
        heading: "When F4F words can still help",
        blocks: [
          p("F4F is not all bad. For a brand-new account, a few mutuals in your niche who happen to follow back can get things moving. The key word is niche: a designer who writes \"follow back\" in a design-focused bio is a perfectly good follow for another designer."),
          p("So test rather than guess. Keep the default boost words for a couple of weeks, then compare the follow-back rate and retention of each source on the leaderboard, and check your engagement rate with the free [engagement rate calculator](/tools/twitter-engagement-rate-calculator). If follow backs rise but replies and likes stay flat, shift towards niche signals. If the real people in your niche use those words, keep them."),
        ],
      },
      {
        id: "try",
        heading: "Grow with real followers using GrowX",
        blocks: [
          p(`${TRY} Set your boost words to match the audience you actually want before you press Start.`),
        ],
      },
    ],
    faq: [
      {
        q: "What does F4F mean on Twitter?",
        a: "Follow for follow: you follow someone and expect them to follow you back. Bios often signal it with F4F, IFB (I follow back), follow back or mutuals.",
      },
      {
        q: "Does follow for follow work on X?",
        a: "It grows a follower count, but those followers came for a follow back rather than your posts, so engagement often stays low. Targeted following of people in your niche builds an audience that actually reads you.",
      },
      {
        q: "Is follow for follow against X's rules?",
        a: "Following people back is normal. Schemes to artificially inflate follower counts and aggressive follow and unfollow churn can break X's platform manipulation and spam rules, so keep it gradual and relevant.",
      },
      {
        q: "How long should I wait before unfollowing someone who didn't follow back?",
        a: "Give people a few days. GrowX's Premium automatic cleanup lets you choose 2, 5 or 7 days, and it only unfollows accounts that GrowX itself followed.",
      },
      {
        q: "Can I stop GrowX from favouring F4F accounts?",
        a: "Yes. Remove words like follow back, f4f, ifb and mutuals from the boost list, or add them to your exclude keywords to skip those bios entirely.",
      },
    ],
  },
  {
    slug: "twitter-follower-ratio",
    seoTitle: "Twitter Follower Ratio: Following vs Followers on X",
    title: "Twitter Follower Ratio Explained: Following vs Followers, the 5,000 Follow Limit and How to Improve It",
    description:
      "What your Twitter follower ratio says about you, how X's 5,000 follow limit works and how to improve your ratio. Try the free GrowX follower ratio calculator.",
    excerpt:
      "Your follower ratio is a quick credibility signal, and it decides how far past 5,000 you can follow. Here is how to read it and how to improve it without tricks.",
    category: "Insights",
    keywords: [
      "Twitter follower ratio",
      "following to followers ratio",
      "Twitter follow limit 5000",
      "X follower ratio",
      "Twitter following limit",
      "follower ratio calculator",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 6,
    related: ["unfollow-non-followers-twitter", "mass-follow-twitter-limits", "follow-for-follow-twitter"],
    sections: [
      {
        id: "what-is",
        heading: "What the Twitter follower ratio is",
        blocks: [
          p("Your **Twitter follower ratio** compares two numbers on your profile: how many people follow you and how many accounts you follow. Divide followers by following and you get the follower ratio. Divide following by followers and you get the **following to followers ratio**. Both describe the same relationship from opposite sides, so pick one and stick with it."),
          p("A made-up example: an account with 2,000 followers that follows 1,000 accounts has a follower ratio of 2.0, or a following to followers ratio of 0.5. An account with 300 followers that follows 1,500 has a follower ratio of 0.2: it follows five times as many accounts as follow it."),
          note("Work out yours in seconds with the free [Twitter follower ratio calculator](/tools/twitter-follower-ratio-calculator). Enter your followers and following, and it shows your ratio and how many more followers you would need to follow more than 5,000 accounts."),
        ],
      },
      {
        id: "credibility",
        heading: "Why your ratio matters for credibility",
        blocks: [
          p("When someone lands on your profile on X, your following and follower counts sit side by side under your bio. People read them together, often without thinking about it."),
          ul(
            "**Following far more accounts than follow you** can read as follow for follow, a bot, or an account that follows everyone in the hope of a return. Visitors become more cautious.",
            "**Followers well above following** reads as an account people seek out, though a tiny following list can also look distant if you want to build a community.",
            "**Roughly balanced numbers** look like an ordinary, active person who follows people they find interesting and gets followed back.",
          ),
          p("Tools read ratios too, though for their own reasons. GrowX, for example, uses an account's follow ratio as one of the signals in its follow-back score. A ratio is a quick shortcut that people and software use to size up an account, which is why it is worth keeping an eye on yours."),
        ],
      },
      {
        id: "follow-limit",
        heading: "The Twitter follow limit: 5,000 and beyond",
        blocks: [
          p("The ratio also has a practical side. **Everyone on X can follow up to 5,000 accounts.** Past that point, how many more you can follow depends on how many people follow you. X does not publish an exact formula, and the limit can differ from account to account."),
          p("GrowX's following-cap guard uses a working estimate: the larger of 5,000 and about **10% above your follower count**. With that estimate and made-up numbers:"),
          ul(
            "**1,200 followers**: the cap stays at 5,000.",
            "**4,500 followers**: 10% above is 4,950, so the 5,000 floor still applies.",
            "**8,000 followers**: you could follow about 8,800 accounts.",
            "**To follow 6,000 accounts**, you would need about 5,455 followers.",
          ),
          p("Treat these as estimates, not X's rules. When you reach the cap, X simply stops letting you follow more, and hammering the follow button at that point looks like spam. GrowX's cap guard pauses following before you get there. The cap is separate from X's daily and hourly rate limits, which the guide to [X follow limits](/blog/mass-follow-twitter-limits) covers."),
        ],
      },
      {
        id: "tradeoffs",
        heading: "Is there an ideal follower ratio?",
        blocks: [
          p("You will find articles that name an ideal number. There is no number that holds for every account. A ratio is the result of choices, and each choice trades something:"),
          ul(
            "**Following many accounts** brings more follow backs and a wider view of your niche, but it fills your timeline, makes your ratio look heavier and brings you closer to the 5,000 cap.",
            "**Following few accounts** keeps your ratio clean and your timeline focused, but you discover fewer people, and fewer of them discover you.",
            "**A new account** almost always follows more people than follow it. That is normal: nobody follows an account they have never heard of.",
            "**A community builder** may follow thousands of people on purpose, and that is fine when those people are real and relevant.",
          ),
          p("A more useful question than \"is my ratio good?\" is \"is my ratio moving in the right direction, and would a visitor understand why it looks the way it does?\""),
        ],
      },
      {
        id: "improve",
        heading: "How to improve your following to followers ratio",
        blocks: [
          ol(
            "**Follow targeted people, not everyone.** Real, active people in your niche are more likely to follow back and to stay. The guide to [follow for follow on Twitter](/blog/follow-for-follow-twitter) compares the two approaches.",
            "**Clean up non-followers.** Give new follows a few days, then unfollow those who never followed back, unless you follow them for their content.",
            "**Remove inactive accounts.** Accounts that have not posted in months add to your following count and add nothing to your timeline.",
            "**Make your profile worth following.** A clear bio and a strong pinned post turn more profile visits into follows. See these [Twitter bio ideas](/blog/twitter-bio-ideas).",
            "**Post and reply consistently.** Content is what brings followers who did not need a follow from you first.",
            "**Go gradually.** Unfollowing hundreds of accounts in one afternoon is churn. Small batches at a human pace improve the ratio without creating a new problem.",
          ),
        ],
      },
      {
        id: "cleanup",
        heading: "Cleaning up your following list with GrowX",
        blocks: [
          p("GrowX's **Cleanup** area scans your following and followers and sorts accounts into **Not following back** and **Inactive**, where inactive means the latest post is older than 30, 90, 180 or 365 days, as you choose. Unknown activity is never called inactive, and partial scans are marked unverified with bulk select switched off, so you never unfollow on incomplete data."),
          ul(
            "**Free**: review, filter and select, then unfollow up to 200 per run at a safe pace of up to 30 an hour and 200 a day. Each account is re-checked right before it is unfollowed.",
            "**Premium**: select-all bulk unfollow of up to 5,000 in one run, a Balanced unfollow pace of 45 an hour and 320 a day, and automatic cleanup of GrowX's own follows that did not follow back after 2, 5 or 7 days.",
          ),
          p("See the [Twitter unfollow tool](/features/twitter-unfollow-tool) page for how a cleanup run works from start to finish."),
        ],
      },
      {
        id: "track",
        heading: "Track your ratio over time",
        blocks: [
          p("Check your ratio once a month rather than every day, and write it down. The trend matters more than any snapshot. A ratio that improves while your follower count grows means your approach is working. A ratio that worsens month after month is a sign to follow more selectively or to clean up more often."),
          p("A simple monthly log is enough: the date, your followers, your following, the ratio, and one line on what you changed that month, such as a cleanup, a new posting rhythm or different sources. After a few months the log shows which changes actually moved the ratio, which tells you far more than comparing yourself with other accounts."),
          p("GrowX Insights helps here. The growth chart shows your follower trend, and the follower tracker records once a day who followed and who unfollowed you (7 days of history on the free plan, full history on Premium). If many people you followed back leave again within days, you will see it before your ratio drifts."),
        ],
      },
      {
        id: "try",
        heading: "Improve your X follower ratio with GrowX",
        blocks: [
          p(`${TRY} Check where you stand first with the [follower ratio calculator](/tools/twitter-follower-ratio-calculator).`),
        ],
      },
    ],
    faq: [
      {
        q: "What is a good follower ratio on Twitter?",
        a: "There is no single ideal number. New accounts usually follow more people than follow them, which is normal; what matters is that your ratio improves over time and your following list is made of real, relevant accounts.",
      },
      {
        q: "How many accounts can you follow on X?",
        a: "Everyone can follow up to 5,000 accounts. Beyond that the limit depends on your follower count; X does not publish the formula, and GrowX estimates it at about 10% above your follower count.",
      },
      {
        q: "How do I calculate my Twitter follower ratio?",
        a: "Divide your followers by the number of accounts you follow. The free GrowX follower ratio calculator does it for you and shows how many followers you would need to follow more than 5,000 accounts.",
      },
      {
        q: "Does unfollowing people improve my ratio?",
        a: "Yes, because it lowers your following count. Do it gradually, give new follows a few days to follow back, and keep the accounts you follow for their content.",
      },
      {
        q: "Why can't I follow more people on Twitter?",
        a: "Either you have reached the following cap, which starts at 5,000, or you have hit a daily or hourly rate limit. For the cap, grow your followers or unfollow inactive accounts; for a rate limit, stop following for the day.",
      },
    ],
  },
  {
    slug: "twitter-lists-guide",
    seoTitle: "Twitter Lists: How to Use X Lists (+ List Ideas)",
    title: "Twitter Lists Guide: How to Use X Lists to Follow Your Niche, Find Replies and Grow",
    description:
      "How to use Twitter Lists on X: private vs public Lists, list ideas for your niche, finding reply opportunities, and using Lists as GrowX auto follow sources.",
    excerpt:
      "Lists turn X into a set of focused feeds you control. Here is how to set them up, which Lists are worth making and how to use them to find conversations worth joining.",
    category: "Engage",
    keywords: [
      "Twitter Lists",
      "how to use X Lists",
      "Twitter list ideas",
      "X Lists",
      "private Twitter list",
      "Twitter list strategy",
      "GrowX",
    ],
    datePublished: DATE,
    dateModified: DATE,
    readMinutes: 7,
    related: ["twitter-reply-strategy", "how-to-increase-twitter-engagement", "how-growx-auto-follow-works"],
    sections: [
      {
        id: "what-are-lists",
        heading: "What Twitter Lists are",
        blocks: [
          p("A **List** on X is a group of accounts you choose, with its own timeline that shows only posts from those accounts. You can add anyone with a public account, whether or not you follow them, and you can follow Lists that other people have made public. Pin the Lists you use most and they sit one tap away from your Home timeline."),
          p("**Twitter Lists** have been around for years, and they matter more now that the main timeline is shaped by recommendations. For You decides what you see, and your Following feed gets crowded as you follow more people. A List is the one feed you fully control: the accounts you picked, and nothing else."),
        ],
      },
      {
        id: "create",
        heading: "How to use X Lists: create one in a minute",
        blocks: [
          ol(
            "Open **Lists** from the menu on the X website or in the app.",
            "Create a new List and give it a clear name and a short description.",
            "Decide whether it should be **private** (more on that below).",
            "Add members by searching for accounts, or from any profile through its menu, which has an option to add or remove the account from your Lists.",
            "Open the List and **pin** it if you will read it often.",
          ),
          p("Menu labels move around between the X app and the website, but the options are the same. You can edit a List's name, description, members and privacy later, so start small and adjust as you go."),
        ],
      },
      {
        id: "private-public",
        heading: "Private vs public Lists",
        blocks: [
          ul(
            "**Public Lists** can be seen and followed by anyone, and people can see the public Lists they have been added to. They work well as a resource you share, such as \"{topic} people worth following\", and being added to a thoughtful public List is a small compliment.",
            "**Private Lists** are visible only to you, and nobody is notified when you add them. Use them for anything you would rather not explain: competitors, prospects, people you plan to reply to, or accounts you are researching.",
          ),
          p("A simple rule: if the name of the List, or the reason for it, could embarrass you or the people on it, make it private. Public Lists, on the other hand, are a way to be useful in your niche. A well-kept public List of good accounts can attract followers of its own."),
        ],
      },
      {
        id: "list-ideas",
        heading: "Twitter list ideas worth setting up",
        blocks: [
          p("Start with two or three Lists you will actually read. These **Twitter list ideas** cover most needs:"),
          ul(
            "**Niche peers**: people at roughly your stage, posting about your topic. These are the conversations you can join as an equal.",
            "**Reply targets** (private): accounts a few steps bigger than yours whose posts get real replies.",
            "**Experts and teachers**: people you learn from, so their posts never get lost in a busy timeline.",
            "**Customers or clients** (private): what they talk about, complain about and ask for.",
            "**Prospects and partners** (private): people you would like to work with, so you can engage with their posts long before you ever pitch.",
            "**Competitors** (private): what they launch and how their audience reacts.",
            "**News and tools**: publications, products and changelogs in your field.",
            "**Supporters**: the people who reply to you most. Answering them is the easiest engagement you will ever get, as the guide to [increasing Twitter engagement](/blog/how-to-increase-twitter-engagement) explains.",
            "**Events and communities**: speakers and attendees from a conference, or members of a group you belong to.",
            "**Local**: people and businesses in your city, if location matters for what you do.",
          ),
        ],
      },
      {
        id: "niche",
        heading: "Follow niche conversations without following everyone",
        blocks: [
          p("Every follow has a cost. It adds to your following count, nudges your ratio (the free [follower ratio calculator](/tools/twitter-follower-ratio-calculator) shows yours) and uses up room under X's following cap, which starts at 5,000. It also adds more posts to your Following feed. Lists let you keep up with people without paying that cost: you read their posts in the List and follow only the accounts you want in your main feed."),
          p("There is one trade-off. A follow is a signal the other person sees; a private List is not. If you want someone to notice you, follow them and reply to them. If you only want to read them, a List is enough. The guide to your [Twitter follower ratio](/blog/twitter-follower-ratio) explains why a lean following list helps."),
        ],
      },
      {
        id: "replies",
        heading: "Use Lists to find reply opportunities",
        blocks: [
          p("Replying early to fresh posts from slightly bigger accounts in your niche is one of the most dependable ways to get seen on X. The hard part is finding those posts while they are still fresh, and a dedicated reply List solves most of it."),
          ol(
            "Put 20 to 50 accounts in a private reply List: active, in your niche and with real conversations under their posts.",
            "Check the List two or three times a day instead of scrolling For You.",
            "Reply only where you have something to add: an example, a next step or a sharp question.",
            "Answer the people who respond to your replies.",
            "Once a month, drop accounts that went quiet and add people you met through good replies.",
          ),
          p("The full method, including how to write replies people notice, is in the [Twitter reply strategy](/blog/twitter-reply-strategy) guide."),
        ],
      },
      {
        id: "growx-sources",
        heading: "Lists as auto follow sources in GrowX",
        blocks: [
          p("GrowX is a Chrome extension for X (Twitter) growth. Its **smart auto follow** normally starts from source profiles: accounts in your niche whose newest followers it follows. On Premium, sources can also be a post's reposts, replies and likes, searches and #hashtags, and **X Lists**. With a List as a source, its members become follow candidates."),
          p("That makes a well-curated List a ready-made audience. A public List of active practitioners that someone in your niche has built can be a tighter group than the followers of one big account. Candidates from a List still go through the same filters (private accounts, missing photos, follower range, exclude keywords and more) and the follow-back score, and the same paces and safety stops apply. Accounts above your maximum followers filter, 8,000 by default, are skipped, so a List of celebrities makes a poor source."),
          p("The **source leaderboard** shows the follow-back rate, retention and cost of each source, so you can tell whether a List is working and drop it if it is not. The [Twitter auto follow](/features/twitter-auto-follow) page covers sources and filters."),
        ],
      },
      {
        id: "growx-people",
        heading: "Reply targets and VIPs: a complement to Lists",
        blocks: [
          p("Lists live on X. GrowX's **Engage** area adds tools that work alongside them:"),
          ul(
            "**Reply targets** collects fresh posts, by default younger than 120 minutes, from your sources, your VIPs and anyone you add, and ranks them by freshness and how fast they are taking off. You can reply and like from GrowX, but only when you press the button. Nothing is sent by itself.",
            "**People** keeps tags, notes, VIP and watch flags, your mutuals and the fans you don't follow back yet, so you remember who you talked to and why.",
            "**VIP alerts (Premium)** send a notification when a VIP posts, so you can be among the first to reply.",
          ),
          p("Use them together: a List for reading your niche on X, VIPs for the handful of accounts you never want to miss, and Reply targets to see which fresh posts are worth answering first. The [Reply targets](/features/twitter-reply-targets) page has the details."),
        ],
      },
      {
        id: "try",
        heading: "Find your niche on X with GrowX",
        blocks: [
          p(`${TRY} Reply targets and the People list are part of the free plan, and X Lists as auto follow sources come with Premium.`),
        ],
      },
    ],
    faq: [
      {
        q: "Do people know when you add them to a Twitter List?",
        a: "With public Lists, people can see the Lists they have been added to. Private Lists are visible only to you, and nobody is notified when you add them.",
      },
      {
        q: "Can you add someone to a List on X without following them?",
        a: "Yes, as long as their account is public. That is one of the main reasons to use Lists: you can read people without adding to your following count.",
      },
      {
        q: "What is the difference between a private and a public List?",
        a: "A public List can be seen and followed by anyone. A private List is visible only to you, which makes it the right choice for competitors, prospects and reply targets.",
      },
      {
        q: "How many Twitter Lists should I have?",
        a: "Only as many as you will actually read. Two or three focused Lists, such as niche peers, reply targets and experts, beat a dozen you never open.",
      },
      {
        q: "Can GrowX follow the members of an X List?",
        a: "Yes, on Premium. Add the List as a source and its members become follow candidates, filtered and scored like any other source and followed at your chosen pace.",
      },
    ],
  },
];
