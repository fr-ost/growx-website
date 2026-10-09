import { Card, Container, Notice, PageHeader, Section } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact and support",
  description: "How to reach the GrowX team for support, feedback and feature requests.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <PageHeader eyebrow="Support" title="Contact">
          For help, bug reports or feature requests, message the developers directly. These are the same channels
          published inside the extension.
        </PageHeader>
        <Card>
          <h2 className="font-semibold">Telegram</h2>
          <ul className="mt-3 space-y-2">
            {site.telegram.map((t) => (
              <li key={t.href}>
                <a href={t.href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </Card>
        {site.supportEmail ? (
          <Card>
            <h2 className="font-semibold">Email</h2>
            <p className="mt-2">
              <a href={`mailto:${site.supportEmail}`} className="font-medium text-accent underline underline-offset-2">
                {site.supportEmail}
              </a>
            </p>
          </Card>
        ) : (
          <Notice tone="info">A support email address has not been configured yet.</Notice>
        )}
        <Notice tone="info" title="Account and billing requests">
          Account deletion is not self-service yet. Contact us using one of the channels above and mention the email
          address on your account.
        </Notice>
      </Container>
    </Section>
  );
}
