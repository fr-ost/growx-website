import { FeatureGroups } from "@/components/feature-lists";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { JsonLd, abs, breadcrumbLd, faqLd, softwareLd } from "@/components/json-ld";
import { LinkButton } from "@/components/ui/button";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureGroups } from "@/config/features";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "X Auto Follow Features: Scoring, Filters & Cleanup",
  description: "Every GrowX feature in detail: auto follow engine, follow-back score, targeting filters, growth analytics and cleanup tools, with what is Free and what is Premium.",
  path: "/features",
  keywords: ["X auto follow features", "Twitter targeting filters", "follow back score", "Twitter unfollow tool", "X growth analytics", "Twitter cleanup tool"],
});

const faqs = [
  { q: "Which GrowX features are free?", a: "Core features are free: the Safe and Balanced autopilot, safety controls, sources and queue, core targeting filters, history and analytics, backup and restore, the cleanup scan and manual selection with a reasonable daily unfollow allowance." },
  { q: "What does Premium add?", a: "Premium is for higher-volume and advanced use: Turbo and X Premium paces, custom limits above Balanced, advanced filters (keywords, location, verified, account age, last active), bulk list import and select-all bulk unfollow." },
  { q: "Are any features available right now that aren't listed?", a: "The extension today contains everything listed on this page. Premium is available now: start the free 30-day trial or buy a plan on the pricing page, then sign in to the extension with your GrowX account." },
  { q: "Does GrowX work on Firefox, Edge or mobile?", a: "GrowX is a Chrome extension (Manifest V3, Chrome 116 or newer). Other Chromium browsers may install Chrome extensions, but only Chrome is supported." },
];

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Features", path: "/features" }]),
          { ...softwareLd, "@id": `${abs("/features")}#software` },
          faqLd(faqs),
        ]}
      />
      <PageHero eyebrow="Features" title={<>Everything GrowX does to <span className="text-gradient">grow you safely</span>.</>}>
        Auto follow engine, follow-back scoring, targeting filters, growth analytics and cleanup tools: every feature of the GrowX
        Chrome extension, and what is Free versus Premium.
      </PageHero>

      <Section className="pb-4">
        <Container>
          <nav aria-label="Feature sections" className="reveal flex flex-wrap justify-center gap-2">
            {featureGroups.map((g) => (
              <a key={g.id} href={`#g-${g.id}`} className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-semibold text-text-2 shadow-sm transition-colors hover:border-accent/40 hover:text-accent">
                {g.title}
              </a>
            ))}
          </nav>
        </Container>
      </Section>

      <Section>
        <Container>
          <FeatureGroups />
          <p className="mt-16 text-center text-text-2">
            New here? See <Link href="/how-it-works" className="font-semibold text-accent hover:underline">how it works</Link>, read the{" "}
            <Link href="/blog/growx-features-guide-scoring-filters-cleanup" className="font-semibold text-accent hover:underline">features guide</Link>, or compare{" "}
            <Link href="/pricing" className="font-semibold text-accent hover:underline">Free vs Premium</Link>.
          </p>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Feature questions" center />
          <div className="reveal mt-10"><Faq items={faqs} /></div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <LinkButton href="/pricing">See pricing</LinkButton>
            <LinkButton href="/signup" variant="secondary">Create a free account</LinkButton>
          </div>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
