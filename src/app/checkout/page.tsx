import { redirect } from "next/navigation";
import { AppShell, Panel } from "@/components/app-shell";
import { StartCryptoCheckout } from "@/components/billing/start-checkout";
import { IconLock } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { getProduct, isPurchasableProduct, minorToDecimal, type ProductId } from "@/lib/billing/catalog";
import { getEarlyBird } from "@/lib/billing/early-bird";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServiceKey } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Checkout", description: "Review your GrowX Premium order.", path: "/checkout", noindex: true });
export const dynamic = "force-dynamic";

/** Invoice summary for one plan. The price shown and charged is the server's, never the browser's. */
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const requested = plan && isPurchasableProduct(plan) ? plan : null;
  const user = await requireUser(requested ? `/checkout?plan=${requested}` : "/pricing");
  if (!requested) redirect("/pricing");

  // Same server-side rule as the checkout API: lifetime buyers get the early-bird price while spots remain.
  const early = requested === "PRO_LIFETIME" && getSupabaseServiceKey() ? await getEarlyBird(createAdminClient()) : null;
  const product: ProductId = early?.state === "available" ? "PRO_LIFETIME_EARLY" : requested;
  const p = getProduct(product);
  const price = `$${minorToDecimal(p.amountMinor)}`;
  const regular = p.isEarlyAdopter ? `$${minorToDecimal(getProduct("PRO_LIFETIME").amountMinor)}` : null;
  const term = p.cryptoPeriodDays ? `${p.cryptoPeriodDays} days of Premium, prepaid` : "Permanent Premium, one-time payment";

  return (
    <AppShell active="/account" email={user.email}>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
        <p className="mt-1 text-text-2">Review your order, then pay on the secure NOWPayments invoice page.</p>
      </div>

      <Panel title="Invoice" icon={<IconLock size={17} />}>
        <dl className="divide-y divide-border rounded-xl border border-border text-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-text-2">Plan</dt>
            <dd className="text-right font-semibold">{p.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-text-2">Includes</dt>
            <dd className="text-right font-semibold">{term}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-text-2">Account</dt>
            <dd className="break-all text-right font-semibold">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 bg-surface-2 px-4 py-4">
            <dt className="font-bold">Total</dt>
            <dd className="text-right font-display text-2xl font-extrabold">{regular ? <s className="mr-2 text-base font-semibold text-muted">{regular}</s> : null}{price} <span className="text-sm font-semibold text-muted">USD</span></dd>
          </div>
        </dl>

        <div className="mt-5 space-y-4">
          {regular ? (
            <Notice tone="success" title="Early-bird price applied">
              You pay {price} instead of {regular} because you are among the first {early?.total ?? 100} lifetime buyers.
            </Notice>
          ) : null}
          <Notice tone="info" title="Pay with the coin you prefer">
            On the next page you choose the cryptocurrency (Ethereum and BNB Smart Chain / BEP20 coins). The exact coin amount for {price} is calculated there.
            {p.cryptoPeriodDays ? " Crypto plans do not renew automatically and nothing is ever debited from your wallet." : ""}
          </Notice>
          {user.email_confirmed_at ? (
            <StartCryptoCheckout product={requested} />
          ) : (
            <Notice tone="warn" title="Confirm your email first">Open the confirmation link we emailed you, then come back to this page.</Notice>
          )}
          <p className="text-xs text-muted">
            Premium activates automatically once the payment is confirmed on the network. Network fees are paid by you. See the{" "}
            <a href="/refund-policy" className="font-semibold text-accent underline">refund policy</a>.
          </p>
          <LinkButton href="/pricing" variant="ghost" size="sm">← Back to pricing</LinkButton>
        </div>
      </Panel>
    </AppShell>
  );
}
