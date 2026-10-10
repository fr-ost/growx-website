import { BuyButtons } from "@/components/billing/buy-buttons";
import { EarlyAdopterBanner } from "@/components/billing/early-adopter-banner";
import { IconCheck, IconInfinity, IconStar } from "@/components/icons";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { pricingTiers } from "@/config/pricing";
import type { ProductId } from "@/lib/billing/catalog";

const perks: Record<string, string[]> = {
  FREE: ["Safe & Balanced autopilot", "Sources, scored queue, core filters", "History, analytics, backup", "Cleanup scan & manual unfollow"],
  PRO_MONTHLY: ["Everything in Free", "Turbo & X Premium paces", "Advanced filters & bulk import", "High-volume cleanup"],
  PRO_YEARLY: ["Everything in Premium", "About $1.25 per month", "One payment for 365 days"],
  PRO_LIFETIME: ["Everything in Premium", "Pay once", "No renewal payments"],
};

export function PricingCards() {
  const main = pricingTiers.filter((t) => t.id !== "EARLY_ADOPTER_LIFETIME");
  const early = pricingTiers.find((t) => t.id === "EARLY_ADOPTER_LIFETIME");
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
                  <BuyButtons product={t.id as ProductId} primary={!!t.highlight} />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {early ? <EarlyAdopterBanner tier={early} /> : null}
    </div>
  );
}
