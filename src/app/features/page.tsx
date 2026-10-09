import { FeatureGroups } from "@/components/feature-lists";
import { CtaBand } from "@/components/home/cta-band";
import { Container, PageHero, Section } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description: "Autopilot follow engine, follow-back scoring, targeting filters, analytics and cleanup tools. See what is Free and what is Premium.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Features" title={<>Built to grow you <span className="text-gradient">safely</span>.</>}>
        Every feature below is part of the GrowX extension. Core tools are free; Premium adds volume, advanced filters and
        bulk operations.
      </PageHero>
      <Section>
        <Container>
          <FeatureGroups />
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
