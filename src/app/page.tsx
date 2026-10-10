import Link from "next/link";
import type { ComponentType } from "react";
import { JsonLd, faqLd, softwareLd } from "@/components/json-ld";
import { PostCard } from "@/components/blog";
import { latestFirst } from "@/content/posts";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { HeroPreview } from "@/components/home/hero-preview";
import {
  IconActivity,
  IconArrowRight,
  IconBroom,
  IconChart,
  IconCheck,
  IconChrome,
  IconClock,
  IconDownload,
  IconFilter,
  IconGauge,
  IconKeyboard,
  IconLock,
  IconMoon,
  IconShield,
  IconTarget,
  IconZap,
} from "@/components/icons";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Badge, Container, Eyebrow, IconBubble, Section, SectionHeading } from "@/components/ui/primitives";
import { getTier, TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX: X (Twitter) Auto Follow Chrome Extension",
  absoluteTitle: true,
  description: "Free X (Twitter) auto follow Chrome extension. Find people likely to follow back, follow at a human pace with safety limits, track growth and clean up your account.",
  path: "/",
  keywords: ["X auto follow Chrome extension", "Twitter auto follow tool", "increase X followers", "follow back score", "Twitter unfollow tool", "X follower growth"],
});

type Icon = ComponentType<{ size?: number; className?: string }>;

const marquee = [
  "Follow-back scoring",
  "Source targeting",
  "Human-like pacing",
  "Hourly & daily caps",
  "Active hours",
  "Warm-up mode",
  "Adaptive slow-down",
  "Follow verification",
  "Growth analytics",
  "Cleanup scan",
  "Backup & restore",
  "Emergency stop",
];

const steps: { icon: Icon; title: string; body: string }[] = [
  { icon: IconChrome, title: "Install & sign in to X", body: "GrowX works through your own x.com session in Chrome. It never asks for your X password." },
  { icon: IconTarget, title: "Add source profiles", body: "Pick accounts in your niche. GrowX reads their newest followers: active people who follow accounts like yours." },
  { icon: IconGauge, title: "Everyone gets scored", body: "Follow ratio, audience size, recent activity, a real profile and follow-back language. Only likely follow-backers are queued." },
  { icon: IconZap, title: "Autopilot does the rest", body: "One follow at a time with randomised delays, breaks and caps. It tracks who follows back and which sources work." },
];

const bento: { icon: Icon; title: string; body: string; wide?: boolean }[] = [
  { icon: IconTarget, title: "Follow-back scoring", body: "Every candidate gets an estimated 1-99 follow-back score from signals like follow ratio, audience size and recent activity, so your follows go where they are most likely to be returned.", wide: true },
  { icon: IconFilter, title: "Targeting filters", body: "Audience size, follow ratio, account age, last activity, profile photo, keywords and more." },
  { icon: IconBroom, title: "Cleanup tools", body: "Scan who you follow, find inactive accounts and people who don't follow back, review, then unfollow." },
  { icon: IconChart, title: "Growth analytics", body: "Follow-back tracking, source performance, a growth chart and a monthly goal planner." },
  { icon: IconDownload, title: "Backup & restore", body: "Export settings, sources, never-follow list and history to a file. Import it any time." },
  { icon: IconLock, title: "Local by design", body: "Settings, queue and history live in your browser storage. GrowX talks only to x.com for your account and does not upload your X data.", wide: true },
];

const safety: { icon: Icon; t: string }[] = [
  { icon: IconClock, t: "Randomised delays and regular breaks" },
  { icon: IconGauge, t: "Rolling hourly and daily caps" },
  { icon: IconMoon, t: "Active hours and day schedule" },
  { icon: IconZap, t: "Warm-up mode for new accounts" },
  { icon: IconShield, t: "Automatic slow-down after any X warning" },
  { icon: IconCheck, t: "Verifies that follows actually stick" },
  { icon: IconKeyboard, t: "Emergency stop: Alt + Shift + S" },
  { icon: IconActivity, t: "Resumes by itself after a Chrome restart" },
];

const faqs = [
  { q: "Is GrowX free?", a: "Yes. Core features stay free: the Safe and Balanced autopilot, sources and queue, core filters, history, analytics, backup and the cleanup scan. Premium adds higher volume, advanced filters and bulk tools." },
  { q: "Do I need to give GrowX my X password?", a: "No. GrowX works through the X session that is already signed in in your Chrome browser. It never sees or stores your X password, and it does not use X OAuth." },
  { q: "Is it safe for my account?", a: "No tool can promise zero risk; X decides. GrowX is built to behave like a careful person: randomised delays, breaks, hourly and daily caps, active hours, warm-up and an automatic slow-down whenever X shows a warning." },
  { q: `How does the ${TRIAL_DAYS}-day trial work?`, a: `Create a free account, add your X username and start the trial from your dashboard when you are ready. It runs for ${TRIAL_DAYS} days, needs no payment details, and each account can use it once.` },
  { q: "Can I buy Premium today?", a: "Yes. Premium is available now for $1.99 for 30 days, $14.99 for 365 days or $29.99 lifetime, paid in cryptocurrency through NOWPayments. You can also try every Premium feature free for 30 days, with no credit card and no commitment." },
];

export default function HomePage() {
  const yearly = getTier("PRO_YEARLY");
  return (
    <>
      <JsonLd data={[softwareLd, faqLd(faqs)]} />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <div className="glow -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 bg-accent/12" aria-hidden="true" />
        <Container className="relative grid items-center gap-14 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <div className="animate-fade-up">
              <Eyebrow>X (Twitter) auto follow Chrome extension</Eyebrow>
            </div>
            <h1 className="animate-fade-up mt-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight [animation-delay:80ms] sm:text-6xl lg:text-[4.2rem]">
              Grow your X audience <span className="text-gradient">on autopilot.</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-2 [animation-delay:160ms] lg:mx-0">
              GrowX is a free <strong className="font-semibold text-text">X auto follow</strong> Chrome extension: it finds people likely to
              follow you back, follows them one at a time at a human pace, and shows you what is working. Safety limits are built in.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col justify-center gap-3 [animation-delay:240ms] sm:flex-row lg:justify-start">
              {site.chromeStoreUrl ? (
                <ExternalButton href={site.chromeStoreUrl} size="lg">
                  <IconChrome size={20} /> Add to Chrome, it&apos;s free
                </ExternalButton>
              ) : null}
              <LinkButton href="/signup" variant="secondary" size="lg">
                Create account <IconArrowRight size={18} />
              </LinkButton>
            </div>
            <ul className="animate-fade-up mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-text-2 [animation-delay:320ms] lg:justify-start">
              {["Free core features", `${TRIAL_DAYS}-day Premium trial`, "No X password needed"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <IconCheck size={16} className="text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroPreview />
        </Container>
      </section>

      {/* MARQUEE */}
      <div className="marquee-pause relative overflow-hidden border-y border-border bg-surface-2 py-4" aria-label="Feature list">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-surface-2 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-surface-2 to-transparent" />
        <ul className="animate-marquee flex w-max gap-3">
          {[...marquee, ...marquee].map((m, i) => (
            <li
              key={i}
              aria-hidden={i >= marquee.length ? true : undefined}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-white px-4 py-1.5 text-sm font-semibold text-text-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {m}
            </li>
          ))}
        </ul>
      </div>

      {/* HOW IT WORKS */}
      <Section>
        <Container>
          <SectionHeading eyebrow="How it works" title="Four steps. Then it runs by itself." center>
            Set it up once. GrowX keeps working in the background until you press stop, and survives tab switches and
            browser restarts.
          </SectionHeading>
          <ol className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-11 hidden h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 lg:block" aria-hidden="true" />
            {steps.map((s, i) => (
              <li key={s.title} className="reveal card-hover relative rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <IconBubble>
                    <s.icon size={22} />
                  </IconBubble>
                  <span className="font-display text-4xl font-extrabold text-accent/10">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* FEATURES BENTO */}
      <Section className="bg-tint">
        <Container>
          <SectionHeading eyebrow="Features" title={<>Everything you need to grow, <span className="text-gradient">nothing you don&apos;t.</span></>}>
            All of this is in the GrowX extension today.
          </SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {bento.map((b) => (
              <div
                key={b.title}
                className={`reveal card-hover group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] ${
                  b.title === "Local by design" ? "md:col-span-3" : b.wide ? "md:col-span-2" : ""
                }`}
              >
                <div className="glow -right-16 -top-16 h-40 w-40 bg-accent/0 transition-colors duration-500 group-hover:bg-accent/15" aria-hidden="true" />
                <IconBubble className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <b.icon size={22} />
                </IconBubble>
                <h3 className="mt-5 text-lg font-bold">{b.title}</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-2">{b.body}</p>
                {b.wide && b.title === "Follow-back scoring" ? (
                  <div className="mt-6 grid grid-cols-5 items-end gap-2" aria-hidden="true">
                    {["<50", "50-59", "60-69", "70-79", "80+"].map((band, i) => (
                      <div key={band} className="text-center">
                        <div className="mx-auto flex h-20 items-end">
                          <div className="bg-brand w-full rounded-t-md opacity-90" style={{ height: `${30 + i * 16}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] font-semibold text-muted">{band}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {b.title === "Local by design" ? (
                  <ul className="mt-5 flex flex-wrap gap-2 md:absolute md:right-6 md:top-1/2 md:mt-0 md:max-w-[22rem] md:-translate-y-1/2 md:justify-end" aria-label="Data handling">
                    {["Stored in chrome.storage", "Requests go to x.com only", "Export or delete any time"].map((c) => (
                      <li key={c} className="flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1.5 text-xs font-semibold text-ok">
                        <IconCheck size={13} /> {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {b.title === "Targeting filters" ? (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Example filters">
                    {["Min followers", "Follow ratio", "Last active", "Account age", "Has photo", "Keywords"].map((c) => (
                      <li key={c} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-text-2 transition-colors group-hover:border-accent/30 group-hover:text-accent">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <LinkButton href="/features" variant="secondary">
              Explore all features <IconArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* SAFETY */}
      <Section>
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Safety first" title="Paced like a careful person, not a bot.">
              GrowX respects every limit X signals. When X shows a warning, it backs off automatically, and it stops
              completely when your account needs your attention.
            </SectionHeading>
            <p className="reveal mt-6 text-sm text-muted">
              No tool can promise zero risk. Start with the Safe or Balanced pace and use active hours.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {safety.map((s) => (
              <li key={s.t} className="reveal card-hover flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-[var(--shadow-soft)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
                  <s.icon size={18} />
                </span>
                <span className="text-sm font-semibold">{s.t}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* PRICING TEASER */}
      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Pricing" title="Free forever. Premium when you want more." center>
            Start free and try every Premium feature for {TRIAL_DAYS} days. No card needed.
          </SectionHeading>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="reveal card-hover rounded-3xl border border-border bg-white p-8 shadow-[var(--shadow-soft)]">
              <h3 className="text-lg font-bold">Free</h3>
              <p className="mt-3">
                <span className="font-display text-5xl font-extrabold">$0</span> <span className="text-muted">forever</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                {["Safe & Balanced autopilot", "Sources, scored queue, core filters", "History, analytics & backup", "Cleanup scan & manual unfollow"].map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconCheck size={18} className="shrink-0 text-ok" /> {t}
                  </li>
                ))}
              </ul>
              <LinkButton href="/signup" variant="secondary" className="mt-8 w-full">
                Get started free
              </LinkButton>
            </div>
            <div className="reveal card-hover relative overflow-hidden rounded-3xl border-2 border-accent bg-white p-8 shadow-[0_30px_60px_-30px_rgba(225,29,46,0.5)]">
              <div className="glow -right-10 -top-10 h-40 w-40 bg-accent/20" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Premium</h3>
                  <Badge tone="solid">Best value: yearly</Badge>
                </div>
                <p className="mt-3">
                  <span className="font-display text-5xl font-extrabold">{yearly.priceLabel}</span> <span className="text-muted">/ year</span>
                </p>
                <p className="mt-1 text-sm text-muted">or $1.99 / month · $29.99 lifetime</p>
                <ul className="mt-6 space-y-3 text-sm text-text-2">
                  {["Everything in Free", "Turbo & X Premium paces", "Advanced keyword, location & age filters", "Bulk import & high-volume cleanup"].map((t) => (
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
          </div>
        </Container>
      </Section>

      {/* BLOG */}
      <Section className="bg-surface-2">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Learn more" title="Guides from the developer" />
            <LinkButton href="/blog" variant="secondary">
              All articles <IconArrowRight size={16} />
            </LinkButton>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {latestFirst().map((p) => (
              <li key={p.slug} className="relative"><PostCard post={p} /></li>
            ))}
          </ul>
          <p className="mt-8 text-center text-text-2">
            New to GrowX? Start with <Link href="/how-it-works" className="font-semibold text-accent hover:underline">how it works</Link> or{" "}
            <Link href="/about" className="font-semibold text-accent hover:underline">about the project</Link>.
          </p>
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
