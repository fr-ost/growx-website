import { IconChrome } from "@/components/icons";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { site } from "@/config/site";

export function CtaBand({
  title = "Start growing on X today.",
  body = "Install GrowX for free and create your account in under a minute. Try every Premium feature for 30 days: no credit card, no commitment.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="glow -left-24 -top-24 h-80 w-80 bg-accent/50" aria-hidden="true" />
          <div className="glow -bottom-24 -right-16 h-72 w-72 bg-accent-deep/60" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">{body}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              {site.chromeStoreUrl ? (
                <ExternalButton href={site.chromeStoreUrl} size="lg">
                  <IconChrome size={20} /> Add to Chrome, free
                </ExternalButton>
              ) : null}
              <LinkButton href="/signup" variant="white" size="lg">
                Create free account
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
