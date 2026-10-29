import Link from "next/link";
import type { ReactNode } from "react";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconTool } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd } from "@/components/json-ld";
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
      <section className="bg-hero relative overflow-hidden border-b border-border">
        <div className="bg-grid absolute inset-0" aria-hidden="true" />
        <Container className="relative py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="animate-fade-up text-center text-sm text-muted">
            <Link href="/tools" className="hover:text-accent">Free tools</Link> <span aria-hidden="true">/</span> {name}
          </nav>
          <div className="animate-fade-up mt-4 text-center">
            <Eyebrow>Free tool · no sign-up</Eyebrow>
          </div>
          <h1 className="animate-fade-up mx-auto mt-5 max-w-3xl text-center text-[2.3rem] font-extrabold leading-[1.06] tracking-tight sm:text-5xl">{title}</h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-text-2">{lead}</p>
          <div className="animate-fade-up mx-auto mt-10 max-w-5xl [animation-delay:150ms]">{tool}</div>
          <p className="mt-4 text-center text-xs text-muted">Runs entirely in your browser. Nothing you type is sent anywhere.</p>
        </Container>
      </section>

      <Section>
        <Container className="max-w-3xl">
          <div className="space-y-5 text-[1.05rem] leading-8 text-text-2 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-text sm:[&_h2]:text-3xl [&_h2:first-child]:mt-0 [&_li]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul_li]:marker:text-accent [&_a]:font-semibold [&_a]:text-accent [&_a:hover]:underline">
            {children}
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Common questions" />
            {others.length ? (
              <div className="reveal mt-8">
                <p className="text-sm font-bold">More free tools</p>
                <ul className="mt-3 space-y-2">
                  {others.map((t) => (
                    <li key={t.href}>
                      <Link href={t.href} className="group inline-flex items-center gap-2 font-semibold text-accent">
                        <IconTool size={16} /> {t.label} <IconArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="reveal">
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>
      <CtaBand title="Write it here. Schedule it with GrowX." body="GrowX's composer counts characters exactly like this tool, splits threads, adds images and posts at your best times. Free to start, with a 30-day Premium trial and no credit card." />
    </>
  );
}
