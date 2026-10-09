import { IconMail, IconSend } from "@/components/icons";
import { Container, IconBubble, Notice, PageHero, Section } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Support",
  description: "Get help with GrowX: email support or message the developers on Telegram.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Support" title={<>We&apos;re here to <span className="text-gradient">help</span>.</>}>
        Questions, bug reports, feature requests or account help: reach the GrowX team directly.
      </PageHero>
      <Section>
        <Container className="max-w-4xl space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            <a
              href={`mailto:${site.supportEmail}`}
              className="reveal card-hover group rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] md:col-span-2"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <IconBubble className="h-14 w-14 rounded-2xl">
                  <IconMail size={26} />
                </IconBubble>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Email support</h2>
                  <p className="mt-1 text-text-2">Best for account, trial and billing questions. Include the email address on your account.</p>
                </div>
                <span className="break-all font-semibold text-accent group-hover:underline">{site.supportEmail}</span>
              </div>
            </a>
            {site.telegram.map((t) => (
              <a
                key={t.href}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal card-hover group rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
              >
                <IconBubble>
                  <IconSend size={20} />
                </IconBubble>
                <h2 className="mt-4 font-bold">Telegram · {t.label}</h2>
                <p className="mt-1 text-sm text-text-2">Quick questions and feature requests.</p>
                <span className="mt-3 inline-block text-sm font-semibold text-accent group-hover:underline">Open chat</span>
              </a>
            ))}
          </div>
          <div className="reveal">
            <Notice tone="info" title="Account deletion">
              To delete your account and data, email us from the address on your account. Trial and payment records may be
              kept where needed to prevent abuse and for accounting.
            </Notice>
          </div>
        </Container>
      </Section>
    </>
  );
}
