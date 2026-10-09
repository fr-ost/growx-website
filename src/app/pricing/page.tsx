import { TierBadge } from "@/components/feature-lists";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { IconCheck, IconInfo } from "@/components/icons";
import { PricingCards } from "@/components/pricing-cards";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/json-ld";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureGroups } from "@/config/features";
import { TRIAL_DAYS } from "@/config/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX Pricing: Free Plan, Premium & 14-Day Trial",
  description: "GrowX is free forever. Planned Premium: $1.99/month, $14.99/year or $29.99 lifetime, with a 14-day trial. Compare Free vs Premium; checkout is coming soon.",
  path: "/pricing",
  keywords: ["GrowX pricing", "GrowX Premium", "free X auto follow", "Twitter growth tool pricing"],
});

const faqs = [
  { q: "Can I buy Premium today?", a: "Not yet. Checkout is being prepared and no payment can be made on this site today. The prices shown are the planned launch prices." },
  { q: `How does the ${TRIAL_DAYS}-day trial work?`, a: `Create a free account, confirm your email, add your X username and start the trial from your dashboard. It lasts ${TRIAL_DAYS} days, needs no card, and each account and X username can use it once.` },
  { q: "Will the free version stay useful?", a: "Yes. Core features stay free: the Safe and Balanced autopilot, sources, queue, core filters, history, analytics, backup, the cleanup scan and manual unfollows." },
  { q: "What is the Early Adopter Lifetime offer?", a: "A $0.99 one-time price for permanent Premium, limited to the first 100 successful, verified purchases. It is not on sale yet. When the 100 are sold, the offer ends and regular prices apply." },
  { q: "What happens if a renewal payment fails?", a: "Once billing launches, card subscriptions keep Premium for a 3-day grace period after a failed renewal; after that the account returns to Free until a payment succeeds. Lifetime purchases are never affected." },
  { q: "Which payment methods are planned?", a: "Cards and other methods through Paddle, and cryptocurrency (USDT and USDC first) through NOWPayments." },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]), faqLd(faqs)]} />
      <PageHero eyebrow="Pricing" title={<>Simple pricing. <span className="text-gradient">Free forever.</span></>}>
        Start free, try Premium for {TRIAL_DAYS} days, upgrade when it makes sense.
      </PageHero>

      <Section className="pt-14 sm:pt-16">
        <Container className="space-y-6">
          <div className="reveal mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-warn/25 bg-warn-soft px-5 py-3.5 text-sm text-warn">
            <IconInfo size={18} className="shrink-0" />
            <p>
              <strong>Checkout is coming soon.</strong> Paid plans can&apos;t be purchased yet; prices shown are planned.
            </p>
          </div>
          <div className="pt-6">
            <PricingCards />
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Compare" title="Free vs Premium" center>
            Premium includes everything in Free.
          </SectionHeading>
          <div className="reveal mt-10 overflow-x-auto rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
            <table className="w-full text-left text-sm sm:min-w-[36rem]">
              <caption className="sr-only">Free and Premium feature comparison</caption>
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th scope="col" className="px-5 py-4 font-bold">Feature</th>
                  <th scope="col" className="hidden w-28 px-5 py-4 text-center font-bold sm:table-cell">Free</th>
                  <th scope="col" className="hidden w-28 px-5 py-4 text-center font-bold text-accent sm:table-cell">Premium</th>
                </tr>
              </thead>
              {featureGroups.map((g) => (
                <tbody key={g.id}>
                  <tr className="bg-tint">
                    <th colSpan={3} scope="colgroup" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-accent">
                      {g.title}
                    </th>
                  </tr>
                  {g.features.map((f) => (
                    <tr key={f.id} className="border-t border-border align-top transition-colors hover:bg-surface-2">
                      <th scope="row" className="px-5 py-4 font-semibold">
                        <span className="flex flex-wrap items-center gap-2">
                          {f.title} <span className="sm:hidden"><TierBadge tier={f.tier} /></span>
                        </span>
                        <span className="mt-1 block text-xs font-normal leading-relaxed text-muted">{f.description}</span>
                      </th>
                      <td className="hidden px-5 py-4 text-center sm:table-cell">
                        {f.tier === "free" ? (
                          <>
                            <IconCheck size={20} className="mx-auto text-ok" />
                            <span className="sr-only">Included</span>
                          </>
                        ) : (
                          <>
                            <span aria-hidden="true" className="text-muted">-</span>
                            <span className="sr-only">Not included</span>
                          </>
                        )}
                      </td>
                      <td className="hidden px-5 py-4 text-center sm:table-cell">
                        <IconCheck size={20} className="mx-auto text-accent" />
                        <span className="sr-only">Included</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Pricing questions" center />
          <div className="reveal mt-10">
            <Faq items={faqs} />
          </div>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
