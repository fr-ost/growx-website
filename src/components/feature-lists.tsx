import type { ComponentType } from "react";
import { IconBroom, IconChart, IconCheck, IconStar, IconTarget, IconZap } from "@/components/icons";
import { Badge, IconBubble } from "@/components/ui/primitives";
import { featureGroups, type Feature } from "@/config/features";

const groupIcons: Record<string, ComponentType<{ size?: number }>> = {
  autopilot: IconZap,
  targeting: IconTarget,
  insight: IconChart,
  cleanup: IconBroom,
};

export function TierBadge({ tier }: { tier: Feature["tier"] }) {
  return tier === "free" ? (
    <Badge tone="ok">
      <IconCheck size={12} /> Free
    </Badge>
  ) : (
    <Badge tone="accent">
      <IconStar size={12} /> Premium
    </Badge>
  );
}

export function FeatureGroups() {
  return (
    <div className="space-y-20">
      {featureGroups.map((g, gi) => {
        const Icon = groupIcons[g.id] ?? IconZap;
        return (
          <section key={g.id} aria-labelledby={`g-${g.id}`} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="reveal lg:sticky lg:top-28 lg:self-start">
              <IconBubble className="h-14 w-14 rounded-2xl">
                <Icon size={26} />
              </IconBubble>
              <p className="mt-5 font-display text-sm font-bold text-accent">0{gi + 1}</p>
              <h2 id={`g-${g.id}`} className="mt-1 text-3xl font-extrabold tracking-tight">
                {g.title}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-text-2">{g.summary}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {g.features.map((f) => (
                <li key={f.id} className="reveal">
                  <div
                    className={`card-hover h-full rounded-2xl border bg-white p-6 shadow-[var(--shadow-soft)] ${
                      f.tier === "premium" ? "border-accent/25 bg-gradient-to-b from-accent-soft/60 to-white" : "border-border"
                    }`}
                  >
                    <TierBadge tier={f.tier} />
                    <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-2">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
