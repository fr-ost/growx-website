import { LinkButton } from "@/components/ui/button";
import { Badge, Card, Container, Notice, Section } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX - Auto follow for X (Twitter), at a human pace",
  description: "A Chrome extension for targeted auto-follow, follow-back scoring, safe pacing and account cleanup on X. Core features are free.",
  path: "/",
});

const steps = [
  { n: "1", title: "Sign in to X", body: "GrowX works through your own signed-in x.com session in your browser. It never asks for your X password." },
  { n: "2", title: "Add sources", body: "Pick profiles in your niche. GrowX reads their newest followers - people who are active and follow accounts like yours." },
  { n: "3", title: "It scores everyone", body: "Follow ratio, audience size, recent activity, a real profile and follow-back language. Only likely follow-backers enter the queue." },
  { n: "4", title: "Autopilot follows", body: "One account at a time with randomised delays, breaks, hourly and daily caps and active hours. It measures who follows back." },
];

const highlights = [
  { title: "Follow-back scoring", body: "Every candidate gets a 1-99 estimated follow-back score from signals such as follow ratio, audience size and recent activity." },
  { title: "Paced like a person", body: "Safe, Balanced and Turbo presets, active hours, warm-up for new accounts and automatic slow-down after any warning from X." },
  { title: "Targeting filters", body: "Filter by audience size, follow ratio, account age, last activity, profile photo, keywords and more before anyone enters the queue." },
  { title: "Cleanup tools", body: "Scan who you follow, find inactive accounts and people who do not follow back, then review before you unfollow." },
  { title: "Growth analytics", body: "Follow-back tracking, source performance, a growth chart and a monthly goal planner, all computed in your browser." },
  { title: "Local by design", body: "Settings, queue and history live in your browser storage. GrowX does not upload your X data." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Badge tone="accent">Chrome extension for X (Twitter)</Badge>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Grow on X on autopilot, at a human pace.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-text-2">
              GrowX finds people likely to follow you back, follows them one at a time with built-in safety limits, and
              shows you what is working. Core features are free.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {site.chromeStoreUrl ? (
                <LinkButton href={site.chromeStoreUrl} size="lg" target="_blank" rel="noopener noreferrer">
                  Add to Chrome
                </LinkButton>
              ) : null}
              <LinkButton href="/signup" size="lg" variant={site.chromeStoreUrl ? "secondary" : "primary"}>
                Create a free account
              </LinkButton>
              <LinkButton href="/features" size="lg" variant="ghost">
                See features
              </LinkButton>
            </div>
            <p className="mt-4 text-sm text-muted">
              No tool can promise zero risk on X. GrowX is built to respect the limits X signals, but you stay in control.
            </p>
          </div>
          <Card className="space-y-4">
            <p className="text-sm font-semibold text-muted">What GrowX does for you</p>
            <dl className="space-y-4">
              {[
                ["Targets", "Newest followers of profiles you choose"],
                ["Scores", "Estimated follow-back chance, 1-99"],
                ["Paces", "Delays, breaks, hourly and daily caps"],
                ["Measures", "Who followed back, and which sources work"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 border-t border-border pt-4 first:border-0 first:pt-0">
                  <dt className="w-20 shrink-0 font-semibold text-accent">{k}</dt>
                  <dd className="text-text-2">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </Container>
      </section>

      <Section>
        <Container>
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n}>
                <Card className="h-full">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{s.n}</span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-text-2">{s.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight">What is in the extension today</h2>
          <p className="mt-3 max-w-2xl text-text-2">Everything below exists in the current GrowX release.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h) => (
              <li key={h.title}>
                <Card className="h-full bg-bg">
                  <h3 className="font-semibold">{h.title}</h3>
                  <p className="mt-2 text-sm text-text-2">{h.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Free stays useful. Premium is planned.</h2>
            <p className="mt-3 text-text-2">
              The goal is to keep useful core features free indefinitely and offer Premium for higher volume, advanced
              filters and bulk cleanup. Premium is not on sale yet; accounts and a 14-day trial are being prepared.
            </p>
            <div className="mt-6 flex gap-3">
              <LinkButton href="/pricing">View planned pricing</LinkButton>
              <LinkButton href="/features" variant="secondary">
                Free vs Premium
              </LinkButton>
            </div>
          </div>
          <div className="self-start">
            <Notice tone="info" title="Status">
            This website and its account system are in early development. The GrowX extension does not yet sign in to
            this site, and no payments can be made.
            </Notice>
          </div>
        </Container>
      </Section>
    </>
  );
}
