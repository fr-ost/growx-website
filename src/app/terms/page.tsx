import { site } from "@/config/site";
import { LegalPage } from "@/components/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service (draft)",
  description: "Draft terms of service for GrowX. Requires review before launch.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service (draft)" updated="October 2026">
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
      <h2>6. Premium and payments (planned)</h2>
      <p>
        Premium plans (monthly, yearly, lifetime) are planned and cannot be purchased yet. [Billing terms, taxes,
        refund policy, the definition of &quot;lifetime&quot; and early-adopter terms to be written before checkout launches.]
      </p>
      <h2>7. Acceptable use</h2>
      <p>Do not abuse the service, attempt to bypass plan limits, interfere with the API, or use GrowX for spam or unlawful activity.</p>
      <h2>8. Disclaimer and liability</h2>
      <p>[Warranty disclaimer and limitation of liability wording to be supplied by counsel for the applicable jurisdiction.]</p>
      <h2>9. Governing law</h2>
      <p>[Governing law and venue to be decided.]</p>
      <h2>10. Changes and contact</h2>
      <p>We may update these terms; material changes will be announced. Contact: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
    </LegalPage>
  );
}
