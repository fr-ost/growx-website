/**
 * The 52 post templates from the GrowX extension (shared/templates.js), shown on /tools/tweet-templates.
 * {placeholders} are filled in by the user; a line with just "---" starts the next post of a thread.
 */
export const TEMPLATE_CATEGORIES = [
  {
    id: "hooks",
    name: "Hooks",
    hint: "First lines that stop the scroll",
  },
  {
    id: "threads",
    name: "Threads",
    hint: "Multi-post formats",
  },
  {
    id: "lists",
    name: "Lists",
    hint: "Easy to read, easy to save",
  },
  {
    id: "stories",
    name: "Stories",
    hint: "Personal and relatable",
  },
  {
    id: "lessons",
    name: "Lessons",
    hint: "What you learned",
  },
  {
    id: "questions",
    name: "Questions",
    hint: "Start a conversation",
  },
  {
    id: "bip",
    name: "Build in public",
    hint: "Progress, numbers, wins",
  },
  {
    id: "tips",
    name: "Tips",
    hint: "Quick value",
  },
  {
    id: "launch",
    name: "Announcements",
    hint: "Launches and news",
  },
  {
    id: "plugs",
    name: "Plugs",
    hint: "A call to action under a post that took off",
  },
  {
    id: "replies",
    name: "Replies",
    hint: "Thoughtful reply starters",
  },
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["id"];

export interface TweetTemplate {
  id: string;
  cat: TemplateCategory;
  title: string;
  text: string;
}

export const TWEET_TEMPLATES: TweetTemplate[] = [
  { id: "t1", cat: "hooks", title: "The unpopular opinion", text: "Unpopular opinion: {opinion}.\n\nHere's why:" },
  { id: "t2", cat: "hooks", title: "I wish I knew", text: "I wish someone had told me this about {topic} {timeframe} ago:\n\n{insight}" },
  { id: "t3", cat: "hooks", title: "Stop doing this", text: "Stop {mistake}.\n\nDo this instead: {better}." },
  { id: "t4", cat: "hooks", title: "Nobody talks about", text: "Nobody talks about the boring part of {topic}:\n\n{truth}" },
  { id: "t5", cat: "hooks", title: "From X to Y", text: "{timeframe} ago: {before}.\nToday: {after}.\n\nThe one thing that changed everything:" },
  { id: "t6", cat: "hooks", title: "Most people vs. the top 1%", text: "Most people {common}.\n\nThe top 1% {different}." },
  { id: "t7", cat: "hooks", title: "Steal this", text: "Steal my {thing} for {result}:" },
  { id: "t8", cat: "hooks", title: "Hard truth", text: "Hard truth about {topic}: {truth}" },
  {
    id: "t9",
    cat: "threads",
    title: "How I did it (step by step)",
    text: "How I {result} in {timeframe} (step by step) 🧵\n---\n1. {step1}\n---\n2. {step2}\n---\n3. {step3}\n---\n4. {step4}\n---\nThat's it.\n\nIf this helped, follow me for more on {topic} and repost the first post to help someone else.",
  },
  {
    id: "t10",
    cat: "threads",
    title: "Mistakes I made",
    text: "I made {number} mistakes with {topic} so you don't have to 🧵\n---\nMistake 1: {mistake1}\n\nWhat to do instead: {fix1}\n---\nMistake 2: {mistake2}\n\nWhat to do instead: {fix2}\n---\nMistake 3: {mistake3}\n\nWhat to do instead: {fix3}\n---\nWhich one hit closest to home?",
  },
  {
    id: "t11",
    cat: "threads",
    title: "Tools I use",
    text: "The {number} tools I use every day for {topic}:\n---\n1. {tool1} - {why1}\n---\n2. {tool2} - {why2}\n---\n3. {tool3} - {why3}\n---\nWhat would you add to the list?",
  },
  {
    id: "t12",
    cat: "threads",
    title: "Breakdown of a success",
    text: "{name} went from {before} to {after}.\n\nHere's exactly how they did it 🧵\n---\n{point1}\n---\n{point2}\n---\n{point3}\n---\nThe lesson: {lesson}",
  },
  {
    id: "t13",
    cat: "threads",
    title: "Beginner's guide",
    text: "A beginner's guide to {topic}, in plain words 🧵\n---\nWhat it is: {what}\n---\nWhy it matters: {why}\n---\nHow to start today: {start}\n---\nThe one mistake to avoid: {mistake}\n---\nSave this for later and follow for part 2.",
  },
  {
    id: "t14",
    cat: "threads",
    title: "Myths vs. facts",
    text: "{number} myths about {topic} that are holding you back:\n---\nMyth: {myth1}\nFact: {fact1}\n---\nMyth: {myth2}\nFact: {fact2}\n---\nMyth: {myth3}\nFact: {fact3}",
  },
  { id: "t15", cat: "lists", title: "Numbered list", text: "{number} {things} that {benefit}:\n\n1. {a}\n2. {b}\n3. {c}\n4. {d}\n5. {e}" },
  { id: "t16", cat: "lists", title: "Do / don't", text: "{topic}:\n\n✅ {do1}\n✅ {do2}\n✅ {do3}\n\n❌ {dont1}\n❌ {dont2}\n❌ {dont3}" },
  { id: "t17", cat: "lists", title: "Before you", text: "Before you {action}, ask yourself:\n\n• {q1}\n• {q2}\n• {q3}" },
  { id: "t18", cat: "lists", title: "Rules I follow", text: "My {number} rules for {topic}:\n\n1. {rule1}\n2. {rule2}\n3. {rule3}\n\nSimple. Not easy." },
  {
    id: "t19",
    cat: "lists",
    title: "Free resources",
    text: "{number} free resources to learn {topic} (better than most paid courses):\n\n1. {r1}\n2. {r2}\n3. {r3}\n\nBookmark this.",
  },
  {
    id: "t20",
    cat: "stories",
    title: "The turning point",
    text: "{timeframe} ago I {low_point}.\n\nI almost quit.\n\nThen {turning_point}.\n\nToday {result}.",
  },
  { id: "t21", cat: "stories", title: "A small win", text: "Small win today: {win}.\n\nIt doesn't look like much, but {why_it_matters}." },
  { id: "t22", cat: "stories", title: "What I'd tell my younger self", text: "If I could tell my younger self one thing about {topic}:\n\n{advice}" },
  { id: "t23", cat: "stories", title: "Honest moment", text: "Honest moment: {confession}.\n\nIf you feel the same, you're not alone." },
  { id: "t24", cat: "lessons", title: "Lessons from N years", text: "{number} years of {topic} taught me:\n\n• {l1}\n• {l2}\n• {l3}\n• {l4}" },
  { id: "t25", cat: "lessons", title: "One sentence", text: "{topic} in one sentence:\n\n{sentence}" },
  { id: "t26", cat: "lessons", title: "The 80/20", text: "The 20% of {topic} that gets 80% of the results:\n\n{answer}" },
  { id: "t27", cat: "lessons", title: "I was wrong", text: "I used to believe {old_belief}.\n\nI was wrong. {new_belief}." },
  { id: "t28", cat: "questions", title: "This or that", text: "{option_a} or {option_b}?\n\nWrong answers only 👇" },
  { id: "t29", cat: "questions", title: "Your best advice", text: "What's the best advice you've ever gotten about {topic}?" },
  { id: "t30", cat: "questions", title: "Fill the blank", text: "Fill in the blank:\n\nThe best way to get better at {topic} is ______." },
  { id: "t31", cat: "questions", title: "What are you working on", text: "What are you building this week?\n\nDrop it below 👇 I'll check out every reply." },
  { id: "t32", cat: "questions", title: "Hot take request", text: "Give me your hottest take on {topic}. I'll start: {your_take}" },
  {
    id: "t33",
    cat: "bip",
    title: "Weekly update",
    text: "Week {week} of building {project}:\n\n📈 {metric1}\n💰 {metric2}\n🛠 Shipped: {shipped}\n😅 Struggle: {struggle}\n\nNext week: {next}",
  },
  {
    id: "t34",
    cat: "bip",
    title: "Milestone",
    text: "We just hit {milestone} 🎉\n\n{timeframe} ago this was just an idea.\n\nThank you to everyone who {thanks}.",
  },
  {
    id: "t35",
    cat: "bip",
    title: "Numbers",
    text: "{project} by the numbers ({period}):\n\n• Users: {users}\n• Revenue: {revenue}\n• Time spent: {time}\n\nWhat I'd do differently: {lesson}",
  },
  { id: "t36", cat: "bip", title: "Feature shipped", text: "Shipped: {feature} ✨\n\nWhy: {why}\n\nTry it: {link}" },
  { id: "t37", cat: "tips", title: "Quick tip", text: "Quick {topic} tip:\n\n{tip}\n\nTakes 2 minutes, saves hours." },
  { id: "t38", cat: "tips", title: "How to (3 steps)", text: "How to {result} in 3 steps:\n\n1. {s1}\n2. {s2}\n3. {s3}" },
  { id: "t39", cat: "tips", title: "Underrated", text: "The most underrated {thing} for {topic}: {answer}.\n\nHardly anyone uses it." },
  { id: "t40", cat: "tips", title: "Shortcut", text: "{task} used to take me {old_time}.\n\nNow it takes {new_time}.\n\nThe trick: {trick}" },
  { id: "t41", cat: "launch", title: "Launch", text: "Today I'm launching {product} 🚀\n\nIt helps {audience} {benefit}.\n\n{link}" },
  {
    id: "t42",
    cat: "launch",
    title: "Coming soon",
    text: "Something I've been working on for {timeframe} is almost ready.\n\nHint: it's about {topic}.\n\nWant early access? Reply \"me\".",
  },
  {
    id: "t43",
    cat: "launch",
    title: "Giveaway",
    text: "Giving away {prize} to {number} people 🎁\n\nTo enter:\n1. Follow me\n2. Repost this\n3. Reply with {ask}\n\nWinners in {timeframe}.",
  },
  { id: "t44", cat: "plugs", title: "Follow for more", text: "If you enjoyed this, follow me for more on {topic}. I post every day." },
  { id: "t45", cat: "plugs", title: "Newsletter", text: "I write about {topic} every week in my free newsletter: {link}" },
  { id: "t46", cat: "plugs", title: "Product", text: "Want to {benefit}? I built {product} for exactly that: {link}" },
  { id: "t47", cat: "plugs", title: "Repost", text: "Thanks for reading. Repost the first post to share it with your audience 🙏" },
  { id: "t48", cat: "replies", title: "Add a point", text: "Great point. I'd add: {addition}" },
  { id: "t49", cat: "replies", title: "Share experience", text: "This matches my experience. When I {experience}, {result}." },
  { id: "t50", cat: "replies", title: "Ask a follow-up", text: "Love this. How did you {question}?" },
  {
    id: "t51",
    cat: "replies",
    title: "Respectful counterpoint",
    text: "Interesting take. I've seen the opposite with {case} - curious what you think about that.",
  },
  { id: "t52", cat: "replies", title: "Summarize", text: "Saving this. The key part for me: {key_point}" },
];

/** Placeholder names in a template, in order, once each. */
export function templateFields(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\{([a-z0-9_]+)\}/gi)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

/** Fill what is given; leave the rest as {name} so it is easy to spot. */
export function fillTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{([a-z0-9_]+)\}/gi, (all, k: string) => (vars[k]?.trim() ? vars[k] : all));
}

/** "low_point" -> "Low point", "step1" -> "Step 1". */
export const fieldLabel = (name: string) =>
  name
    .replace(/_/g, " ")
    .replace(/(\D)(\d)$/, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
