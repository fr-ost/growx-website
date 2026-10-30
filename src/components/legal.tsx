import type { ReactNode } from "react";
import { Container, PageHero, Section } from "@/components/ui/primitives";

/**
 * Legal pages: the hero settles like every inner page; the article itself never moves
 * (no reveals) and reads at a 68ch measure. data-progress-article drives the header's
 * reading-progress bar across the article body.
 */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title}>
        Last updated {updated}
      </PageHero>
      <Section className="pt-10 sm:pt-14">
        <Container className="max-w-4xl">
          <article
            data-progress-article=""
            className="rounded-3xl border border-hairline bg-white px-6 py-8 shadow-hair sm:px-12 sm:py-12"
          >
            <div className="mx-auto max-w-[68ch] space-y-4 leading-relaxed text-text-2 [&_a]:font-semibold [&_a]:text-accent-ink [&_a]:underline [&_a]:decoration-accent-ink/30 [&_a]:underline-offset-2 [&_a:hover]:decoration-accent-ink [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-hairline [&_h2]:pt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-text [&_h2:first-child]:mt-0 [&_h2:first-child]:border-0 [&_h2:first-child]:pt-0 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_li]:marker:text-accent [&_strong]:text-text [&_ul]:space-y-2">
              {children}
            </div>
          </article>
        </Container>
      </Section>
    </>
  );
}
