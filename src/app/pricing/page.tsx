import { PricingCards } from "@/components/pricing-cards";
import { TierBadge } from "@/components/feature-lists";
import { Container, Notice, PageHeader, Section } from "@/components/ui/primitives";
import { LinkButton } from "@/components/ui/button";
import { featureGroups } from "@/config/features";
import { TRIAL_DAYS } from "@/config/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description: "Planned GrowX pricing: Free forever, plus Premium monthly, yearly and lifetime. Checkout is not yet available.",
  path: "/pricing",
});

const faqs = [
  { q: "Can I buy Premium today?", a: "No. Checkout is not available yet. The prices shown are the planned launch prices and may change before launch." },
  { q: "Will the free version stay useful?", a: "That is the intention: core features such as the Safe and Balanced autopilot, sources, queue, history, analytics and backup are planned to remain free." },
  { q: `What about the ${TRIAL_DAYS}-day trial?`, a: `A ${TRIAL_DAYS}-day Premium trial is being prepared for signed-in accounts. It starts only when you choose to start it from your dashboard, and each account can start one.` },
  { q: "What is the Early Adopter Lifetime offer?", a: "A planned $0.99 lifetime price with permanent Premium access, limited to the first 100 successful, verified purchases. It is not on sale yet. Once the 100 are sold the offer ends and the regular prices apply; no slot counter or countdown is shown." },
  { q: "Which payment methods are planned?", a: "Cards and other methods through Paddle, and cryptocurrency (USDT and USDC first) through NOWPayments. Neither is connected yet. Failed card renewals are planned to keep Premium for a 3-day grace period; lifetime purchases are unaffected." },
];

export default function PricingPage() {
  return (
    <Section>
      <Container className="space-y-12">
        <PageHeader eyebrow="Pricing" title="Free forever. Premium when you need more.">
          These are planned prices. Premium cannot be purchased yet.
        </PageHeader>
        <Notice tone="warn" title="Checkout is not yet available">
          No payment can be made on this site today. Buttons for paid plans are disabled on purpose.
        </Notice>
        <PricingCards />

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Free vs Premium (proposed)</h2>
          <p className="mt-2 text-text-2">Based on features that exist in the extension today.</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">Proposed Free and Premium feature comparison</caption>
              <thead className="bg-surface-2 text-text-2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Feature</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Free</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {featureGroups.flatMap((g) =>
                  g.features.map((f) => (
                    <tr key={f.id} className="border-t border-border align-top">
                      <th scope="row" className="px-4 py-3 font-medium">
                        {f.title}
                        <span className="mt-0.5 block text-xs font-normal text-muted">{f.description}</span>
                      </th>
                      <td className="px-4 py-3">{f.tier === "free" ? <TierBadge tier="free" /> : <span className="text-muted">-</span>}</td>
                      <td className="px-4 py-3">
                        <span className="text-ok" aria-label="Included">Included</span>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Premium includes everything in Free. The split is a proposal and is not enforced anywhere yet.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
          <dl className="mt-6 grid gap-6 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm text-text-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
        <LinkButton href="/signup">Create a free account</LinkButton>
      </Container>
    </Section>
  );
}
