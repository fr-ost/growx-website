import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <Container className="relative py-24 text-center">
        <p className="text-gradient animate-pop font-display text-8xl font-extrabold sm:text-9xl">404</p>
        <h1 className="animate-fade-up mt-4 text-3xl font-extrabold">This page doesn&apos;t exist</h1>
        <p className="animate-fade-up mt-3 text-text-2 [animation-delay:80ms]">It may have moved, or the link is mistyped.</p>
        <div className="animate-fade-up mt-8 flex justify-center gap-3 [animation-delay:160ms]">
          <LinkButton href="/">Back to home</LinkButton>
          <LinkButton href="/contact" variant="secondary">
            Get support
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
