import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconBroom, IconChart, IconChrome, IconFilter, IconGauge, IconShield, IconTarget, IconZap } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd } from "@/components/json-ld";
import { LinkButton } from "@/components/ui/button";
import { Container, IconBubble, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How X Auto Follow Works: Step-by-Step with GrowX",
  description: "See how the GrowX Chrome extension works: pick source profiles, score followers, follow at a human pace with safety limits, then track follow-backs and clean up.",
  path: "/how-it-works",
  keywords: ["how X auto follow works", "how to grow followers on X", "Twitter auto follow tutorial", "X follow limits per day", "safe Twitter auto follow"],
});

const steps = [
  { icon: IconChrome, name: "Install GrowX and sign in to X", text: "Install the extension from the Chrome Web Store and make sure you are signed in at x.com. GrowX works through your own browser session, never asks for your X password and does not use X OAuth." },
  { icon: IconTarget, name: "Add source profiles from your niche", text: "Add accounts your ideal audience already follows. GrowX reads each source's newest followers, because recently active followers are the most relevant and reachable." },
  { icon: IconFilter, name: "Candidates are filtered and scored", text: "Hard filters remove unsuitable accounts (private, no photo, too new, inactive, too big or small). Survivors get a follow-back score from 1 to 99; only those above your minimum score enter the queue." },
  { icon: IconGauge, name: "Choose a pace and start the autopilot", text: "Pick Safe or Balanced (Turbo and X Premium pace are available for aged or X Premium accounts), set active hours and optional warm-up, then press Start." },
  { icon: IconShield, name: "GrowX follows one account at a time, safely", text: "Randomised delays, breaks, rolling hourly and daily caps, follow verification and an automatic slow-down after any X warning keep the activity human-like. It stops completely if X needs your attention." },
  { icon: IconChart, name: "Track follow-backs and refine", text: "GrowX checks who followed back, rates your sources, charts your growth and tracks a monthly goal, so you can keep what works and drop what does not." },
  { icon: IconBroom, name: "Clean up when you are ready", text: "Scan your following list for inactive accounts and people who do not follow back, review the results and unfollow the ones you pick at a safe pace." },
];

const presets = [
  { name: "Safe", delay: "45-110 s", rest: "every 12 follows, 18 min", hourly: "18", daily: "~150", who: "New or warming-up accounts" },
  { name: "Balanced", delay: "30-75 s", rest: "every 18 follows, 14 min", hourly: "28", daily: "~280", who: "Recommended for most accounts" },
  { name: "Turbo", delay: "18-45 s", rest: "every 25 follows, 10 min", hourly: "40", daily: "~390", who: "Aged accounts with a clean record" },
  { name: "X Premium pace", delay: "12-32 s", rest: "every 35 follows, 8 min", hourly: "60", daily: "~800", who: "Accounts with X's own Premium subscription" },
];

const faqs = [
  { q: "How many people can GrowX follow per day?", a: "It depends on the pace you choose: about 150 per day on Safe, 280 on Balanced, 390 on Turbo and 800 on the X Premium pace, always limited by rolling hourly and daily caps. X itself allows roughly 400 follows a day on a normal account, so the higher presets are meant for aged accounts or accounts with X Premium." },
  { q: "Does GrowX work if I close the popup or the X tab?", a: "Yes. The engine runs in the extension's background service worker and keeps going until you press Stop. It can use any open x.com tab or a small pinned one, and it resumes after Chrome restarts unless you turn that off. Keep Chrome open." },
  { q: "What happens if X shows a warning?", a: "GrowX backs off automatically: it lowers its limits and rests before continuing. If you are signed out, the account is locked or X issues repeated automation warnings, it stops completely and never clicks through a challenge." },
  { q: "Does GrowX need my X password or API keys?", a: "No. It works through the X session already signed in in your Chrome browser. It does not ask for, see or store your X password and does not use X OAuth or API keys." },
  { q: "Is my data uploaded anywhere?", a: "Your settings, sources, queue and history are stored in your browser. GrowX talks to x.com for your account and does not upload your X data. Optional anonymous usage counts can be switched off in Settings." },
  { q: "Can GrowX unfollow people who don't follow me back?", a: "Yes, through the Cleanup tools: scan, review, select the accounts you want and unfollow them at a safe pace. Partial scans are clearly flagged so accounts are never wrongly labelled as non-followers." },
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
            name: "How to grow your X (Twitter) audience with GrowX",
            description: "Set up the GrowX Chrome extension, choose sources, and let the autopilot follow likely follow-backs at a safe pace.",
            totalTime: "PT5M",
            tool: [{ "@type": "HowToTool", name: "GrowX Chrome extension" }],
            step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text, url: `${abs("/how-it-works")}#step-${i + 1}` })),
          },
          faqLd(faqs),
        ]}
      />
      <PageHero eyebrow="How it works" title={<>How X auto follow works, <span className="text-gradient">step by step</span>.</>}>
        From source profiles to follow-back tracking: exactly what the GrowX Chrome extension does, in the order it does it.
      </PageHero>

      <Section>
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="The pipeline" title="Seven steps from setup to cleanup" />
          <ol className="mt-12 space-y-5">
            {steps.map((s, i) => (
              <li key={s.name} id={`step-${i + 1}`} className="reveal card-hover flex scroll-mt-28 gap-5 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
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
            Want the full technical walkthrough? Read{" "}
            <Link href="/blog/how-growx-auto-follow-works" className="font-semibold text-accent hover:underline">How GrowX auto follow works</Link>, or see every{" "}
            <Link href="/features" className="font-semibold text-accent hover:underline">feature</Link>.
          </p>
        </Container>
      </Section>

      <Section className="bg-tint">
        <Container>
          <SectionHeading eyebrow="Pacing" title="Four paces, one set of safety rules" center>
            Values below come from the current extension (v2.3.0). Every preset adds occasional longer pauses, rolling caps and automatic slow-down.
          </SectionHeading>
          <div className="reveal mt-10 overflow-x-auto rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
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
          <p className="mt-4 text-center text-xs text-muted">Higher presets are planned as Premium. No tool can promise zero risk on X; you remain responsible for following X&apos;s rules.</p>
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
