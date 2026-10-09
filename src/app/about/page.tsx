import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import { IconChrome, IconLock, IconShield, IconStar, IconTarget } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container, IconBubble, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About GrowX: Safe, Local-First X Growth Tools",
  description: "GrowX is an independent X (Twitter) growth Chrome extension by Shahriar Ahmed: safety-first pacing, local-first data and honest claims, with free core features.",
  path: "/about",
  keywords: ["about GrowX", "GrowX developer", "Shahriar Ahmed", "X growth Chrome extension developer"],
});

const principles = [
  { icon: IconShield, title: "Safety first", text: "Randomised delays, breaks, rolling caps, active hours and automatic slow-down are defaults, not options. When X shows a warning, GrowX backs off instead of pushing through." },
  { icon: IconLock, title: "Local-first data", text: "Your settings, queue and history live in your browser. GrowX uses your own x.com session, never asks for your X password and does not upload your X data." },
  { icon: IconTarget, title: "Quality over volume", text: "Source targeting, hard filters and a 1-99 follow-back score aim your effort at relevant, active people rather than at the biggest possible number." },
  { icon: IconStar, title: "Honest claims", text: "No fake testimonials, user counts or guaranteed results. Planned features are labelled as planned, and the pricing page says plainly that checkout is not live yet." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About GrowX",
            url: abs("/about"),
            mainEntity: { "@id": `${site.url}/#organization` },
          },
          { "@context": "https://schema.org", ...authorLd, "@type": "Person", jobTitle: "Developer", worksFor: { "@id": `${site.url}/#organization` } },
        ]}
      />
      <PageHero eyebrow="About" title={<>Growth tools built for <span className="text-gradient">careful</span> people.</>}>
        GrowX is an independent Chrome extension for growing and tidying an X (Twitter) account, developed by {site.author}.
      </PageHero>

      <Section>
        <Container className="max-w-3xl space-y-6 text-[1.05rem] leading-8 text-text-2">
          <SectionHeading eyebrow="Our story" title="Why GrowX exists" />
          <p>
            Growing an audience on X means a lot of repetitive work: finding relevant people, following them without hitting limits,
            remembering who followed back and cleaning up later. Many tools solve it by following as fast as possible, which puts
            accounts at risk. GrowX takes the opposite approach: act like a careful person, measure results and stop when X says stop.
          </p>
          <p>
            It started as a Chrome extension (Manifest V3) with an autopilot follow engine, source targeting, a follow-back score,
            analytics and cleanup tools. This website adds free accounts, a 14-day Premium trial and, later, paid plans, while the
            core of the product stays free.
          </p>
          <p>
            GrowX is <strong className="text-text">not affiliated with, endorsed by or sponsored by X Corp</strong>. It acts on your
            account at your request, and you are responsible for following X&apos;s rules.
          </p>
        </Container>
      </Section>

      <Section className="bg-tint">
        <Container>
          <SectionHeading eyebrow="Principles" title="What we build by" center />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p.title} className="reveal card-hover rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
                <IconBubble><p.icon size={22} /></IconBubble>
                <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-text-2">{p.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="The developer" title={`Built by ${site.author}`}>
              GrowX is designed, developed and supported by {site.author}. Feature requests and bug reports go straight to the developer.
            </SectionHeading>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact">Contact support</LinkButton>
              <ExternalButton href={site.authorUrl} variant="secondary">Developer website</ExternalButton>
            </div>
          </div>
          <div className="reveal rounded-3xl border border-border bg-white p-8 shadow-[var(--shadow-soft)]">
            <h3 className="font-bold">Where to go next</h3>
            <ul className="mt-4 space-y-3 font-semibold text-accent">
              <li><Link href="/how-it-works" className="hover:underline">How GrowX works</Link></li>
              <li><Link href="/features" className="hover:underline">Features and Free vs Premium</Link></li>
              <li><Link href="/blog" className="hover:underline">Guides and roadmap (blog)</Link></li>
              <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
              {site.chromeStoreUrl ? (
                <li><a href={site.chromeStoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline"><IconChrome size={16} /> Chrome Web Store</a></li>
              ) : null}
            </ul>
          </div>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
