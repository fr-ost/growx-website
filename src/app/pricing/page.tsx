import { TierBadge } from "@/components/feature-lists";
import { CtaBand } from "@/components/home/cta-band";
import { Faq } from "@/components/home/faq";
import { TrialTicket } from "@/components/conversion/trial-ticket";
import { IconCheck, IconInfo } from "@/components/icons";
import { PricingCards } from "@/components/pricing-cards";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/json-ld";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { featureGroups } from "@/config/features";
import { TRIAL_DAYS } from "@/config/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX Pricing: Free Plan, Premium & 30-Day Trial",
  description: "GrowX is free forever. Premium from $1.99: 30 days, 365 days or lifetime ($29.99 for the first 100 buyers, then $59.99). Free 30-day trial, no credit card.",
  path: "/pricing",
  keywords: ["GrowX pricing", "GrowX Premium", "free Twitter growth tool", "free Twitter scheduler", "Twitter growth tool pricing", "free X auto follow"],
});

const faqs = [
  { q: "How do I pay?", a: "With cryptocurrency through a secure NOWPayments invoice page, where you choose the coin: Ethereum (ETH) and BNB Smart Chain (BEP20) coins. Monthly and yearly plans are prepaid for 30 or 365 days and do not renew automatically; lifetime is a single payment. Premium turns on automatically once your payment is confirmed on the network." },
  { q: `How does the ${TRIAL_DAYS}-day trial work?`, a: `Create a free account, confirm your email, link your X account and start the trial from your dashboard. It lasts ${TRIAL_DAYS} days, is completely free, needs no credit card or payment details, and each account and X account can use it once.` },
  { q: "Will the free version stay useful?", a: "Yes. The free plan includes the Safe and Balanced auto follow paces, sources and core filters, scheduling with up to 10 posts waiting, best time to post, 52 templates, reply targets, analytics for your latest 30 posts, 7 days of follower history and the cleanup scan." },
  { q: "What do I get with Premium?", a: "GrowX AI, unlimited scheduling, evergreen recycling and auto-plug, Turbo and X Premium paces, the smart score and more source types, advanced filters and list import, full analytics with the weekly report, full follower history and quality, VIP alerts, bulk unfollow, automatic cleanup and a workspace per X account." },
  { q: "What is the early-bird lifetime price?", a: "Lifetime Premium is $59.99, but the first 100 people who buy it pay only $29.99. The counter on the Lifetime card shows how many early-bird spots are left; a spot is used only when a payment is fully confirmed. After the 100 spots are taken, the regular $59.99 applies." },
  { q: "What happens when my prepaid period ends?", a: "Premium ends on the date shown in your account and you return to the Free plan. Nothing is charged automatically; pay again whenever you want to continue. Lifetime purchases never expire." },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]), faqLd(faqs)]} />
      <PageHero eyebrow="Pricing" title={<>Simple pricing. <span className="text-gradient">Free forever.</span></>} aside={<TrialTicket />}>
        Start free, try Premium for {TRIAL_DAYS} days, upgrade when it makes sense.
        <span className="mt-3 block font-semibold text-text">The {TRIAL_DAYS}-day Premium trial is completely free. No credit card needed.</span>
      </PageHero>

      <Section className="pt-14 sm:pt-16">
        <Container className="space-y-6">
          <div className="reveal mx-auto flex max-w-3xl gap-4 rounded-2xl border border-hairline bg-white px-5 py-4 text-sm text-text-2 shadow-hair sm:items-center">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink ring-1 ring-accent/15 sm:mt-0">
              <IconInfo size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p>
                <strong className="text-text">Pay with crypto (ETH and BNB Smart Chain / BEP20).</strong> You choose the coin on the payment page. Monthly and yearly plans are prepaid and don&apos;t renew automatically. Premium activates once your payment is confirmed.
              </p>
              <p aria-hidden="true" className="mt-2.5 flex flex-wrap gap-2">
                {["ETH", "BNB Smart Chain · BEP20"].map((c) => (
                  <span key={c} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-semibold text-text-2 ring-1 ring-hairline-strong">
                    {c}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <div className="pt-8">
            <PricingCards />
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Compare" title="Free vs Premium" center>
            Premium includes everything in Free.
          </SectionHeading>
          <div className="reveal mt-10 overflow-x-auto rounded-3xl border border-hairline bg-white shadow-hair lg:overflow-visible">
            <table className="w-full border-separate border-spacing-0 text-left text-sm sm:min-w-[36rem] [&_tbody:last-child_tr:last-child>*:first-child]:rounded-bl-3xl [&_tbody:last-child_tr:last-child>*:last-child]:rounded-br-3xl">
              <caption className="sr-only">Free and Premium feature comparison</caption>
              <thead className="bg-white lg:sticky lg:top-16 lg:z-10">
                <tr className="[&>th]:shadow-[inset_0_-1px_0_var(--hairline-strong)]">
                  <th scope="col" className="rounded-tl-3xl bg-white px-5 py-4 font-bold">Feature</th>
                  <th scope="col" className="hidden w-28 bg-white px-5 py-4 text-center font-bold sm:table-cell">Free</th>
                  <th scope="col" className="hidden w-28 rounded-tr-3xl bg-white bg-[linear-gradient(rgb(255_240_241/0.4),rgb(255_240_241/0.4))] px-5 py-4 text-center font-bold text-accent-ink sm:table-cell">Premium</th>
                </tr>
              </thead>
              {featureGroups.map((g) => (
                <tbody key={g.id}>
                  <tr className="bg-tint">
                    <th colSpan={3} scope="colgroup" className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-accent-ink shadow-[inset_3px_0_0_var(--accent)]">
                      {g.title}
                    </th>
                  </tr>
                  {g.features.map((f) => (
                    <tr key={f.id} className="align-top hover:bg-surface-2 [&>*]:border-t [&>*]:border-hairline">
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
                      <td className="hidden bg-accent-soft/40 px-5 py-4 text-center sm:table-cell">
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
