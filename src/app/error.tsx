"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-text-2">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </Container>
  );
}
