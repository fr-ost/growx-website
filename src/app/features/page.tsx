import { FeatureGroups } from "@/components/feature-lists";
import { LinkButton } from "@/components/ui/button";
import { Container, Notice, PageHeader, Section } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description: "Everything GrowX does today, and the proposed Free and Premium split.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <Section>
      <Container className="space-y-10">
        <PageHeader eyebrow="Features" title="What GrowX does">
          Every feature below exists in the current extension. The Free / Premium labels show the planned split once
          Premium launches.
        </PageHeader>
        <Notice tone="info" title="About the Free / Premium labels">
          The extension currently has no paywall or account sign-in. The split is a plan and may change before launch.
        </Notice>
        <FeatureGroups />
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/pricing">See planned pricing</LinkButton>
          <LinkButton href="/signup" variant="secondary">
            Create a free account
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
