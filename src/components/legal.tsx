import type { ReactNode } from "react";
import { Container, DraftBanner, Section } from "@/components/ui/primitives";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Section>
      <Container className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-sm text-muted">Draft last edited {updated}</p>
        <DraftBanner>
          This is a working draft prepared for the GrowX owners. It has not been reviewed by a lawyer and must be
          reviewed, completed and approved before public launch. Bracketed items such as [LEGAL ENTITY NAME] are
          placeholders for business details that have not been decided.
        </DraftBanner>
        <div className="space-y-4 text-text-2 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </Container>
    </Section>
  );
}
