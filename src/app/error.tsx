"use client";

import { Button, LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex flex-1 items-center">
      <Container className="py-24 text-center">
        <p className="text-gradient font-display text-6xl font-extrabold">Oops</p>
        <h1 className="mt-4 text-3xl font-extrabold">Something went wrong</h1>
        <p className="mt-3 text-text-2">An unexpected error occurred. Please try again.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/" variant="secondary">
            Home
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
