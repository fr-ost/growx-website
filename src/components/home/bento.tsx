import Link from "next/link";
import type { ReactNode } from "react";
import { FeatureIcon } from "@/components/feature-icon";
import { IconArrowRight } from "@/components/icons";
import { Kbd } from "@/components/motion/kbd";
import { DemoAiDraft } from "@/components/motion/demos/ai-draft";
import { DemoCleanup } from "@/components/motion/demos/cleanup";
import { DemoFollowQueue } from "@/components/motion/demos/follow-queue";
import { DemoFollowerDiff } from "@/components/motion/demos/follower-diff";
import { DemoHeatmap } from "@/components/motion/demos/heatmap";
import { DemoPalette } from "@/components/motion/demos/palette";
import { DemoQueueSlots } from "@/components/motion/demos/queue-slots";
import { DemoReplyTargets } from "@/components/motion/demos/reply-targets";
import { stagger } from "@/components/motion/stagger";
import { featureNav } from "@/config/nav";
import type { FeatureSlug } from "@/content/feature-slugs";

const pillars: Record<FeatureSlug, string> = {
  "twitter-auto-follow": "Follows the newest followers of accounts in your niche, the people most likely to follow you back.",
  "twitter-post-scheduler": "Queue posts and threads with images. GrowX posts them at your best times.",
  "ai-tweet-writer": "Ideas, rewrites, hooks and threads from GrowX AI, running privately on your computer.",
  "twitter-analytics": "Every post's views, likes and engagement, plus the topics and formats that work for you.",
  "twitter-unfollower-tracker": "New followers and unfollowers, day by day, with follower quality and top fans.",
  "twitter-unfollow-tool": "Find accounts that don't follow back or went quiet. Review, then unfollow at a safe pace.",
  "twitter-reply-targets": "Fresh posts from big accounts in your niche, ranked so you can reply early.",
};

/** Grid placement at md/lg (a 4 x 3 bento at lg) and the decorative demo for each pillar. */
const layout: Record<FeatureSlug, { li: string; demo: ReactNode }> = {
  "twitter-auto-follow": { li: "md:col-span-2 lg:row-span-2", demo: <DemoFollowQueue size="lg" decorative /> },
  "twitter-post-scheduler": { li: "md:col-span-2", demo: <DemoQueueSlots size="md" decorative /> },
  "ai-tweet-writer": { li: "", demo: <DemoAiDraft size="sm" decorative /> },
  "twitter-analytics": { li: "", demo: <DemoHeatmap size="sm" decorative /> },
  "twitter-unfollower-tracker": { li: "", demo: <DemoFollowerDiff size="sm" decorative /> },
  "twitter-unfollow-tool": { li: "", demo: <DemoCleanup size="sm" decorative /> },
  "twitter-reply-targets": { li: "", demo: <DemoReplyTargets size="sm" decorative /> },
};

const tile = "group lift flex h-full flex-col rounded-3xl border p-6";

function LearnMore({ label = "Learn more", tone = "light" }: { label?: string; tone?: "light" | "ink" }) {
  return (
    <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${tone === "ink" ? "text-white" : "text-accent-ink"}`}>
      {label} <IconArrowRight size={15} className="nudge" />
    </span>
  );
}

/**
 * The seven pillars + "And much more" as a bento. Each tile is ONE link (label, sentence, "Learn more"
 * and an aria-hidden demo). Demos in tiles A-D only below 640px.
 */
export function Bento() {
  return (
    <ul data-spotlight-group="" className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {featureNav.map((f, i) => {
        const hero = i === 0;
        const wide = i === 1;
        const l = layout[f.slug];
        const demoCls = hero ? "mt-auto pt-8" : wide ? "mt-6 sm:mt-0" : `mt-auto pt-6 ${i >= 4 ? "hidden sm:block" : ""}`;
        return (
          <li key={f.slug} className={`reveal ${l.li}`} style={stagger(i % 4)}>
            <Link
              href={`/features/${f.slug}`}
              data-spotlight={hero ? "ink" : ""}
              className={`${tile} ${
                hero
                  ? "bg-brand-deep on-ink border-transparent text-white shadow-[var(--shadow-red)] sm:p-8"
                  : "border-hairline bg-white shadow-[var(--shadow-hair)]"
              } ${wide ? "sm:grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:items-center sm:gap-6" : ""}`}
            >
              <div className={`flex flex-col ${wide ? "sm:h-full" : ""}`}>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    hero ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-accent-soft text-accent-ink ring-1 ring-accent/15"
                  }`}
                >
                  <FeatureIcon name={f.icon} size={21} />
                </span>
                <h3 className={`mt-5 font-display font-bold tracking-tight [text-wrap:balance] ${hero ? "text-2xl sm:text-[1.75rem]" : "text-lg"}`}>{f.label}</h3>
                <p className={`mt-2 text-sm leading-relaxed [text-wrap:pretty] ${hero ? "max-w-md text-base text-white" : "text-text-2"}`}>{pillars[f.slug]}</p>
                <LearnMore tone={hero ? "ink" : "light"} />
              </div>
              <div className={demoCls}>{l.demo}</div>
            </Link>
          </li>
        );
      })}
      <li className="reveal" style={stagger(featureNav.length % 4)}>
        <Link href="/features" data-spotlight="ink" className={`${tile} on-ink border-white/10 bg-ink text-white`}>
          <h3 className="font-display text-lg font-bold tracking-tight">And much more</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/75 [text-wrap:pretty]">
            Daily goals and streaks, a workspace per X account, 8 colour themes, dark mode and a command palette.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Kbd tone="ink">Ctrl</Kbd> + <Kbd tone="ink">K</Kbd>
          </p>
          <div className="mt-auto hidden pt-6 sm:block">
            <DemoPalette size="sm" tone="ink" decorative />
          </div>
          <LearnMore label="All features" tone="ink" />
        </Link>
      </li>
    </ul>
  );
}
