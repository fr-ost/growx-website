import { Badge, Card } from "@/components/ui/primitives";
import { Button, LinkButton } from "@/components/ui/button";
import { CHECKOUT_AVAILABLE, EARLY_ADOPTER_PURCHASABLE, pricingTiers, type PricingTier } from "@/config/pricing";

function isPurchasable(t: PricingTier) {
  if (t.id === "FREE") return false;
  if (t.id === "EARLY_ADOPTER_LIFETIME") return CHECKOUT_AVAILABLE && EARLY_ADOPTER_PURCHASABLE;
  return CHECKOUT_AVAILABLE;
}

export function PricingCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {pricingTiers.map((t) => (
        <li key={t.id}>
          <Card className={`flex h-full flex-col ${t.highlight ? "border-accent ring-1 ring-accent" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{t.name}</h3>
              {t.id === "FREE" ? <Badge tone="ok">Available now</Badge> : <Badge tone="neutral">Planned</Badge>}
            </div>
            <p className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{t.priceLabel}</span>{" "}
              <span className="text-sm text-muted">{t.cadence}</span>
            </p>
            <p className="mt-3 flex-1 text-sm text-text-2">{t.blurb}</p>
            {t.purchaseLimit ? (
              <p className="mt-3 text-xs text-muted">
                Planned limit: first {t.purchaseLimit} successful purchases. Not on sale; no slots are being counted yet.
              </p>
            ) : null}
            <div className="mt-5">
              {t.id === "FREE" ? (
                <LinkButton href="/signup" className="w-full">
                  Get started free
                </LinkButton>
              ) : (
                <Button variant="secondary" className="w-full" disabled aria-disabled="true" title="Checkout is not yet available">
                  {isPurchasable(t) ? "Buy" : "Checkout not yet available"}
                </Button>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
