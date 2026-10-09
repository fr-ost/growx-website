import { IconCheck, IconGift, IconInfinity, IconStar } from "@/components/icons";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { CHECKOUT_AVAILABLE, EARLY_ADOPTER_PURCHASABLE, visibleTiers, type PricingTier } from "@/config/pricing";

const perks: Record<string, string[]> = {
  FREE: ["Safe & Balanced autopilot", "Sources, scored queue, core filters", "History, analytics, backup", "Cleanup scan & manual unfollow"],
  PRO_MONTHLY: ["Everything in Free", "Turbo & X Premium paces", "Advanced filters & bulk import", "High-volume cleanup"],
  PRO_YEARLY: ["Everything in Premium", "About $1.25 per month", "One payment a year"],
  PRO_LIFETIME: ["Everything in Premium", "Pay once", "No renewal payments"],
};

function PaidButton({ t }: { t: PricingTier }) {
  const purchasable = t.id === "EARLY_ADOPTER_LIFETIME" ? EARLY_ADOPTER_PURCHASABLE : CHECKOUT_AVAILABLE;
  return (
    <Button
      variant={t.highlight ? "primary" : "secondary"}
      className="w-full"
      disabled={!purchasable}
      aria-disabled={!purchasable}
      title={purchasable ? undefined : "Checkout is not available yet"}
    >
      {purchasable ? "Buy now" : "Coming soon"}
    </Button>
  );
}

export function PricingCards() {
  const tiers = visibleTiers();
  const main = tiers.filter((t) => t.id !== "EARLY_ADOPTER_LIFETIME");
  const early = tiers.find((t) => t.id === "EARLY_ADOPTER_LIFETIME");
  return (
    <div className="space-y-6">
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {main.map((t) => (
          <li key={t.id} className="reveal">
            <div
              className={`card-hover relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[var(--shadow-soft)] ${
                t.highlight ? "border-2 border-accent shadow-[0_30px_60px_-30px_rgba(225,29,46,0.55)] lg:-translate-y-3 lg:hover:-translate-y-5" : "border-border"
              }`}
            >
              {t.highlight ? (
                <span className="bg-brand absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white shadow-[var(--shadow-red)]">
                  Most popular
                </span>
              ) : null}
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{t.name}</h3>
                {t.id === "FREE" ? <Badge tone="ok">Available</Badge> : t.id === "PRO_LIFETIME" ? <IconInfinity size={20} className="text-accent" /> : <IconStar size={18} className="text-accent" />}
              </div>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight">{t.priceLabel}</span>
                <span className="whitespace-nowrap text-sm text-muted">{t.cadence}</span>
              </p>
              <p className="mt-2 text-sm text-text-2">{t.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-text-2">
                {(perks[t.id] ?? []).map((p) => (
                  <li key={p} className="flex gap-2">
                    <IconCheck size={17} className={`mt-0.5 shrink-0 ${t.id === "FREE" ? "text-ok" : "text-accent"}`} /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {t.id === "FREE" ? (
                  <LinkButton href="/signup" variant="secondary" className="w-full">
                    Start free
                  </LinkButton>
                ) : (
                  <PaidButton t={t} />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {early ? (
        <div className="reveal relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-r from-accent-soft via-white to-accent-soft p-6 sm:p-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <span className="bg-brand flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-red)]">
              <IconGift size={26} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold">{early.name}</h3>
                <Badge tone="neutral">Planned · not on sale yet</Badge>
              </div>
              <p className="mt-1.5 text-text-2">
                Permanent Premium for <strong>{early.priceLabel}</strong> one-time, for the first {early.purchaseLimit} successful, verified
                purchases. Once they are gone, regular prices apply.
              </p>
            </div>
            <div className="w-full md:w-48">
              <PaidButton t={early} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
