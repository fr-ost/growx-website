import { Badge, Card, CheckIcon } from "@/components/ui/primitives";
import { featureGroups, type Feature } from "@/config/features";

export function TierBadge({ tier }: { tier: Feature["tier"] }) {
  return tier === "free" ? <Badge tone="ok">Free</Badge> : <Badge tone="accent">Premium (planned)</Badge>;
}

export function FeatureGroups() {
  return (
    <div className="space-y-12">
      {featureGroups.map((g) => (
        <section key={g.id} aria-labelledby={`g-${g.id}`}>
          <h2 id={`g-${g.id}`} className="text-2xl font-bold tracking-tight">
            {g.title}
          </h2>
          <p className="mt-2 max-w-2xl text-text-2">{g.summary}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {g.features.map((f) => (
              <li key={f.id}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{f.title}</h3>
                    <TierBadge tier={f.tier} />
                  </div>
                  <p className="mt-2 text-sm text-text-2">{f.description}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i} className="flex gap-2.5 text-sm text-text-2">
          <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}
