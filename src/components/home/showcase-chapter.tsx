import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight, IconCheck } from "@/components/icons";
import { Screenshot } from "@/components/marketing/screenshot";
import type { StoryStep } from "@/components/motion/scroll-story";
import { stagger } from "@/components/motion/stagger";
import { Eyebrow } from "@/components/ui/primitives";

/** A box in percent of the visible 960 x 560 crop. */
type Box = { l: number; t: number; w: number; h: number };

type Chapter = {
  key: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  bullets: string[];
  image: string;
  alt: string;
  links: { href: string; label: string }[];
  ring: Box;
  chip: string;
};

/**
 * Showcase copy (unchanged from the previous home page, except the honest "52 templates" bullet).
 * Ring boxes were checked against the cropped screenshots: they frame the pace presets, the
 * scheduling row, the best-time heat map and the follower-changes list.
 */
const chapters: Chapter[] = [
  {
    key: "grow",
    index: "01",
    eyebrow: "Grow",
    title: (
      <>
        Pick a pace. <span className="text-gradient">Press Start.</span>
      </>
    ),
    body: "GrowX follows the newest followers of accounts in your niche, the people most likely to follow you back, one at a time with breaks and caps. It keeps going in the background until you press Stop.",
    bullets: [
      "Safe (~150 a day) and Balanced (~280 a day) paces on the free plan",
      "Follow-back score from 1 to 99 and filters that skip bots and inactive accounts",
      "Find sources for me: GrowX suggests sources from the accounts you follow",
    ],
    image: "/screens/grow.webp",
    alt: "GrowX Grow page: Sources and pace with Safe, Balanced, Turbo, X Premium and Custom presets (demo data)",
    links: [{ href: "/features/twitter-auto-follow", label: "Smart auto follow" }],
    ring: { l: 11, t: 61, w: 88, h: 17 },
    chip: "Safe ~150 · Balanced ~280 a day (free)",
  },
  {
    key: "create",
    index: "02",
    eyebrow: "Create",
    title: (
      <>
        Write once. <span className="text-gradient">Post at your best times.</span>
      </>
    ),
    body: "Posts and threads with images, queue slots and a calendar. GrowX learns your best time to post from your own posts and when your followers are active.",
    bullets: [
      "Post now, schedule, or add to your queue slots",
      "52 templates and a thread splitter that counts like X does",
      "GrowX AI writes ideas, hooks and threads on your computer (Premium)",
    ],
    image: "/screens/create.webp",
    alt: "GrowX Create page: post composer with AI ideas, best time and queue slots (demo data)",
    links: [
      { href: "/features/twitter-post-scheduler", label: "Post scheduler" },
      { href: "/features/ai-tweet-writer", label: "GrowX AI writer" },
    ],
    ring: { l: 26, t: 85, w: 35, h: 14 },
    chip: "Queue slots 09:00 · 13:00 · 18:30",
  },
  {
    key: "insights",
    index: "03",
    eyebrow: "Insights",
    title: (
      <>
        Know which posts <span className="text-gradient">bring followers.</span>
      </>
    ),
    body: "Views, likes, replies, reposts and engagement for every post, a heat map of your best times and the topics and formats that work for your audience.",
    bullets: ["Refreshed every 3 hours while x.com is open", "Topics and formats ranked by engagement", "Weekly report: this week vs last week (Premium)"],
    image: "/screens/insights.webp",
    alt: "GrowX Insights page: post numbers, best time to post heat map and what works by format (demo data)",
    links: [{ href: "/features/twitter-analytics", label: "Analytics" }],
    ring: { l: 9, t: 55, w: 56, h: 44 },
    chip: "Best time · week × 24 h, from your own posts",
  },
  {
    key: "followers",
    index: "04",
    eyebrow: "Followers",
    title: (
      <>
        See who followed <span className="text-gradient">and who unfollowed you.</span>
      </>
    ),
    body: "X doesn't tell you who unfollowed you. GrowX checks your follower list once a day and shows every change, plus how real your audience is and who your biggest fans are.",
    bullets: ["New followers and unfollowers, day by day", "Follower quality: real, inactive, likely bots (Premium)", "Clean up accounts that don't follow back, at a safe pace"],
    image: "/screens/followers.webp",
    alt: "GrowX Followers page: new followers, unfollowers, follower quality score and unfollow back (demo data)",
    links: [
      { href: "/features/twitter-unfollower-tracker", label: "Unfollower tracker" },
      { href: "/features/twitter-unfollow-tool", label: "Unfollow tool" },
    ],
    ring: { l: 9, t: 59, w: 56, h: 41 },
    chip: "Checked once a day",
  },
];

const pct = (n: number) => `${n}%`;

/** A 2px accent ring around the UI being described, plus a factual chip just above it. */
function Annotation({ ring, chip }: { ring: Box; chip: string }) {
  return (
    <div aria-hidden="true" data-decor="" className="absolute inset-0 [container-type:inline-size]">
      <span
        className="absolute rounded-xl shadow-[0_0_0_4px_rgba(225,29,46,0.08)] ring-2 ring-accent/80"
        style={{ left: pct(ring.l), top: pct(ring.t), width: pct(ring.w), height: pct(Math.min(ring.h, 100 - ring.t - 0.6)) }}
      />
      <span
        className="absolute inline-flex max-w-[60%] -translate-y-full items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline bg-white/95 px-2.5 py-1 text-[clamp(10.5px,1.6cqi,13px)] font-semibold text-accent-ink shadow-[var(--shadow-float)]"
        style={{ left: pct(ring.l), top: `calc(${pct(ring.t)} - 6px)` }}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-accent" />
        <span className="truncate">{chip}</span>
      </span>
    </div>
  );
}

function ChapterCopy({ c }: { c: Chapter }) {
  return (
    <div>
      <div className="reveal" style={stagger(0)}>
        <Eyebrow index={c.index}>{c.eyebrow}</Eyebrow>
      </div>
      <h3 className="reveal-heading mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight [text-wrap:balance] sm:text-[2.4rem]" style={stagger(1)}>
        {c.title}
      </h3>
      <p className="reveal mt-4 max-w-[62ch] text-lg leading-relaxed text-text-2 [text-wrap:pretty]" style={stagger(2)}>
        {c.body}
      </p>
      <ul className="reveal mt-6 space-y-3" style={stagger(3)}>
        {c.bullets.map((b) => (
          <li key={b} className="flex gap-3 text-[0.95rem] text-text-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink ring-1 ring-accent/15">
              <IconCheck size={13} />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <div className="reveal mt-7 flex flex-wrap gap-x-6 gap-y-2" style={stagger(4)}>
        {c.links.map((l) => (
          <Link key={l.href} href={l.href} className="group inline-flex items-center gap-1.5 font-semibold text-accent-ink">
            {l.label} <IconArrowRight size={16} className="nudge" />
          </Link>
        ))}
      </div>
    </div>
  );
}

const SIZES = "(min-width: 1024px) 640px, 100vw";

/** The four showcase chapters as ScrollStory steps (sticky stage at lg, rows elsewhere). */
export function showcaseSteps(): StoryStep[] {
  return chapters.map((c) => ({
    key: c.key,
    content: <ChapterCopy c={c} />,
    visual: <Screenshot src={c.image} alt={c.alt} sizes={SIZES} />,
    pops: <Annotation ring={c.ring} chip={c.chip} />,
    inlineVisual: (
      <div className="reveal-scale">
        <Screenshot src={c.image} alt={c.alt} sizes={SIZES}>
          <div className="hidden sm:block">
            <Annotation ring={c.ring} chip={c.chip} />
          </div>
        </Screenshot>
        <p className="mt-3 text-xs text-muted">Screenshot shows demo data.</p>
      </div>
    ),
  }));
}
