import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import f from "@/components/features/feature-groups.module.css";
import { IconArrowRight, IconBroom, IconChart, IconCheck, IconMessage, IconPen, IconSparkles, IconStar, IconTarget, IconWand } from "@/components/icons";
import { stagger } from "@/components/motion/stagger";
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

/** Giant outlined numeral with a gradient copy that fills bottom-up on scroll (decorative). */
function GroupNumeral({ n }: { n: number }) {
  const label = String(n).padStart(2, "0");
  return (
    <span aria-hidden="true" className={f.numeral}>
      <span className={f.outline}>{label}</span>
      <span className={`text-gradient ${f.fill}`}>{label}</span>
    </span>
  );
}

/**
 * Every feature group: a sticky story column at lg (icon, numeral, heading, copy and an
 * illustrative demo passed in by the page) beside the group's Free / Premium feature cards.
 * Demos come in through `demos` so pages that only need TierBadge never import them.
 */
export function FeatureGroups({ demos = {} }: { demos?: Partial<Record<FeatureGroup["id"], ReactNode>> }) {
  return (
    <div className="space-y-24 lg:space-y-32">
      {featureGroups.map((g, gi) => {
        const Icon = groupIcons[g.id];
        const demo = demos[g.id];
        return (
          <section key={g.id} id={g.id} aria-labelledby={`g-${g.id}`} className="grid scroll-mt-36 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div className="lg:sticky lg:top-36 lg:self-start">
              <div className="reveal flex items-end gap-4" style={stagger(0)}>
                <IconBubble className="mb-2 h-14 w-14">
                  <Icon size={26} />
                </IconBubble>
                <GroupNumeral n={gi + 1} />
              </div>
              <h2 id={`g-${g.id}`} className="reveal-heading mt-5 text-3xl font-extrabold tracking-tight [text-wrap:balance]" style={stagger(1)}>
                {g.title}
              </h2>
              <p className="reveal mt-3 text-lg leading-relaxed text-text [text-wrap:pretty]" style={stagger(2)}>
                {g.summary}
              </p>
              {g.detail.map((d) => (
                <p key={d} className="mt-4 leading-relaxed text-text-2 [text-wrap:pretty]">
                  {d}
                </p>
              ))}
              {g.page ? (
                <Link href={`/features/${g.page}`} className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-accent-ink">
                  <span className="link-draw">Learn more</span> <IconArrowRight size={16} className="nudge" />
                </Link>
              ) : null}
              {demo ? (
                <div className="reveal-scale mt-8 hidden lg:block" style={stagger(3)}>
                  {demo}
                </div>
              ) : null}
            </div>
            <ul className="grid content-start gap-4 sm:grid-cols-2">
              {g.features.map((ft, i) => {
                const premium = ft.tier === "premium";
                return (
                  <li key={ft.id} className="reveal" style={stagger(i % 2)}>
                    <div
                      className={`relative h-full rounded-3xl border p-6 shadow-[var(--shadow-hair)] ${
                        premium ? "border-transparent bg-[linear-gradient(180deg,var(--tint),#fff_70%)]" : "border-hairline bg-white"
                      }`}
                    >
                      {premium ? (
                        <>
                          <span aria-hidden="true" className={f.ring} />
                          <IconStar aria-hidden="true" size={18} className="absolute right-5 top-5 fill-accent/10 text-accent/35" />
                        </>
                      ) : null}
                      <TierBadge tier={ft.tier} />
                      <h3 className="mt-4 text-lg font-bold">{ft.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-2">{ft.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
