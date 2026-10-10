import { site } from "@/config/site";
import { LegalPage } from "@/components/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Refund Policy (draft)",
  description: "How refunds, cancellations and chargebacks work for GrowX Premium plans paid by card or crypto. Draft pending review.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy (draft)" updated="October 2026">
      <p>This draft explains how refunds and cancellations work for GrowX Premium. It is not legal advice and is pending review before paid plans launch.</p>
      <h2>1. Plans covered</h2>
      <p>Monthly ($1.99), yearly ($14.99), lifetime ($29.99) and the limited Early Adopter lifetime offer ($0.99). The free plan and the 14-day trial cost nothing and need no refund.</p>
      <h2>2. Cancelling a card subscription</h2>
      <p>Monthly and yearly card plans are handled by our payment provider, Paddle. You can cancel at any time from your Account page. Cancelling stops future renewals; Premium stays active until the end of the period you already paid for.</p>
      <h2>3. Refund requests</h2>
      <p>
        [Refund window and conditions to be set by the owner before launch, for example the number of days after purchase in which a first
        payment or a lifetime purchase can be refunded.] To request a refund, email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from your account email with your order details. Card payments are refunded to the original payment method by Paddle.
      </p>
      <h2>4. Crypto payments</h2>
      <p>
        Crypto plans are prepaid for a fixed period (30 days monthly, 365 days yearly) and do not renew automatically. Blockchain
        transactions cannot be reversed, so crypto refunds, where granted, are made manually in the same asset, minus network fees, to an address you provide. If you underpay, overpay, pay after the payment window or send the wrong asset or network, contact support with your transaction ID.
      </p>
      <h2>5. What happens to access after a refund</h2>
      <p>A full refund or a chargeback ends Premium access for that purchase. A partial refund does not end access. Refunded early-adopter purchases do not free the offer for someone else.</p>
      <h2>6. Payments we could not activate</h2>
      <p>If a payment arrives that cannot be activated automatically (for example the limited offer sold out while you were paying), we will refund it in full.</p>
      <h2>7. Chargebacks</h2>
      <p>Please contact us before disputing a charge so we can fix it quickly. A chargeback revokes access for that purchase.</p>
      <h2>8. Lifetime plans</h2>
      <p>[Definition of &quot;lifetime&quot; (for example the life of the product) to be written before launch.]</p>
      <h2>9. Contact</h2>
      <p><a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a></p>
    </LegalPage>
  );
}
