import Link from "next/link";
import { CtaBand } from "@/components/home/cta-band";
import styles from "@/components/conversion/about.module.css";
import { IconArrowRight, IconChrome, IconLock, IconShield, IconStar, IconTarget } from "@/components/icons";
import { JsonLd, abs, authorLd, breadcrumbLd } from "@/components/json-ld";
import { BorderBeam } from "@/components/motion/border-beam";
import { GrowthLine } from "@/components/motion/growth-line";
import { stagger } from "@/components/motion/stagger";
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
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Our story" title="Why GrowX exists" />
          <div className="mt-8 space-y-6 text-[1.05rem] leading-8 text-text-2 [&>p]:max-w-[68ch]">
            <p>
              Growing an audience on X means a lot of repetitive work: finding relevant people, following them without hitting limits,
              posting at the right times, replying early, remembering who followed back and cleaning up later. Most people juggle several
              tools for that, and many auto follow tools simply go as fast as possible, which puts accounts at risk. GrowX takes the
              opposite approach:{" "}
              <mark className={styles.marker}>one simple extension that acts like a careful person, measures results and stops when X says stop</mark>.
            </p>
            <p>
              It started as an auto follow engine with source targeting, a follow-back score and cleanup tools. Version 2.4.4 turned it
              into a complete growth tool: a post and thread scheduler, the GrowX AI writer that runs on your computer, post analytics, an
              unfollower tracker and reply targets. This website adds free accounts, a 30-day Premium trial and paid plans, while a useful
              free plan stays free.
            </p>
            <p className="rounded-2xl border border-hairline bg-white px-5 py-4 text-base leading-7 shadow-[inset_3px_0_0_var(--accent)]">
              GrowX is <strong className="text-text">not affiliated with, endorsed by or sponsored by X Corp</strong>. It acts on your
              account at your request, and you are responsible for following X&apos;s rules.
            </p>
          </div>

          <div
            aria-hidden="true"
            data-decor=""
            className="reveal mt-12 grid items-center gap-4 rounded-3xl border border-hairline bg-white p-5 shadow-hair sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="size-3.5 shrink-0 rounded-full bg-white ring-2 ring-accent" />
              <span className="text-sm font-semibold text-text">Started as an auto follow engine</span>
            </div>
            <div className="relative h-12 sm:h-16">
              <span className="absolute inset-x-0 top-1/2 hidden h-0.5 -translate-y-1/2 rounded-full bg-hairline-strong sm:block" />
              <span className="draw-x absolute inset-x-0 top-1/2 hidden h-0.5 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#e11d2e,#ff4b5c)] sm:block" />
              <span className="absolute left-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-2xl bg-white ring-1 ring-hairline-strong sm:left-1/2 sm:size-14 sm:-translate-x-1/2">
                <GrowthLine mode="scroll" className="size-9 text-accent sm:size-10" />
              </span>
            </div>
            <div className="flex items-center gap-3 sm:justify-end">
              <span className="size-3.5 shrink-0 rounded-full bg-accent-deep ring-4 ring-accent-soft sm:order-last" />
              <span className="text-sm font-semibold text-text sm:text-right">
                <span className="font-mono text-accent-ink">Version 2.4.4</span>: a complete growth tool
              </span>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Principles" title="What we build by" center />
          <ul data-spotlight-group="" className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
            {principles.map((p, i) => (
              <li
                key={p.title}
                data-spotlight=""
                className="reveal lift group rounded-3xl border border-hairline bg-white p-6 shadow-hair sm:p-7"
                style={stagger(i % 2)}
              >
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
            <div
              aria-hidden="true"
              className="reveal relative mb-8 grid size-20 place-items-center rounded-3xl bg-brand-deep font-display text-[1.75rem] font-extrabold tracking-[-0.04em] text-white shadow-red"
            >
              <BorderBeam mode="scroll" tone="white" />
              SA
            </div>
            <SectionHeading eyebrow="The developer" title={`Built by ${site.author}`}>
              GrowX is designed, developed and supported by {site.author}. Feature requests and bug reports go straight to the developer.
            </SectionHeading>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact">Contact support <IconArrowRight size={16} className="nudge" /></LinkButton>
              <ExternalButton href={site.authorUrl} variant="secondary">Developer website <IconArrowRight size={16} className="nudge" /></ExternalButton>
            </div>
          </div>
          <div data-spotlight="" className="reveal lift rounded-3xl border border-hairline bg-white p-8 shadow-hair">
            <h3 className="font-bold">Where to go next</h3>
            <ul className="mt-4 space-y-3 font-semibold text-accent-ink">
              {[
                { href: "/how-it-works", label: "How GrowX works" },
                { href: "/features", label: "Features and Free vs Premium" },
                { href: "/blog", label: "Guides and roadmap (blog)" },
                { href: "/pricing", label: "Pricing" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex items-center gap-1.5">
                    <span className="link-draw">{l.label}</span>
                    <IconArrowRight size={15} className="nudge" />
                  </Link>
                </li>
              ))}
              {site.chromeStoreUrl ? (
                <li>
                  <a href={site.chromeStoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <IconChrome size={16} /> <span className="link-draw">Chrome Web Store</span>
                    <IconArrowRight size={15} className="nudge" />
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
