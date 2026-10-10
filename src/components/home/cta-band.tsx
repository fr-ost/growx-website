import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export function CtaBand({
  title = "Ready to grow on X the careful way?",
  body = "Create your free account in under a minute. Start your 30-day Premium trial whenever you are ready: every Premium feature, no credit card, no commitment.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="reveal bg-brand relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white shadow-[0_40px_80px_-40px_rgba(159,18,57,0.8)] sm:px-12 sm:py-16">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
          <div className="glow -left-20 -top-20 h-72 w-72 bg-white/25 animate-drift" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{body}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <LinkButton href="/signup" variant="white" size="lg">
                Create free account
              </LinkButton>
              <Link
                href="/pricing"
                className="inline-flex h-13 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
