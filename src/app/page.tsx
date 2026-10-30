import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { PostCard } from "@/components/blog";
import { Bento } from "@/components/home/bento";
import { CtaBand } from "@/components/home/cta-band";
import { FactStrip } from "@/components/home/fact-strip";
import { Faq } from "@/components/home/faq";
import { PaceConsole } from "@/components/home/pace-console";
import { PrivacyMap } from "@/components/home/privacy-map";
import { showcaseSteps } from "@/components/home/showcase-chapter";
import {
  IconActivity,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconChrome,
  IconClock,
  IconGauge,
  IconKeyboard,
  IconLock,
  IconMoon,
  IconShield,
  IconSparkles,
  IconWand,
  IconZap,
} from "@/components/icons";
import { JsonLd, faqLd, softwareLd } from "@/components/json-ld";
import { Screenshot } from "@/components/marketing/screenshot";
import { Backdrop } from "@/components/motion/backdrop";
import { BorderBeam } from "@/components/motion/border-beam";
import { InkStage } from "@/components/motion/ink-stage";
import { Kbd } from "@/components/motion/kbd";
import { Marquee } from "@/components/motion/marquee";
import { ScrollStory } from "@/components/motion/scroll-story";
import { SettleWords } from "@/components/motion/settle-words";
import { Stage3D } from "@/components/motion/stage";
import { cssVars, stagger } from "@/components/motion/stagger";
import { StepRail } from "@/components/motion/step-rail";
import { ToolGlyph, toolKey } from "@/components/motion/tool-glyph";
import { WordRoll } from "@/components/motion/word-roll";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container, Eyebrow, IconBubble, Section, SectionHeading } from "@/components/ui/primitives";
import { toolNav } from "@/config/nav";
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

const steps: { icon: Icon; title: string; body: string }[] = [
  { icon: IconChrome, title: "Add GrowX to Chrome", body: "Install the free extension. It works inside your own x.com session and never asks for your X password." },
  { icon: IconGauge, title: "Add sources, pick a pace", body: "Name a few accounts in your niche, or let GrowX find them. Choose Safe or Balanced and press Start." },
  { icon: IconCalendar, title: "Post, reply and measure", body: "Queue a few posts for your best times, reply early to fresh posts and see what brings followers." },
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

const privacy: { id: "session" | "storage" | "ai"; micro: string; icon: Icon; t: string; b: string }[] = [
  { id: "session", micro: "x.com session", icon: IconLock, t: "No X password", b: "GrowX works in the x.com session already signed in to Chrome. No password, no X OAuth." },
  { id: "storage", micro: "chrome.storage", icon: IconShield, t: "Stored in your browser", b: "Your queue, history, posts and analytics live in Chrome's storage on your computer. Export a backup any time." },
  { id: "ai", micro: "Chrome's built-in AI", icon: IconSparkles, t: "AI on your computer", b: "GrowX AI uses the model built into Chrome. Your drafts are never sent to GrowX, and there is no API key." },
];

const moreInGrowX = [
  "Command palette · Ctrl+K",
  "8 colour themes",
  "Dark mode",
  "Daily goals and streaks",
  "Workspace per X account (Premium)",
  "Chrome sync",
  "Backup and restore",
  "Evergreen recycling (Premium)",
  "Auto-plug (Premium)",
  "Weekly report (Premium)",
  "VIP alerts (Premium)",
  "List import (Premium)",
  "Emergency stop · Alt+Shift+S",
  "Chrome 116+ · desktop",
] as const;

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

/** A glass fact chip over the hero stage edge (md+, aria-hidden via Stage3D, static once popped in). */
function HeroChip({ i, icon, title, sub, premium = false, className }: { i: number; icon: ReactNode; title: string; sub?: string; premium?: boolean; className: string }) {
  return (
    <span
      className={`chip-in absolute flex max-w-[15rem] items-center gap-2.5 rounded-2xl border border-hairline bg-white/90 px-3 py-2.5 text-left text-sm shadow-[var(--shadow-float)] ${className}`}
      style={stagger(i)}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink ring-1 ring-accent/15">{icon}</span>
      <span className="grid min-w-0 gap-0.5 leading-tight">
        <span className="flex flex-wrap items-center gap-1.5 font-semibold text-text">
          {title}
          {premium ? (
            <span className="rounded-full bg-accent-soft px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.08em] text-accent-ink">Premium</span>
          ) : null}
        </span>
        {sub ? <span className="text-xs text-text-2 tabular-nums">{sub}</span> : null}
      </span>
    </span>
  );
}

const heroChips = (
  <>
    <HeroChip i={0} className="-left-3 top-[26%] lg:-left-6 xl:-left-10" icon={<IconGauge size={16} />} title="Balanced pace" sub="30-75 s between follows" />
    <HeroChip i={1} className="-right-3 top-[14%] lg:-right-6 xl:-right-10" icon={<IconCalendar size={16} />} title="Queue slots" sub="09:00 · 13:00 · 18:30" />
    <HeroChip i={2} className="-right-3 top-[64%] lg:-right-6 xl:-right-10" icon={<IconWand size={16} />} title="GrowX AI runs on your computer" premium />
  </>
);

export default function HomePage() {
  const yearly = getTier("PRO_YEARLY");
  return (
    <>
      <JsonLd data={[softwareLd, faqLd(faqs)]} />

      {/* HERO: settles in (never fades), then the stage straightens with scroll */}
      <section className="relative overflow-clip" data-ambient="">
        <Backdrop variant="hero" beams={2} travel={1100} />
        <Container className="relative pb-12 pt-14 text-center sm:pt-20">
          <div className="hero-settle" style={stagger(0)}>
            <Link
              href="/blog/growx-potential-best-practices-roadmap"
              className="group inline-flex max-w-full items-center gap-2 rounded-3xl border border-hairline-strong bg-white/85 sm:rounded-full py-1 pl-1 pr-3 text-sm font-semibold text-text-2 shadow-[var(--shadow-hair)] hover:border-accent/30"
            >
              <span className="relative shrink-0 overflow-clip rounded-full bg-brand-deep px-2.5 py-0.5 text-xs font-bold text-white">
                New
                <span aria-hidden="true" data-decor="" className="stage-sweep" />
              </span>
              <span className="min-w-0 text-left sm:whitespace-nowrap">Version 2.4.4: scheduler, AI writer and analytics</span>
              <IconArrowRight size={15} className="nudge shrink-0 text-accent-ink" />
            </Link>
          </div>
          <h1 className="mx-auto mt-7 max-w-5xl text-display font-extrabold [text-wrap:balance]" style={stagger(1)}>
            <SettleWords text="The ultimate" />{" "}
            <span className="settle-word" style={cssVars({ "--w": 2 })}>
              <span className="text-gradient text-sheen">X (Twitter) growth tool</span>
            </span>
          </h1>
          <p className="hero-settle mt-5 font-display text-[clamp(1.125rem,0.95rem+1vw,1.6rem)] font-semibold text-text" style={stagger(2)}>
            Built to{" "}
            <WordRoll
              align="center"
              className="text-accent-ink max-sm:grid"
              phrases={[
                "follow the right people",
                "schedule posts and threads",
                "write with on-device AI",
                "see which posts work",
                "spot who unfollowed you",
                "reply early to fresh posts",
                "clean up your following",
              ]}
              srText="follow the right people, schedule posts and threads, write with on-device AI, see which posts work, spot who unfollowed you, reply early to fresh posts and clean up your following."
            />
          </p>
          <p className="hero-settle mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-2 [text-wrap:pretty] sm:text-xl" style={stagger(3)}>
            GrowX follows the right people, posts at your best times, writes with on-device AI and shows you what works. One simple
            Chrome extension, free to start.
          </p>
          <div className="hero-settle mt-9 flex flex-col justify-center gap-3 sm:flex-row" style={stagger(4)}>
            {site.chromeStoreUrl ? (
              <ExternalButton href={site.chromeStoreUrl} size="lg" data-magnetic="6">
                <IconChrome size={20} /> Add to Chrome, it&apos;s free
              </ExternalButton>
            ) : null}
            <LinkButton href="/signup" variant="secondary" size="lg">
              Create free account <IconArrowRight size={18} className="nudge" />
            </LinkButton>
          </div>
          <ul className="hero-settle mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-text-2" style={stagger(5)}>
            {["Free plan forever", `${TRIAL_DAYS}-day Premium trial, no credit card`, "Never asks for your X password"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <IconCheck size={16} className="text-accent" /> {t}
              </li>
            ))}
          </ul>
          <div className="relative mx-auto mt-14 max-w-5xl">
            <Stage3D variant="hero" caption="Screenshots show demo data." chips={heroChips}>
              <Screenshot
                src="/screens/overview.webp"
                alt="GrowX dashboard: today's follows and goals, posts up next on X, this week's numbers and the popup with the Balanced pace running (demo data)"
                priority
                sizes="(min-width: 1280px) 1024px, 100vw"
              />
            </Stage3D>
          </div>
        </Container>
      </section>

      <FactStrip />

      {/* PILLARS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Everything in one extension" title="Seven growth tools. One simple dashboard." center>
            Stop juggling a follow tool, a scheduler and an analytics app. GrowX does the daily work of growing on X in one place.
          </SectionHeading>
          <Bento />
          <Marquee
            className="mt-12"
            label="More in GrowX"
            items={moreInGrowX.map((t) => (
              <span key={t} className="inline-flex whitespace-nowrap rounded-full border border-hairline bg-white px-3 py-1 text-sm text-text-2 shadow-[var(--shadow-hair)]">
                {t}
              </span>
            ))}
          />
        </Container>
      </Section>

      {/* SHOWCASE: sticky scroll story at lg, alternating rows elsewhere */}
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="See it in action" title="Built for the way you actually grow on X." center>
            Each part of GrowX handles one job well, and they all share what they learn.
          </SectionHeading>
          <ScrollStory className="mt-16" caption="Screenshots show demo data." rowsCaption={false} steps={showcaseSteps()} />
        </Container>
      </Section>

      {/* HOW IT WORKS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="How it works" title="Set up in five minutes." center>
            A setup wizard walks you through it. After that, GrowX works in the background.
          </SectionHeading>
          <StepRail
            className="mt-14"
            orientation="responsive"
            itemClassName="reveal"
            steps={steps.map((s, i) => ({
              key: s.title,
              marker: i + 1,
              content: (
                <div className="rounded-3xl border border-hairline bg-white p-6 shadow-[var(--shadow-hair)] sm:p-7">
                  <div className="flex items-center gap-3">
                    <IconBubble>
                      <s.icon size={20} />
                    </IconBubble>
                    <span className="font-display text-sm font-extrabold text-accent-ink">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-text-2 [text-wrap:pretty]">{s.body}</p>
                </div>
              ),
            }))}
          />
          <div className="reveal mt-10 text-center">
            <LinkButton href="/how-it-works" variant="secondary">
              See the full walkthrough <IconArrowRight size={16} className="nudge" />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* SAFETY: an ink chapter whose background opens like a curtain */}
      <InkStage curtain className="py-20 sm:py-28" aria-labelledby="safety-title">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <div className="reveal" style={stagger(0)}>
                <Eyebrow tone="light">Safety first</Eyebrow>
              </div>
              <h2 id="safety-title" className="reveal-heading mt-4 text-section font-extrabold [text-wrap:balance]" style={stagger(1)}>
                Paced like a careful person, not a bot.
              </h2>
              <p className="reveal mt-4 max-w-[60ch] text-lg leading-relaxed text-white/70 [text-wrap:pretty]" style={stagger(2)}>
                GrowX respects the limits X signals. When X shows a warning it backs off by itself, and it stops completely when your account
                needs your attention. It never clicks through a challenge.
              </p>
              <p className="reveal mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-white" style={stagger(3)}>
                Emergency stop
                <span className="inline-flex items-center gap-1.5 text-white/75">
                  <Kbd tone="ink" press i={0}>
                    Alt
                  </Kbd>
                  +
                  <Kbd tone="ink" press i={1}>
                    Shift
                  </Kbd>
                  +
                  <Kbd tone="ink" press i={2}>
                    S
                  </Kbd>
                </span>
              </p>
              <p className="reveal mt-5 text-sm text-white/75" style={stagger(4)}>
                No tool can promise zero risk. Start with the Safe or Balanced pace.
              </p>
            </div>
            <div className="reveal" style={stagger(1)}>
              <PaceConsole />
            </div>
          </div>
          <ul data-spotlight-group="" className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {safety.map((s, i) => (
              <li
                key={s.t}
                data-spotlight="ink"
                className="reveal flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                style={stagger(i % 4)}
              >
                <span className="bg-brand-deep flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white">
                  <s.icon size={18} />
                </span>
                <span className="text-sm font-semibold text-white/90">{s.t}</span>
              </li>
            ))}
          </ul>
        </Container>
      </InkStage>

      {/* PRIVATE BY DESIGN */}
      <Section>
        <Container>
          <SectionHeading eyebrow="Private by design" title="Your data stays with you." center />
          <div className="mt-12">
            <PrivacyMap>
              <ul data-spotlight-group="" className="grid gap-5 md:grid-cols-3">
                {privacy.map((c, i) => (
                  <li
                    key={c.t}
                    data-spotlight="ok"
                    data-privacy={c.id}
                    className="reveal rounded-3xl border border-hairline bg-white p-7 shadow-[var(--shadow-hair)]"
                    style={stagger(i)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#fff,var(--ok-soft))] text-ok shadow-[inset_0_1px_0_#fff,var(--shadow-hair)] ring-1 ring-ok/20">
                        <c.icon size={21} />
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-muted">{c.micro}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold">{c.t}</h3>
                    <p className="mt-2 leading-relaxed text-text-2 [text-wrap:pretty]">{c.b}</p>
                  </li>
                ))}
              </ul>
            </PrivacyMap>
          </div>
        </Container>
      </Section>

      {/* PRICING TEASER: prices never move */}
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Pricing" title="Free forever. Premium when you want more." center>
            Start free and try every Premium feature for {TRIAL_DAYS} days. No credit card needed.
          </SectionHeading>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="lift rounded-3xl border border-hairline bg-white p-8 shadow-[var(--shadow-hair)]">
              <h3 className="text-lg font-bold">Free</h3>
              <p className="mt-3">
                <span className="font-display text-5xl font-extrabold tabular-nums">$0</span> <span className="text-muted">forever</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                {["Safe & Balanced auto follow", "Schedule up to 10 posts at a time", "Analytics for your latest 30 posts", "Who unfollowed you (7 days)", "Reply targets and cleanup scan"].map((t, i) => (
                  <li key={t} className="reveal flex gap-2" style={stagger(i)}>
                    <IconCheck size={18} className="shrink-0 text-ok" /> {t}
                  </li>
                ))}
              </ul>
              <LinkButton href="/signup" variant="secondary" className="mt-8 w-full">
                Get started free
              </LinkButton>
            </div>
            <div className="relative">
              <div aria-hidden="true" data-decor="" className="glow-soft -bottom-10 left-[10%] right-[10%] h-28 [--glow:rgba(225,29,46,0.3)]" />
              <div className="relative rounded-3xl border border-accent/30 bg-white p-8 shadow-[var(--shadow-glow)]">
                <BorderBeam mode="loop" />
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Premium</h3>
                  <span className="reveal-scale bg-brand-deep inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                    Best value: yearly
                  </span>
                </div>
                <p className="mt-3">
                  <span className="font-display text-5xl font-extrabold tabular-nums">{yearly.priceLabel}</span> <span className="text-muted">/ year</span>
                </p>
                <p className="mt-1 text-sm text-muted tabular-nums">or $1.99 / 30 days · lifetime $59.99 ($29.99 early bird)</p>
                <ul className="mt-6 space-y-3 text-sm text-text-2">
                  {["Everything in Free", "GrowX AI writer and unlimited scheduling", "Turbo & X Premium paces, smart score", "Full analytics, weekly report, follower quality", "Bulk unfollow and automatic cleanup"].map((t, i) => (
                    <li key={t} className="reveal flex gap-2" style={stagger(i)}>
                      <IconCheck size={18} className="shrink-0 text-accent-ink" /> {t}
                    </li>
                  ))}
                </ul>
                <LinkButton href="/pricing" className="mt-8 w-full">
                  See plans <IconArrowRight size={16} className="nudge" />
                </LinkButton>
              </div>
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
          <ul data-spotlight-group="" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toolNav.map((t, i) => (
              <li key={t.href} className="reveal" style={stagger(i % 4)}>
                <Link
                  href={t.href}
                  data-spotlight=""
                  className="group lift flex h-full flex-col rounded-3xl border border-hairline bg-white p-5 shadow-[var(--shadow-hair)]"
                >
                  <ToolGlyph tool={toolKey(t.href)} />
                  <h3 className="mt-4 font-bold leading-snug">{t.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-text-2">{t.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">
                    Open tool <IconArrowRight size={15} className="nudge" />
                  </span>
                </Link>
              </li>
            ))}
            <li className="reveal" style={stagger(toolNav.length % 4)}>
              <Link
                href="/tools"
                data-spotlight="ink"
                className="group lift on-ink flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-ink p-5 text-white"
              >
                <span className="bg-brand-deep flex size-14 items-center justify-center rounded-2xl text-white">
                  <IconArrowRight size={20} className="nudge" />
                </span>
                <span className="mt-4 font-bold">All free tools</span>
              </Link>
            </li>
          </ul>
        </Container>
      </Section>

      {/* BLOG */}
      <Section className="bg-surface-2">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Guides" title="Learn to grow on X" />
            <LinkButton href="/blog" variant="secondary">
              All articles <IconArrowRight size={16} className="nudge" />
            </LinkButton>
          </div>
          <ul data-spotlight-group="" className="mt-10 grid gap-6 md:grid-cols-3">
            {latestFirst()
              .slice(0, 3)
              .map((p, i) => (
                <li key={p.slug} className="relative" style={stagger(i % 3)}>
                  <PostCard post={p} />
                </li>
              ))}
          </ul>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading eyebrow="FAQ" title="Questions, answered.">
              Something else on your mind?{" "}
              <Link href="/contact" className="font-semibold text-accent-ink underline-offset-4 hover:underline">
                Contact support
              </Link>
              .
            </SectionHeading>
          </div>
          <div className="reveal">
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
