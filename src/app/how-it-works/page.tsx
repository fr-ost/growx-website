import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconBroom, IconChart, IconChrome, IconMessage, IconPen, IconShield, IconSparkles, IconTarget, IconZap } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd } from "@/components/json-ld";
import { LinkButton } from "@/components/ui/button";
import { Container, IconBubble, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How GrowX Works: Grow on X (Twitter) Step by Step",
  description:
    "How the GrowX Chrome extension works: add sources and auto follow safely, schedule posts for your best times, reply early, read your analytics and clean up.",
  path: "/how-it-works",
  keywords: ["how to grow on Twitter", "how GrowX works", "Twitter growth routine", "how X auto follow works", "X follow limits per day", "schedule tweets"],
});

const steps = [
  { icon: IconChrome, name: "Install GrowX and sign in to X", text: "Add the free extension from the Chrome Web Store and make sure you are signed in at x.com. GrowX works through your own browser session: it never asks for your X password and does not use X OAuth." },
  { icon: IconSparkles, name: "Run the setup wizard", text: "Tell GrowX what your account is about and set simple daily goals for posts, replies and new followers. The wizard points you to the right pages; it takes a few minutes." },
  { icon: IconTarget, name: "Add sources and pick a pace", text: "Add accounts in your niche, or press Find sources for me. GrowX follows their newest followers first, then ranks everyone else by a follow-back score from 1 to 99. Choose Safe or Balanced and press Start." },
  { icon: IconShield, name: "GrowX follows at a careful, human pace", text: "One account at a time with random delays, breaks and rolling hourly and daily caps. It slows down by itself after any X warning, checks that follows stick and stops completely if X needs your attention." },
  { icon: IconPen, name: "Queue posts for your best times", text: "Write posts and threads with images, then post now, schedule or add them to your queue slots. GrowX learns your best time to post from your own posts and when your followers are active." },
  { icon: IconMessage, name: "Reply early to fresh posts", text: "Reply targets lists fresh posts from big accounts in your niche, ranked by how fast they take off. Reply and like from GrowX; nothing is sent unless you press the button." },
  { icon: IconChart, name: "Check your insights every week", text: "See every post's numbers, the topics and formats that work, who followed and who unfollowed you, and which sources bring follow-backs. Keep what works and drop the rest." },
  { icon: IconBroom, name: "Clean up when you are ready", text: "Scan your following list for accounts that don't follow back or went quiet, review the results and unfollow the ones you pick at a safe pace." },
];

const presets = [
  { name: "Safe", delay: "45-110 s", rest: "every 12 follows, 18 min", hourly: "18", daily: "~150", who: "New or warming-up accounts" },
  { name: "Balanced", delay: "30-75 s", rest: "every 18 follows, 14 min", hourly: "28", daily: "~280", who: "Recommended for most accounts" },
  { name: "Turbo", delay: "18-45 s", rest: "every 25 follows, 10 min", hourly: "40", daily: "~390", who: "Aged accounts with a clean record" },
  { name: "X Premium pace", delay: "12-32 s", rest: "every 35 follows, 8 min", hourly: "60", daily: "~800", who: "Accounts with X's own Premium subscription" },
];

const faqs = [
  { q: "How many people can GrowX follow per day?", a: "It depends on the pace: about 150 a day on Safe, 280 on Balanced, 390 on Turbo and 800 on the X Premium pace, always within rolling hourly and daily caps. X allows roughly 400 follows a day on a normal account, so the higher presets are meant for aged accounts or accounts with X Premium." },
  { q: "Does GrowX work if I close the popup or the X tab?", a: "Yes. The engine runs in the extension's background service worker and keeps going until you press Stop. It uses an open x.com tab or a small pinned one, and resumes after Chrome restarts. Chrome itself needs to stay open." },
  { q: "Do scheduled posts go out when my computer is off?", a: "No. GrowX posts through your signed-in x.com tab in Chrome, so Chrome must be running. A post that is more than six hours late is never posted by itself: it waits for you as missed." },
  { q: "What happens if X shows a warning?", a: "GrowX backs off automatically: it lowers its limits and rests before continuing, and posting pauses too. If you are signed out, the account is locked or X issues repeated automation warnings, it stops completely and never clicks through a challenge." },
  { q: "Is my data uploaded anywhere?", a: "Your settings, sources, queue, posts, history and analytics are stored in your browser. GrowX talks to x.com for your account and does not upload your X data. GrowX AI runs on your computer. Optional anonymous usage counts can be switched off." },
  { q: "Does GrowX need my X password or API keys?", a: "No. It works through the X session already signed in to your Chrome browser. It does not ask for, see or store your X password and does not use X OAuth or API keys." },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "How it works", path: "/how-it-works" }]),
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to grow on X (Twitter) with GrowX",
            description: "Set up the GrowX Chrome extension, auto follow likely follow-backs at a safe pace, schedule posts for your best times, reply early and measure what works.",
            totalTime: "PT10M",
            tool: [{ "@type": "HowToTool", name: "GrowX Chrome extension" }],
            step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text, url: `${abs("/how-it-works")}#step-${i + 1}` })),
          },
          faqLd(faqs),
        ]}
      />
      <PageHero eyebrow="How it works" title={<>How to grow on X with GrowX, <span className="text-gradient">step by step</span>.</>}>
        <p>From install to your weekly check-in: what the GrowX Chrome extension does for you, and the few minutes a day it leaves to you.</p>
      </PageHero>

      <Section>
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="The routine" title="Eight steps from setup to cleanup" />
          <ol className="mt-12 space-y-5">
            {steps.map((s, i) => (
              <li key={s.name} id={`step-${i + 1}`} className="reveal flex scroll-mt-28 gap-5 rounded-3xl border border-border bg-white p-6">
                <div className="flex flex-col items-center gap-2">
                  <IconBubble><s.icon size={22} /></IconBubble>
                  <span className="font-display text-sm font-extrabold text-accent">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="mt-2 leading-relaxed text-text-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-text-2">
            Want the details? Read{" "}
            <Link href="/blog/how-growx-auto-follow-works" className="font-semibold text-accent hover:underline">how GrowX auto follow works</Link>,{" "}
            <Link href="/blog/how-to-schedule-tweets" className="font-semibold text-accent hover:underline">how to schedule tweets</Link> or see every{" "}
            <Link href="/features" className="font-semibold text-accent hover:underline">feature</Link>.
          </p>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Pacing" title="Four paces, one set of safety rules" center>
            Values from the current extension (v2.4.4). Every preset adds occasional longer pauses, rolling caps and automatic slow-down.
          </SectionHeading>
          <div className="reveal mt-10 overflow-x-auto rounded-3xl border border-border bg-white">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">GrowX pace presets</caption>
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  {["Pace", "Delay between follows", "Break", "Per hour", "Per day", "Best for"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {presets.map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <th scope="row" className="px-4 py-3.5 font-bold text-accent">{p.name}</th>
                    <td className="px-4 py-3.5">{p.delay}</td>
                    <td className="px-4 py-3.5">{p.rest}</td>
                    <td className="px-4 py-3.5">{p.hourly}</td>
                    <td className="px-4 py-3.5">{p.daily}</td>
                    <td className="px-4 py-3.5 text-text-2">{p.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted">Higher presets are part of Premium. No tool can promise zero risk on X; you remain responsible for following X&apos;s rules.</p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading eyebrow="FAQ" title="How GrowX works: common questions">
            More questions? <Link href="/contact" className="font-semibold text-accent hover:underline">Contact support</Link>.
          </SectionHeading>
          <div className="reveal"><Faq items={faqs} /></div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container className="flex flex-wrap justify-center gap-3">
          <LinkButton href="/features" variant="secondary">All features <IconArrowRight size={16} /></LinkButton>
          <LinkButton href="/pricing" variant="secondary">Pricing <IconZap size={16} /></LinkButton>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
