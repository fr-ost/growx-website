import type { ReactNode } from "react";
import { Card, Container, Notice, Section } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/env";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Section>
      <Container className="max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-text-2">{subtitle}</p>
        <Card className="mt-6 space-y-5">
          {!isSupabaseConfigured() ? (
            <Notice tone="warn" title="Authentication is not configured">
              Supabase environment variables are missing, so sign-in is unavailable. See the README for setup.
            </Notice>
          ) : null}
          {children}
        </Card>
      </Container>
    </Section>
  );
}
