import { site } from "@/config/site";
import { LegalPage } from "@/components/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How the GrowX website handles personal data: accounts, trials, payments and your rights.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 2026">
      <p>
        This policy describes how the GrowX website handles personal data. The GrowX Chrome extension has its own
        privacy policy inside the extension; this page covers the website and the optional account system.
      </p>
      <h2>Who is responsible</h2>
      <p>{site.legalName}, {site.legalAddress}. Contact: <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
      <h2>What the website collects</h2>
      <ul>
        <li>Account data: your email address and a password hash or Google sign-in identifier, handled by Supabase Auth.</li>
        <li>An X username, only if you choose to enter it. It is self-reported and is not verified as belonging to you.</li>
        <li>Trial records: when a trial started and when it ends.</li>
        <li>Subscription and payment records (plan, status, amount, currency, provider reference IDs). Card and wallet details are handled by the payment provider and are not stored by GrowX.</li>
        <li>Technical data such as IP address and request logs processed by the hosting provider.</li>
      </ul>
      <h2>What the website does not collect</h2>
      <ul>
        <li>Your X password or X login. GrowX does not use X OAuth.</li>
        <li>Your X follow lists, queue, sources or settings. In the extension these stay in your browser storage.</li>
      </ul>
      <h2>Why we use data</h2>
      <ul>
        <li>To provide sign-in, your dashboard and plan information.</li>
        <li>To limit each account to one free trial and prevent abuse.</li>
        <li>To process purchases, issue access and handle refunds and support.</li>
      </ul>
      <h2>Service providers</h2>
      <p>
        Supabase (database and authentication) and Vercel (hosting) process data on our behalf. Google processes
        sign-in data if you use Google sign-in. Paddle (card payments, as merchant of record) and NOWPayments (crypto payments) process payments; they receive the data needed to take payment and send us only payment status and reference IDs. These providers may process data outside your country.
      </p>
      <h2>Retention and your rights</h2>
      <p>
        We keep account data while your account exists. Trial and payment records are kept as long as needed for fraud prevention, accounting and legal obligations (typically up to 7 years for payment records). Depending on where you live you may have rights to access, correct or
        delete your data. Account deletion is not yet self-service; contact us to request it. Trial and payment
        records may be retained where needed for fraud prevention and accounting.
      </p>
      <h2>Cookies</h2>
      <p>The website uses strictly necessary cookies to keep you signed in. It does not currently use advertising cookies. If that changes we will update this policy.</p>
      <h2>Changes</h2>
      <p>We will update this policy when our practices change and show the date above.</p>
    </LegalPage>
  );
}
