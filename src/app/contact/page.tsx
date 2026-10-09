import { IconMail, IconSend } from "@/components/icons";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { Container, IconBubble, Notice, PageHero, Section } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX Support & Contact",
  description: "Get help with the GrowX X (Twitter) auto follow Chrome extension: email support@growxapp.org or message the developer on Telegram.",
  path: "/contact",
  keywords: ["GrowX support", "GrowX contact", "X auto follow help"],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Support", path: "/contact" }])} />
      <PageHero eyebrow="Support" title={<>We&apos;re here to <span className="text-gradient">help</span>.</>}>
        Questions, bug reports, feature requests or account help: reach the GrowX developer directly.
      </PageHero>
      <Section>
        <Container className="max-w-4xl space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            <a
              href={`mailto:${site.supportEmail}`}
              className="reveal card-hover group rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <IconBubble className="h-14 w-14 rounded-2xl">
                <IconMail size={26} />
              </IconBubble>
              <h2 className="mt-4 text-xl font-bold">Email support</h2>
              <p className="mt-1 text-text-2">Best for account, trial and billing questions. Include the email address on your account.</p>
              <span className="mt-3 inline-block break-all font-semibold text-accent group-hover:underline">{site.supportEmail}</span>
            </a>
            {site.telegram.map((t) => (
              <a
                key={t.href}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal card-hover group rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
              >
                <IconBubble className="h-14 w-14 rounded-2xl">
                  <IconSend size={24} />
                </IconBubble>
                <h2 className="mt-4 text-xl font-bold">Telegram · {t.label}</h2>
                <p className="mt-1 text-text-2">Quick questions and feature requests, straight to the developer.</p>
                <span className="mt-3 inline-block font-semibold text-accent group-hover:underline">Open chat</span>
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
