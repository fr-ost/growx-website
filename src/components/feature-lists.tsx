import Link from "next/link";
import type { ComponentType } from "react";
import { IconArrowRight, IconBroom, IconChart, IconCheck, IconMessage, IconPen, IconSparkles, IconStar, IconTarget, IconWand } from "@/components/icons";
import { Badge, IconBubble } from "@/components/ui/primitives";
import { featureGroups, type Feature, type FeatureGroup } from "@/config/features";

const groupIcons: Record<FeatureGroup["id"], ComponentType<{ size?: number }>> = {
  grow: IconTarget,
  create: IconPen,
  ai: IconWand,
  engage: IconMessage,
  insights: IconChart,
  cleanup: IconBroom,
  more: IconSparkles,
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
    <div className="space-y-24">
      {featureGroups.map((g, gi) => {
        const Icon = groupIcons[g.id];
        return (
          <section key={g.id} id={g.id} aria-labelledby={`g-${g.id}`} className="grid scroll-mt-24 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            <div className="reveal lg:sticky lg:top-28 lg:self-start">
              <IconBubble className="h-14 w-14">
                <Icon size={26} />
              </IconBubble>
              <p className="mt-5 font-display text-sm font-bold text-accent">{String(gi + 1).padStart(2, "0")}</p>
              <h2 id={`g-${g.id}`} className="mt-1 text-3xl font-extrabold tracking-tight">
                {g.title}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-text">{g.summary}</p>
              {g.detail.map((d) => (
                <p key={d} className="mt-4 leading-relaxed text-text-2">{d}</p>
              ))}
              {g.page ? (
                <Link href={`/features/${g.page}`} className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-accent">
                  Learn more <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}
            </div>
            <ul className="grid content-start gap-4 sm:grid-cols-2">
              {g.features.map((f) => (
                <li key={f.id} className="reveal">
                  <div
                    className={`h-full rounded-3xl border p-6 ${
                      f.tier === "premium" ? "border-accent/20 bg-gradient-to-b from-accent-soft/70 to-white" : "border-border bg-white"
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
