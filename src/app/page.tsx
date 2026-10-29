import Link from "next/link";
import type { ComponentType } from "react";
import { PostCard } from "@/components/blog";
import { FeatureIcon } from "@/components/feature-icon";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import {
  IconActivity,
  IconArrowRight,
  IconCheck,
  IconChrome,
  IconClock,
  IconGauge,
  IconKeyboard,
  IconLock,
  IconMoon,
  IconShield,
  IconSparkles,
  IconTool,
  IconZap,
} from "@/components/icons";
import { JsonLd, faqLd, softwareLd } from "@/components/json-ld";
import { FeatureRow } from "@/components/marketing/feature-row";
import { Screenshot } from "@/components/marketing/screenshot";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Badge, Container, Eyebrow, Section, SectionHeading } from "@/components/ui/primitives";
import { featureNav, toolNav } from "@/config/nav";
import { getTier, TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { latestFirst } from "@/content/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX: The Ultimate X (Twitter) Growth Tool",
  absoluteTitle: true,
  description:
    "GrowX is the all-in-one X (Twitter) growth tool for Chrome: smart auto follow, post scheduler, AI writer, analytics and unfollower tracker. Free to start.",
  path: "/",
  keywords: [
    "X growth tool",
    "Twitter growth tool",
    "how to grow on Twitter",
    "Twitter auto follow",
    "Twitter scheduler",
    "AI tweet writer",
    "Twitter analytics",
    "who unfollowed me on Twitter",
  ],
});

type Icon = ComponentType<{ size?: number; className?: string }>;

const pillars: Record<string, string> = {
  "twitter-auto-follow": "Follows the newest followers of accounts in your niche, the people most likely to follow you back.",
  "twitter-post-scheduler": "Queue posts and threads with images. GrowX posts them at your best times.",
  "ai-tweet-writer": "Ideas, rewrites, hooks and threads from GrowX AI, running privately on your computer.",
  "twitter-analytics": "Every post's views, likes and engagement, plus the topics and formats that work for you.",
  "twitter-unfollower-tracker": "New followers and unfollowers, day by day, with follower quality and top fans.",
  "twitter-unfollow-tool": "Find accounts that don't follow back or went quiet. Review, then unfollow at a safe pace.",
  "twitter-reply-targets": "Fresh posts from big accounts in your niche, ranked so you can reply early.",
};

const steps = [
  { title: "Add GrowX to Chrome", body: "Install the free extension. It works inside your own x.com session and never asks for your X password." },
  { title: "Add sources, pick a pace", body: "Name a few accounts in your niche, or let GrowX find them. Choose Safe or Balanced and press Start." },
  { title: "Post, reply and measure", body: "Queue a few posts for your best times, reply early to fresh posts and see what brings followers." },
];

const safety: { icon: Icon; t: string }[] = [
  { icon: IconClock, t: "Random delays and regular breaks" },
  { icon: IconGauge, t: "Rolling hourly and daily caps" },
  { icon: IconMoon, t: "Optional active hours and warm-up" },
  { icon: IconShield, t: "Slows down by itself after any X warning" },
  { icon: IconCheck, t: "Checks that follows really stick" },
  { icon: IconZap, t: "Posting cap and gap between posts" },
  { icon: IconKeyboard, t: "Emergency stop: Alt + Shift + S" },
  { icon: IconActivity, t: "Runs in the background, resumes after restarts" },
];

const faqs = [
  { q: "What is GrowX?", a: "GrowX is a Chrome extension that brings the main X (Twitter) growth jobs into one place: smart auto follow, a post and thread scheduler, the GrowX AI writer, post analytics, an unfollower tracker, reply targets and cleanup tools." },
  { q: "Is GrowX free?", a: `Yes. The free plan includes the Safe and Balanced auto follow paces, core filters, scheduling (up to 10 posts waiting), analytics for your latest 30 posts, 7 days of follower history, reply targets and the cleanup scan. You can try every Premium feature free for ${TRIAL_DAYS} days, with no credit card.` },
  { q: "Do I need to give GrowX my X password?", a: "No. GrowX works through the x.com session that is already signed in to your Chrome browser. It never asks for or stores your X password and does not use X OAuth." },
  { q: "Is it safe for my X account?", a: "No tool can promise zero risk; X makes its own decisions. GrowX is built to behave like a careful person: random delays, breaks, hourly and daily caps, optional active hours and warm-up, a posting cap, and an automatic slow-down or stop whenever X shows a warning." },
  { q: "How does the post scheduler work?", a: "Write a post or thread, add images, then post now, pick a time or add it to your queue slots. GrowX posts through your signed-in x.com tab in Chrome, so Chrome needs to be running at the scheduled time." },
  { q: "Where does GrowX AI run?", a: "On your own computer, using the AI model built into Chrome. Nothing is sent to GrowX and there is no API key. When the model isn't available, the AI buttons fall back to templates." },
  { q: "Can I see who unfollowed me on Twitter?", a: "Yes. GrowX compares your full follower list once a day and shows who followed and who unfollowed you. The free plan keeps 7 days of history; Premium keeps the full history and adds one-click unfollow back." },
  { q: "How much is Premium?", a: `$1.99 for 30 days, $14.99 for 365 days or $59.99 lifetime ($29.99 for the first 100 lifetime buyers). Plans are prepaid and never renew automatically. Start with the free ${TRIAL_DAYS}-day trial first.` },
];

export default function HomePage() {
  const yearly = getTier("PRO_YEARLY");
  return (
    <>
      <JsonLd data={[softwareLd, faqLd(faqs)]} />

      {/* HERO */}
      <section className="bg-hero relative overflow-hidden">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <Container className="relative pb-10 pt-14 text-center sm:pt-20">
          <div className="animate-fade-up">
            <Link href="/blog/growx-potential-best-practices-roadmap" className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/80 py-1 pl-1 pr-3 text-sm font-semibold text-text-2 shadow-sm backdrop-blur transition-colors hover:border-accent/30">
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">New</span>
              Version 2.4.4: scheduler, AI writer and analytics
              <IconArrowRight size={15} className="text-accent transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <h1 className="animate-fade-up mx-auto mt-7 max-w-4xl text-[2.7rem] font-extrabold leading-[1.02] tracking-tight [animation-delay:80ms] sm:text-6xl lg:text-[5rem]">
            The ultimate <span className="text-gradient">X (Twitter) growth tool</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-2 [animation-delay:160ms] sm:text-xl">
            GrowX follows the right people, posts at your best times, writes with on-device AI and shows you what works. One simple
            Chrome extension, free to start.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            {site.chromeStoreUrl ? (
              <ExternalButton href={site.chromeStoreUrl} size="lg">
                <IconChrome size={20} /> Add to Chrome, it&apos;s free
              </ExternalButton>
            ) : null}
            <LinkButton href="/signup" variant="secondary" size="lg">
              Create free account <IconArrowRight size={18} />
            </LinkButton>
          </div>
          <ul className="animate-fade-up mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-text-2 [animation-delay:320ms]">
            {["Free plan forever", `${TRIAL_DAYS}-day Premium trial, no credit card`, "Never asks for your X password"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <IconCheck size={16} className="text-accent" /> {t}
              </li>
            ))}
          </ul>
          <div className="animate-fade-up relative mx-auto mt-14 max-w-5xl [animation-delay:400ms]">
            <div className="glow -bottom-10 left-1/2 h-40 w-3/4 -translate-x-1/2 bg-accent/25" aria-hidden="true" />
            <Screenshot
              src="/screens/overview.webp"
              alt="GrowX dashboard: today's follows and goals, posts up next on X, this week's numbers and the popup with the Balanced pace running (demo data)"
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="relative"
            />
            <p className="mt-3 text-xs text-muted">Screenshots show demo data.</p>
          </div>
        </Container>
      </section>

      {/* PILLARS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Everything in one extension" title="Seven growth tools. One simple dashboard." center>
            Stop juggling a follow tool, a scheduler and an analytics app. GrowX does the daily work of growing on X in one place.
          </SectionHeading>
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureNav.map((f, i) => (
              <li key={f.slug} className="reveal">
                <Link
                  href={`/features/${f.slug}`}
                  className={`card-hover group flex h-full flex-col rounded-3xl border p-6 ${
                    i === 0 ? "bg-brand border-transparent text-white shadow-[var(--shadow-red)]" : "border-border bg-white"
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${i === 0 ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-accent-soft text-accent"}`}>
                    <FeatureIcon name={f.icon} size={21} />
                  </span>
                  <h3 className={`mt-5 text-lg font-bold ${i === 0 ? "text-white" : ""}`}>{f.label}</h3>
                  <p className={`mt-2 flex-1 text-sm leading-relaxed ${i === 0 ? "text-white/85" : "text-text-2"}`}>{pillars[f.slug]}</p>
                  <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${i === 0 ? "text-white" : "text-accent"}`}>
                    Learn more <IconArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
            <li className="reveal">
              <Link href="/features" className="card-hover group flex h-full flex-col justify-between rounded-3xl border border-border bg-surface-2 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">
                  <IconSparkles size={20} />
                </span>
                <div className="mt-5">
                  <h3 className="text-lg font-bold">And much more</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-2">Daily goals and streaks, a workspace per X account, 8 colour themes, dark mode and a command palette.</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  All features <IconArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          </ul>
        </Container>
      </Section>

      {/* SHOWCASE */}
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="See it in action" title="Built for the way you actually grow on X." center>
            Each part of GrowX handles one job well, and they all share what they learn.
          </SectionHeading>
          <div className="mt-16 space-y-24">
            <FeatureRow
              eyebrow="Grow"
              title={<>Pick a pace. <span className="text-gradient">Press Start.</span></>}
              body="GrowX follows the newest followers of accounts in your niche, the people most likely to follow you back, one at a time with breaks and caps. It keeps going in the background until you press Stop."
              bullets={[
                "Safe (~150 a day) and Balanced (~280 a day) paces on the free plan",
                "Follow-back score from 1 to 99 and filters that skip bots and inactive accounts",
                "Find sources for me: GrowX suggests sources from the accounts you follow",
              ]}
              image="/screens/grow.webp"
              alt="GrowX Grow page: Sources and pace with Safe, Balanced, Turbo, X Premium and Custom presets (demo data)"
              links={[{ href: "/features/twitter-auto-follow", label: "Smart auto follow" }]}
            />
            <FeatureRow
              reverse
              eyebrow="Create"
              title={<>Write once. <span className="text-gradient">Post at your best times.</span></>}
              body="Posts and threads with images, queue slots and a calendar. GrowX learns your best time to post from your own posts and when your followers are active."
              bullets={[
                "Post now, schedule, or add to your queue slots",
                "52 proven templates and a thread splitter that counts like X does",
                "GrowX AI writes ideas, hooks and threads on your computer (Premium)",
              ]}
              image="/screens/create.webp"
              alt="GrowX Create page: post composer with AI ideas, best time and queue slots (demo data)"
              links={[
                { href: "/features/twitter-post-scheduler", label: "Post scheduler" },
                { href: "/features/ai-tweet-writer", label: "GrowX AI writer" },
              ]}
            />
            <FeatureRow
              eyebrow="Insights"
              title={<>Know which posts <span className="text-gradient">bring followers.</span></>}
              body="Views, likes, replies, reposts and engagement for every post, a heat map of your best times and the topics and formats that work for your audience."
              bullets={[
                "Refreshed every 3 hours while x.com is open",
                "Topics and formats ranked by engagement",
                "Weekly report: this week vs last week (Premium)",
              ]}
              image="/screens/insights.webp"
              alt="GrowX Insights page: post numbers, best time to post heat map and what works by format (demo data)"
              links={[{ href: "/features/twitter-analytics", label: "Analytics" }]}
            />
            <FeatureRow
              reverse
              eyebrow="Followers"
              title={<>See who followed <span className="text-gradient">and who unfollowed you.</span></>}
              body="X doesn't tell you who unfollowed you. GrowX checks your follower list once a day and shows every change, plus how real your audience is and who your biggest fans are."
              bullets={[
                "New followers and unfollowers, day by day",
                "Follower quality: real, inactive, likely bots (Premium)",
                "Clean up accounts that don't follow back, at a safe pace",
              ]}
              image="/screens/followers.webp"
              alt="GrowX Followers page: new followers, unfollowers, follower quality score and unfollow back (demo data)"
              links={[
                { href: "/features/twitter-unfollower-tracker", label: "Unfollower tracker" },
                { href: "/features/twitter-unfollow-tool", label: "Unfollow tool" },
              ]}
            />
          </div>
        </Container>
      </Section>

      {/* HOW IT WORKS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="How it works" title="Set up in five minutes." center>
            A setup wizard walks you through it. After that, GrowX works in the background.
          </SectionHeading>
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="reveal relative rounded-3xl border border-border bg-white p-7">
                <span className="font-display text-sm font-extrabold text-accent">Step {i + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-text-2">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <LinkButton href="/how-it-works" variant="secondary">
              See the full walkthrough <IconArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* SAFETY */}
      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
        <div className="glow -right-24 top-0 h-96 w-96 bg-accent/30" aria-hidden="true" />
        <Container className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div className="reveal">
            <Eyebrow tone="light">Safety first</Eyebrow>
            <h2 className="mt-4 text-[2rem] font-extrabold leading-[1.1] sm:text-4xl lg:text-[2.7rem]">Paced like a careful person, not a bot.</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              GrowX respects the limits X signals. When X shows a warning it backs off by itself, and it stops completely when your account
              needs your attention. It never clicks through a challenge.
            </p>
            <p className="mt-5 text-sm text-white/50">No tool can promise zero risk. Start with the Safe or Balanced pace.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {safety.map((s) => (
              <li key={s.t} className="reveal flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                  <s.icon size={18} />
                </span>
                <span className="text-sm font-semibold text-white/90">{s.t}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* PRIVATE BY DESIGN */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Private by design" title="Your data stays with you." center />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: IconLock, t: "No X password", b: "GrowX works in the x.com session already signed in to Chrome. No password, no X OAuth." },
              { icon: IconShield, t: "Stored in your browser", b: "Your queue, history, posts and analytics live in Chrome's storage on your computer. Export a backup any time." },
              { icon: IconSparkles, t: "AI on your computer", b: "GrowX AI uses the model built into Chrome. Your drafts are never sent to GrowX, and there is no API key." },
            ].map((c) => (
              <li key={c.t} className="reveal rounded-3xl border border-border bg-white p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ok-soft text-ok">
                  <c.icon size={21} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{c.t}</h3>
                <p className="mt-2 leading-relaxed text-text-2">{c.b}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* PRICING TEASER */}
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Pricing" title="Free forever. Premium when you want more." center>
            Start free and try every Premium feature for {TRIAL_DAYS} days. No credit card needed.
          </SectionHeading>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="reveal rounded-3xl border border-border bg-white p-8">
              <h3 className="text-lg font-bold">Free</h3>
              <p className="mt-3">
                <span className="font-display text-5xl font-extrabold">$0</span> <span className="text-muted">forever</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                {["Safe & Balanced auto follow", "Schedule up to 10 posts at a time", "Analytics for your latest 30 posts", "Who unfollowed you (7 days)", "Reply targets and cleanup scan"].map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconCheck size={18} className="shrink-0 text-ok" /> {t}
                  </li>
                ))}
              </ul>
              <LinkButton href="/signup" variant="secondary" className="mt-8 w-full">
                Get started free
              </LinkButton>
            </div>
            <div className="reveal relative overflow-hidden rounded-3xl border-2 border-accent bg-white p-8 shadow-[0_30px_60px_-30px_rgba(225,29,46,0.5)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Premium</h3>
                <Badge tone="solid">Best value: yearly</Badge>
              </div>
              <p className="mt-3">
                <span className="font-display text-5xl font-extrabold">{yearly.priceLabel}</span> <span className="text-muted">/ year</span>
              </p>
              <p className="mt-1 text-sm text-muted">or $1.99 / 30 days · lifetime $59.99 ($29.99 early bird)</p>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                {["Everything in Free", "GrowX AI writer and unlimited scheduling", "Turbo & X Premium paces, smart score", "Full analytics, weekly report, follower quality", "Bulk unfollow and automatic cleanup"].map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconCheck size={18} className="shrink-0 text-accent" /> {t}
                  </li>
                ))}
              </ul>
              <LinkButton href="/pricing" className="mt-8 w-full">
                See plans <IconArrowRight size={16} />
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* FREE TOOLS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Free tools" title="Free X (Twitter) tools, right in your browser." center>
            No sign-up, nothing to install, nothing you type leaves your computer.
          </SectionHeading>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {toolNav.map((t) => (
              <li key={t.href} className="reveal">
                <Link href={t.href} className="card-hover group flex h-full flex-col rounded-3xl border border-border bg-white p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <IconTool size={19} />
                  </span>
                  <h3 className="mt-4 font-bold leading-snug">{t.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-text-2">{t.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Open tool <IconArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* BLOG */}
      <Section className="bg-surface-2">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Guides" title="Learn to grow on X" />
            <LinkButton href="/blog" variant="secondary">
              All articles <IconArrowRight size={16} />
            </LinkButton>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {latestFirst()
              .slice(0, 3)
              .map((p) => (
                <li key={p.slug} className="relative">
                  <PostCard post={p} />
                </li>
              ))}
          </ul>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading eyebrow="FAQ" title="Questions, answered.">
            Something else on your mind?{" "}
            <Link href="/contact" className="font-semibold text-accent underline-offset-4 hover:underline">
              Contact support
            </Link>
            .
          </SectionHeading>
          <div className="reveal">
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
