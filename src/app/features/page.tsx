import Link from "next/link";
import { FeatureIcon } from "@/components/feature-icon";
import { FeatureGroups } from "@/components/feature-lists";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconArrowRight, IconChrome } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd, softwareLd } from "@/components/json-ld";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureGroups } from "@/config/features";
import { featureNav } from "@/config/nav";
import { TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX Features: Auto Follow, Scheduler, AI & Analytics",
  description:
    "Every GrowX feature: smart auto follow, post scheduler, GrowX AI writer, analytics, unfollower tracker, reply targets and cleanup, with what's Free and Premium.",
  path: "/features",
  keywords: ["X growth tool features", "Twitter auto follow", "Twitter scheduler", "AI tweet writer", "Twitter analytics", "Twitter unfollower tracker", "Twitter unfollow tool"],
});

const faqs = [
  { q: "Which GrowX features are free?", a: "The free plan includes the Safe and Balanced auto follow paces, sources and core filters, scheduling with up to 10 posts waiting, best time to post, 52 templates, reply targets, analytics for your latest 30 posts, 7 days of follower history, goals and the cleanup scan with up to 200 unfollows per run." },
  { q: "What does Premium add?", a: "GrowX AI, unlimited scheduling, evergreen recycling and auto-plug, Turbo and X Premium paces, the smart score, more source types, advanced filters and list import, full analytics with the weekly report, full follower history and quality, VIP alerts, bulk unfollow, automatic cleanup and a workspace per X account." },
  { q: `Can I try Premium before paying?`, a: `Yes. Every GrowX account can start a free ${TRIAL_DAYS}-day trial of all Premium features from the website dashboard. No credit card is needed and nothing renews.` },
  { q: "Does GrowX work on Firefox, Edge or mobile?", a: "GrowX is a Chrome extension for desktop Chrome 116 or newer on Windows, macOS, Linux and ChromeOS. Other Chromium browsers may install Chrome extensions, but only Chrome is supported, and there is no mobile app." },
  { q: "Does GrowX post or reply by itself?", a: "Only what you schedule. Scheduled posts go out at the time you chose. Replies and likes from the Engage page are only sent when you press the button, and GrowX never sends direct messages." },
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
      <PageHero
        eyebrow="Features"
        title={<>Every tool you need to <span className="text-gradient">grow on X</span>.</>}
        actions={
          <>
            {site.chromeStoreUrl ? (
              <ExternalButton href={site.chromeStoreUrl} size="lg">
                <IconChrome size={20} /> Add to Chrome, free
              </ExternalButton>
            ) : null}
            <LinkButton href="/pricing" variant="secondary" size="lg">
              Compare plans
            </LinkButton>
          </>
        }
      >
        <p>
          Smart auto follow, a post scheduler, the GrowX AI writer, analytics, an unfollower tracker, reply targets and cleanup tools: everything
          in the GrowX Chrome extension, and what is Free versus Premium.
        </p>
      </PageHero>

      <Section className="pb-0 sm:pb-0 lg:pb-0">
        <Container>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featureNav.map((f) => (
              <li key={f.slug} className="reveal">
                <Link href={`/features/${f.slug}`} className="card-hover group flex h-full items-start gap-3 rounded-2xl border border-border bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <FeatureIcon name={f.icon} size={19} />
                  </span>
                  <span>
                    <span className="flex items-center gap-1 font-bold">
                      {f.label} <IconArrowRight size={14} className="text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted">{f.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <nav aria-label="Feature sections" className="reveal mt-10 flex flex-wrap justify-center gap-2">
            {featureGroups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="rounded-full border border-border bg-surface-2 px-4 py-1.5 text-sm font-semibold text-text-2 transition-colors hover:border-accent/40 hover:text-accent">
                {g.title.split(":")[0]}
              </a>
            ))}
          </nav>
        </Container>
      </Section>

      <Section>
        <Container>
          <FeatureGroups />
          <p className="mt-20 text-center text-text-2">
            New here? See <Link href="/how-it-works" className="font-semibold text-accent hover:underline">how it works</Link>, read the{" "}
            <Link href="/blog/growx-features-guide-scoring-filters-cleanup" className="font-semibold text-accent hover:underline">features guide</Link>, or compare{" "}
            <Link href="/pricing" className="font-semibold text-accent hover:underline">Free vs Premium</Link>.
          </p>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Feature questions" center />
          <div className="reveal mt-10">
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
