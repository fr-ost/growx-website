import { BuyButtons } from "@/components/billing/buy-buttons";
import { LifetimePrice } from "@/components/billing/lifetime-price";
import { IconCheck, IconInfinity, IconStar } from "@/components/icons";
import { BorderBeam } from "@/components/motion/border-beam";
import { stagger } from "@/components/motion/stagger";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { pricingTiers } from "@/config/pricing";
import type { ProductId } from "@/lib/billing/catalog";

const perks: Record<string, string[]> = {
  FREE: ["Safe & Balanced auto follow", "Schedule up to 10 posts at a time", "Analytics for your latest 30 posts", "Who unfollowed you (7 days)", "Reply targets & cleanup scan"],
  PRO_MONTHLY: ["Everything in Free", "GrowX AI writer", "Unlimited scheduling & evergreen", "Turbo pace & smart score", "Full analytics & follower history", "Bulk unfollow & auto cleanup"],
  PRO_YEARLY: ["Everything in Premium", "About $1.25 per month", "One payment for 365 days"],
  PRO_LIFETIME: ["Everything in Premium", "Pay once", "No renewal payments"],
};

/**
 * The four plans. Prices, plan terms and the early-bird bar never move: the only motion is the
 * card reveal, the fine-pointer spotlight, a 2px hover lift and, on the highlighted (yearly) card,
 * one looping border beam (paused off-screen). The ribbon reads "Best value" because the yearly plan
 * is the cheapest per day; there is no sales data behind a "most popular" claim.
 */
export function PricingCards() {
  const main = pricingTiers;
  return (
    <div className="space-y-6">
      <ul data-spotlight-group="" className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {main.map((t, i) => (
          <li key={t.id} className="reveal relative isolate" style={stagger(i % 4)}>
            {t.highlight ? (
              <span aria-hidden="true" data-decor="" className="glow-soft -bottom-10 left-1/2 -z-10 h-28 w-[88%] -translate-x-1/2 [--glow:rgba(225,29,46,0.32)]" />
            ) : null}
            <div
              data-spotlight=""
              className={`relative flex h-full flex-col rounded-3xl bg-white p-6 ${
                t.highlight
                  ? "border-2 border-accent shadow-glow lg:-translate-y-3 lg:hover:-translate-y-5 motion-ok:transition-[translate] motion-ok:duration-300 motion-ok:ease-glide"
                  : "lift border border-hairline shadow-hair"
              }`}
            >
              {t.highlight ? <BorderBeam mode="loop" onBorder={2} /> : null}
              {t.highlight ? (
                <span className="bg-brand-deep absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-bold text-white shadow-red ring-2 ring-white">
                  Best value
                </span>
              ) : null}
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{t.name}</h3>
                {t.id === "FREE" ? (
                  <Badge tone="ok">Available</Badge>
                ) : t.id === "PRO_LIFETIME" ? (
                  <IconInfinity size={20} className="text-accent-ink" />
                ) : (
                  <IconStar size={18} className="text-accent-ink" />
                )}
              </div>
              {t.id === "PRO_LIFETIME" ? (
                <LifetimePrice />
              ) : (
                <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums">{t.priceLabel}</span>
                  <span className="whitespace-nowrap text-sm text-muted">{t.cadence}</span>
                </p>
              )}
              <p className="mt-2 text-sm text-text-2">{t.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-hairline pt-5 text-sm text-text-2">
                {(perks[t.id] ?? []).map((p) => (
                  <li key={p} className="flex gap-2">
                    <IconCheck size={17} className={`mt-0.5 shrink-0 ${t.id === "FREE" ? "text-ok" : "text-accent"}`} /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {t.id === "FREE" ? (
                  <div className="space-y-2 text-center">
                    <LinkButton href="/signup" variant="secondary" className="w-full">
                      Start free
                    </LinkButton>
                    <p className="text-xs font-semibold text-text-2">Then try Premium free for 30 days. No credit card.</p>
                  </div>
                ) : (
                  <BuyButtons product={t.id as ProductId} primary={!!t.highlight} />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
