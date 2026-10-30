import Link from "next/link";
import { FeatureLinkCard } from "@/components/features/feature-card";
import { FeatureGroups } from "@/components/feature-lists";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconChrome } from "@/components/icons";
import { JsonLd, abs, breadcrumbLd, faqLd, softwareLd } from "@/components/json-ld";
import { demoForGroup } from "@/components/motion/demos/demo-map";
import { ScrollSpy } from "@/components/motion/scroll-spy";
import { stagger } from "@/components/motion/stagger";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureGroups } from "@/config/features";
import { featureNav } from "@/config/nav";
import { TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

/** Illustrative demos for the sticky group column (lg only). */
const groupDemos = Object.fromEntries(featureGroups.map((g) => [g.id, demoForGroup(g.id, { size: "md" })]));

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
              <ExternalButton href={site.chromeStoreUrl} size="lg" data-magnetic="6">
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

      <Section className="pb-12 sm:pb-16 lg:pb-16">
        <Container>
          <ul data-spotlight-group="" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featureNav.map((f, i) => (
              <li key={f.slug} className="reveal" style={stagger(i % 4)}>
                <FeatureLinkCard href={`/features/${f.slug}`} icon={f.icon} label={f.label} blurb={f.blurb} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <div className="relative">
        <nav
          id="feature-sections"
          aria-label="Feature sections"
          className="sticky top-16 z-30 overflow-x-auto overscroll-x-contain border-y border-hairline bg-[rgba(255,252,251,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_-20px_rgba(22,13,18,0.35)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="mx-auto flex w-max gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
            {featureGroups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="group relative block whitespace-nowrap rounded-full border border-hairline-strong bg-white px-4 py-1.5 text-sm font-semibold text-text-2 hover:border-text/30 hover:text-text aria-[current=true]:border-ink aria-[current=true]:bg-ink aria-[current=true]:text-white"
                >
                  {g.title.split(":")[0]}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 bottom-[3px] h-0.5 scale-x-0 rounded-full bg-accent-on-ink group-aria-[current=true]:scale-x-100 motion-ok:transition-[scale] motion-ok:duration-200 motion-ok:ease-glide"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ScrollSpy navId="feature-sections" />

        <Section className="pt-14 sm:pt-20 lg:pt-24">
          <Container>
            <FeatureGroups demos={groupDemos} />
            <p className="mt-20 text-center text-text-2">
              New here? See <Link href="/how-it-works" className="link-draw font-semibold text-accent-ink">how it works</Link>, read the{" "}
              <Link href="/blog/growx-features-guide-scoring-filters-cleanup" className="link-draw font-semibold text-accent-ink">features guide</Link>, or compare{" "}
              <Link href="/pricing" className="link-draw font-semibold text-accent-ink">Free vs Premium</Link>.
            </p>
          </Container>
        </Section>
      </div>

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
