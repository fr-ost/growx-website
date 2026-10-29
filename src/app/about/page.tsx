import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import { IconChrome, IconLock, IconShield, IconStar, IconTarget } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container, IconBubble, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About GrowX: The X (Twitter) Growth Tool",
  description: "GrowX is an independent X (Twitter) growth tool for Chrome by Shahriar Ahmed: safety-first pacing, private by design and honest claims, free to start.",
  path: "/about",
  keywords: ["about GrowX", "GrowX developer", "Shahriar Ahmed", "X growth Chrome extension developer"],
});

const principles = [
  { icon: IconShield, title: "Safety first", text: "Random delays, breaks, rolling caps, a posting cap and automatic slow-down are built in. When X shows a warning, GrowX backs off instead of pushing through." },
  { icon: IconLock, title: "Private by design", text: "Your settings, queue, posts and analytics live in your browser, and GrowX AI runs on your computer. GrowX uses your own x.com session, never asks for your X password and does not upload your X data." },
  { icon: IconTarget, title: "Quality over volume", text: "Source targeting, hard filters and a 1-99 follow-back score aim your effort at relevant, active people rather than at the biggest possible number." },
  { icon: IconStar, title: "Honest claims", text: "No fake testimonials, user counts or guaranteed results. Prices, trial length and payment methods are stated plainly on the pricing page." },
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
        <p>GrowX is an independent X (Twitter) growth tool for Chrome, designed and developed by {site.author}.</p>
      </PageHero>

      <Section>
        <Container className="max-w-3xl space-y-6 text-[1.05rem] leading-8 text-text-2">
          <SectionHeading eyebrow="Our story" title="Why GrowX exists" />
          <p>
            Growing an audience on X means a lot of repetitive work: finding relevant people, following them without hitting limits,
            posting at the right times, replying early, remembering who followed back and cleaning up later. Most people juggle several
            tools for that, and many auto follow tools simply go as fast as possible, which puts accounts at risk. GrowX takes the
            opposite approach: one simple extension that acts like a careful person, measures results and stops when X says stop.
          </p>
          <p>
            It started as an auto follow engine with source targeting, a follow-back score and cleanup tools. Version 2.4.4 turned it
            into a complete growth tool: a post and thread scheduler, the GrowX AI writer that runs on your computer, post analytics, an
            unfollower tracker and reply targets. This website adds free accounts, a 30-day Premium trial and paid plans, while a useful
            free plan stays free.
          </p>
          <p>
            GrowX is <strong className="text-text">not affiliated with, endorsed by or sponsored by X Corp</strong>. It acts on your
            account at your request, and you are responsible for following X&apos;s rules.
          </p>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Principles" title="What we build by" center />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p.title} className="reveal rounded-3xl border border-border bg-white p-6">
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
          <div className="reveal rounded-3xl border border-border bg-white p-8">
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
