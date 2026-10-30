import Link from "next/link";
import { FeatureIcon } from "@/components/feature-icon";
import { IconArrowRight } from "@/components/icons";
import type { FeatureIcon as IconName } from "@/content/feature-types";

/**
 * Icon tile for feature link cards: a tinted tile whose solid red layer fades in on the
 * parent .group hover/focus (opacity only) while the icon turns white instantly.
 */
export function FeatureTile({ name, size = 19 }: { name: IconName; size?: number }) {
  return (
    <span className="relative grid size-10 shrink-0 place-items-center overflow-clip rounded-xl bg-accent-soft text-accent-ink ring-1 ring-accent/10 group-hover:text-white group-focus-visible:text-white">
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-ok:transition-opacity motion-ok:duration-300 motion-ok:ease-glide"
      />
      <FeatureIcon name={name} size={size} className="relative" />
    </span>
  );
}

/**
 * A feature link card (features index, "More from GrowX"). Lift + pointer spotlight; the
 * label's arrow fades in and nudges on hover. Put the reveal on the parent <li>, not here,
 * so the reveal owns `translate` on the li and `lift` owns it on the card.
 */
export function FeatureLinkCard({ href, icon, label, blurb }: { href: string; icon: IconName; label: string; blurb: string }) {
  return (
    <Link
      href={href}
      data-spotlight=""
      className="lift group flex h-full items-start gap-3 rounded-3xl border border-hairline bg-white p-5 shadow-[var(--shadow-hair)]"
    >
      <FeatureTile name={icon} />
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-bold">
          {label}
          <IconArrowRight
            size={14}
            className="nudge shrink-0 text-accent-ink opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-ok:transition-[opacity,translate] motion-ok:duration-200 motion-ok:ease-glide"
          />
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{blurb}</span>
      </span>
    </Link>
  );
}
