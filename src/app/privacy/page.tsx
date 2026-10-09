import { LegalPage } from "@/components/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy (draft)",
  description: "Draft privacy policy for the GrowX website. Requires review before launch.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy (draft)" updated="October 2026">
      <p>
        This draft describes how the GrowX website handles personal data. The GrowX Chrome extension has its own
        privacy policy inside the extension; this page covers the website and the optional account system.
      </p>
      <h2>Who is responsible</h2>
      <p>[LEGAL ENTITY NAME AND CONTACT ADDRESS - to be provided by the owners]. Contact: see the Contact page.</p>
      <h2>What the website collects</h2>
      <ul>
        <li>Account data: your email address and a password hash or Google sign-in identifier, handled by Supabase Auth.</li>
        <li>An X username, only if you choose to enter it. It is self-reported and is not verified as belonging to you.</li>
        <li>Trial records: when a trial started and when it ends.</li>
        <li>Planned: subscription and payment records (plan, status, amount, currency, provider reference IDs) once payments exist. Card and wallet details are handled by the payment provider and are not stored by GrowX.</li>
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
        <li>Planned: to process purchases, issue access and handle refunds and support.</li>
      </ul>
      <h2>Service providers</h2>
      <p>
        Supabase (database and authentication) and Vercel (hosting) process data on our behalf. Google processes
        sign-in data if you use Google sign-in. Paddle and NOWPayments are planned payment providers and are not
        connected yet. [Data regions and processor agreements to be confirmed.]
      </p>
      <h2>Retention and your rights</h2>
      <p>
        [Retention periods to be defined.] Depending on where you live you may have rights to access, correct or
        delete your data. Account deletion is not yet self-service; contact us to request it. Trial and payment
        records may be retained where needed for fraud prevention and accounting.
      </p>
      <h2>Cookies</h2>
      <p>The website uses strictly necessary cookies to keep you signed in. It does not currently use advertising cookies. [Confirm if analytics are added.]</p>
      <h2>Changes</h2>
      <p>We will update this policy before launch and when practices change.</p>
    </LegalPage>
  );
}
