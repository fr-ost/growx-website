import type { ReactNode } from "react";
import { TrialTicks } from "@/components/auth/trial-ticks";
import { IconCheck, IconLock, IconShield, IconZap } from "@/components/icons";
import { Backdrop } from "@/components/motion/backdrop";
import { BorderBeam } from "@/components/motion/border-beam";
import { GrowthLine } from "@/components/motion/growth-line";
import { InkStage } from "@/components/motion/ink-stage";
import { stagger } from "@/components/motion/stagger";
import { Notice } from "@/components/ui/primitives";
import { TRIAL_DAYS } from "@/config/pricing";
import { isSupabaseConfigured } from "@/lib/env";

const perks = [
  { i: IconZap, t: "Auto follow, scheduler, AI writer and analytics" },
  { i: IconCheck, t: `${TRIAL_DAYS}-day Premium trial, no credit card` },
  { i: IconLock, t: "Never asks for your X password" },
  { i: IconShield, t: "Safety limits built into every run" },
];

/**
 * Shared layout for log in, sign up and the password pages.
 * Above the fold, so nothing here ever starts at opacity 0: the h1, subtitle and card settle
 * with translate (+ a short de-blur on the text), and the aside's perks follow the same settle.
 */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <section className="relative flex flex-1 overflow-clip">
      <Backdrop variant="page" beams={0} />
      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="hero-settle font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-[2.75rem]" style={stagger(0)}>
            {title}
          </h1>
          <p className="hero-settle mt-3 leading-relaxed text-text-2" style={stagger(1)}>
            {subtitle}
          </p>
          {/* The card settles by translate only (no blur over form fields). */}
          <div
            className="hero-settle-plain group relative mt-8 rounded-3xl border border-hairline bg-white p-6 shadow-float sm:p-8"
            style={stagger(2)}
          >
            <BorderBeam mode="focus" />
            <div className="relative space-y-5">
              {!isSupabaseConfigured() ? (
                <Notice tone="warn" title="Sign-in is temporarily unavailable">
                  The account service is not configured on this deployment.
                </Notice>
              ) : null}
              {children}
            </div>
          </div>
        </div>
        <InkStage as="aside" aurora grain className="hidden rounded-[2rem] p-10 shadow-stage lg:block">
          <GrowthLine variant="rise" mode="once" className="pointer-events-none absolute -right-4 -top-6 size-44 text-white/10" strokeWidth={5} />
          <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white/70">GrowX</p>
          <h2 className="mt-3 max-w-[22ch] font-display text-3xl font-extrabold leading-tight text-white">
            Everything you need to grow on X, in one Chrome extension.
          </h2>
          <ul className="mt-8 space-y-4">
            {perks.map(({ i: I, t }, idx) => (
              <li key={t} className="hero-settle flex items-center gap-3 text-white" style={stagger(3 + idx)}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <I size={18} />
                </span>
                <span className="font-semibold">{t}</span>
              </li>
            ))}
          </ul>
          <TrialTicks className="mt-10 border-t border-white/10 pt-6" />
        </InkStage>
      </div>
    </section>
  );
}
