import type { ReactNode } from "react";
import { Container, PageHero, Section } from "@/components/ui/primitives";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title}>
        Last updated {updated}
      </PageHero>
      <Section className="pt-10 sm:pt-14">
        <Container className="max-w-3xl space-y-8">
          <article className="space-y-4 rounded-3xl border border-border bg-white p-6 leading-relaxed text-text-2 shadow-[var(--shadow-soft)] sm:p-10 [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text [&_h2:first-child]:mt-0 [&_h2:first-child]:border-0 [&_h2:first-child]:pt-0 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2 [&_a]:font-semibold [&_a]:text-accent">
            {children}
          </article>
        </Container>
      </Section>
    </>
  );
}
