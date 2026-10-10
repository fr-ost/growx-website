import { TRIAL_DAYS } from "@/config/pricing";
import { IconInfinity, IconStar } from "@/components/icons";
import { Badge, Notice } from "@/components/ui/primitives";
import type { Entitlement, Plan } from "@/lib/entitlement/types";

export const PLAN_LABEL: Record<Plan, string> = {
  FREE: "Free",
  TRIAL: "Premium trial",
  PRO_MONTHLY: "Premium Monthly",
  PRO_YEARLY: "Premium Yearly",
  PRO_LIFETIME: "Premium Lifetime",
};

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso)) + " UTC" : null;

const DAY = 86_400_000;

export function daysLeft(e: Entitlement): number | null {
  if (!e.expiresAt) return null;
  return Math.max(0, Math.ceil((Date.parse(e.expiresAt) - Date.parse(e.checkedAt)) / DAY));
}

function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--accent-soft)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold leading-none">{value}</span>
        <span className="text-[10px] font-semibold uppercase text-muted">days left</span>
      </div>
    </div>
  );
}

export function PlanSummary({ e }: { e: Entitlement }) {
  const left = daysLeft(e);
  const ringMax = e.plan === "TRIAL" ? TRIAL_DAYS : e.plan === "PRO_YEARLY" ? 365 : e.plan === "PRO_MONTHLY" ? 31 : 14;
  return (
    <div className="space-y-5">
      {e.paymentWarning ? (
        <Notice tone="warn" title="Payment problem">
          Your latest payment failed. Premium stays active until {formatDate(e.paymentWarning.graceEndsAt)}. After that your
          account returns to Free unless the payment succeeds.
        </Notice>
      ) : null}
      <div className="flex flex-wrap items-center gap-6">
        {left !== null ? (
          <Ring value={left} max={Math.max(ringMax, left)} label={`${left} days of Premium left`} />
        ) : e.plan === "PRO_LIFETIME" ? (
          <span className="bg-brand flex h-24 w-24 items-center justify-center rounded-full text-white shadow-[var(--shadow-red)]">
            <IconInfinity size={36} />
          </span>
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2 text-muted ring-1 ring-border">
            <IconStar size={32} />
          </span>
        )}
        <dl className="grid flex-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Current plan</dt>
            <dd className="mt-1.5 flex flex-wrap items-center gap-2 text-lg font-bold">
              {PLAN_LABEL[e.plan]} <Badge tone={e.isPremium ? "solid" : "neutral"}>{e.isPremium ? "Premium" : "Free"}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{e.plan === "PRO_LIFETIME" ? "Access" : "Premium until"}</dt>
            <dd className="mt-1.5 text-base font-bold">{e.plan === "PRO_LIFETIME" ? "Never expires" : (formatDate(e.expiresAt) ?? "-")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Free trial</dt>
            <dd className="mt-1.5 text-base font-bold">{e.trial.active ? "Active" : e.trial.used ? "Used" : "Available"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
