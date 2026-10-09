import type { ReactNode } from "react";
import { IconCheck, IconLock, IconShield, IconZap } from "@/components/icons";
import { Notice } from "@/components/ui/primitives";
import { TRIAL_DAYS } from "@/config/pricing";
import { isSupabaseConfigured } from "@/lib/env";

const perks = [
  { i: IconZap, t: "Free core features, forever" },
  { i: IconCheck, t: `${TRIAL_DAYS}-day Premium trial, no card needed` },
  { i: IconLock, t: "Never asks for your X password" },
  { i: IconShield, t: "Safety limits built into every run" },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <section className="relative flex flex-1 overflow-hidden">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
        <div className="animate-fade-up mx-auto w-full max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-text-2">{subtitle}</p>
          <div className="mt-8 space-y-5 rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-lift)] sm:p-8">
            {!isSupabaseConfigured() ? (
              <Notice tone="warn" title="Sign-in is temporarily unavailable">
                The account service is not configured on this deployment.
              </Notice>
            ) : null}
            {children}
          </div>
        </div>
        <aside className="bg-brand relative hidden overflow-hidden rounded-[2rem] p-10 text-white shadow-[0_40px_80px_-40px_rgba(159,18,57,0.8)] lg:block">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
          <div className="glow -right-16 -top-16 h-72 w-72 bg-white/25 animate-drift" aria-hidden="true" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-wider text-white/80">GrowX</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight">Grow your X audience on autopilot, at a human pace.</h2>
            <ul className="mt-8 space-y-4">
              {perks.map(({ i: I, t }, idx) => (
                <li key={t} className="animate-row flex items-center gap-3" style={{ animationDelay: `${200 + idx * 120}ms` }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                    <I size={18} />
                  </span>
                  <span className="font-semibold">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
