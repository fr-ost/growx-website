import { site } from "@/config/site";
import { LegalPage } from "@/components/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms of service for the GrowX website, accounts, Premium plans and the GrowX Chrome extension.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 2026">
      <h2>1. Who we are</h2>
      <p>GrowX is provided by {site.legalName}, {site.legalAddress}. These terms cover the GrowX website, accounts and the GrowX Chrome extension.</p>
      <h2>2. Not affiliated with X</h2>
      <p>GrowX is independent and is not affiliated with, endorsed by or sponsored by X Corp. &quot;X&quot; and &quot;Twitter&quot; belong to their owners.</p>
      <h2>3. Your responsibility</h2>
      <p>
        GrowX acts on your X account at your request. You are responsible for following X&apos;s rules and applicable
        law. Automation carries risk, including warnings, limits or suspension by X. We do not guarantee any outcome,
        follower count or follow-back rate.
      </p>
      <h2>4. Accounts</h2>
      <p>You must provide accurate information and keep your credentials secure. Entering an X username does not prove ownership and grants no rights over that X account.</p>
      <h2>5. Free plan and trial</h2>
      <p>GrowX uses a freemium model: a Free plan plus paid Premium plans. A 14-day Premium trial may be started once per account. We may change, limit or end trials and may refuse trials where abuse is suspected.</p>
      <h2>6. Premium and payments</h2>
      <p>
        Premium plans (monthly, yearly, lifetime, and a limited early-adopter lifetime offer for the first 100 purchases) are paid in advance in cryptocurrency (USDT or USDC), processed by NOWPayments. Monthly and yearly plans are prepaid for 30 or 365 days and do not renew automatically; you pay again to continue. Network fees and any taxes are your responsibility. Premium is activated only after the payment provider confirms payment to us. Prices may change for future purchases. See the <a href="/refund-policy">Refund Policy</a> for refunds and the meaning of &quot;lifetime&quot;.
      </p>
      <h2>7. Acceptable use</h2>
      <p>Do not abuse the service, attempt to bypass plan limits, interfere with the API, or use GrowX for spam or unlawful activity.</p>
      <h2>8. Disclaimer and liability</h2>
      <p>GrowX is provided &quot;as is&quot; without warranties of any kind, to the extent permitted by law. To the extent permitted by law, our total liability for any claim is limited to the amount you paid for GrowX in the 12 months before the claim, and we are not liable for indirect or consequential loss, including loss of followers, reach or access to your X account.</p>
      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of Bangladesh. Courts in Rajshahi, Bangladesh have jurisdiction, without limiting any mandatory consumer rights you have where you live.</p>
      <h2>10. Changes and contact</h2>
      <p>We may update these terms; material changes will be announced. Contact: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
    </LegalPage>
  );
}
