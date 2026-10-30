import Link from "next/link";
import type { ReactNode } from "react";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd } from "@/components/json-ld";
import { Backdrop } from "@/components/motion/backdrop";
import { stagger } from "@/components/motion/stagger";
import { toolKey } from "@/components/motion/tool-glyph";
import { MiniGlyph } from "@/components/tools/mini-glyph";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/primitives";
import { toolNav } from "@/config/nav";
import { site } from "@/config/site";

/** Shared layout for the free web tools: hero, the tool, an explainer and a FAQ. */
export function ToolPage({
  path,
  name,
  title,
  lead,
  tool,
  children,
  faqs,
}: {
  path: string;
  name: string;
  title: ReactNode;
  lead: string;
  tool: ReactNode;
  children: ReactNode;
  faqs: { q: string; a: string }[];
}) {
  const others = toolNav.filter((t) => t.href !== path);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Free tools", path: "/tools" },
            { name, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": `${abs(path)}#app`,
            name,
            url: abs(path),
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any (runs in your web browser)",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@id": `${site.url}/#organization` },
          },
          faqLd(faqs),
        ]}
      />
      <section className="relative overflow-clip border-b border-hairline">
        <Backdrop variant="page" beams={0} />
        <Container className="relative py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="hero-settle text-center text-sm text-muted" style={stagger(0)}>
            <Link href="/tools" className="link-draw hover:text-accent-ink">
              Free tools
            </Link>{" "}
            <span aria-hidden="true">/</span> {name}
          </nav>
          <div className="hero-settle mt-4 flex items-center justify-center gap-2.5" style={stagger(1)}>
            <MiniGlyph tool={toolKey(path)} px={32} />
            <Eyebrow>Free tool · no sign-up</Eyebrow>
          </div>
          <h1 className="hero-settle mx-auto mt-5 max-w-3xl text-center text-page font-extrabold" style={stagger(2)}>
            {title}
          </h1>
          <p className="hero-settle mx-auto mt-5 max-w-2xl text-pretty text-center text-lg leading-relaxed text-text-2" style={stagger(3)}>
            {lead}
          </p>
          {/* The tool is interactive: translate-only settle (no de-blur on fields or outputs), never opacity. */}
          <div className="hero-settle-plain mx-auto mt-10 max-w-5xl" style={stagger(4)}>
            {tool}
          </div>
          <p className="mt-4 text-center text-xs text-muted">Runs entirely in your browser. Nothing you type is sent anywhere.</p>
        </Container>
      </section>

      <Section>
        <Container className="max-w-3xl">
          <div className="space-y-5 text-pretty text-[1.05rem] leading-8 text-text-2 [&_h2]:mt-14 [&_h2]:text-balance [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-text sm:[&_h2]:text-3xl [&_h2:first-child]:mt-0 [&_li]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul_li]:marker:text-accent [&_a]:font-semibold [&_a]:text-accent-ink [&_a:hover]:underline [&_code]:rounded-md [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-text">
            {children}
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Common questions" />
            {others.length ? (
              <div className="reveal mt-8" style={stagger(2)}>
                <p className="text-sm font-bold">More free tools</p>
                <ul className="mt-3 space-y-1">
                  {others.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className="group -mx-2 inline-flex items-center gap-2.5 rounded-xl px-2 py-1.5 font-semibold text-accent-ink hover:bg-white"
                      >
                        <MiniGlyph tool={toolKey(t.href)} px={28} />
                        <span className="link-draw">{t.label}</span>
                        <IconArrowRight size={15} className="nudge" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="reveal" style={stagger(1)}>
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>
      <CtaBand title="Write it here. Schedule it with GrowX." body="GrowX's composer counts characters exactly like this tool, splits threads, adds images and posts at your best times. Free to start, with a 30-day Premium trial and no credit card." />
    </>
  );
}
