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
  iso ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso)) + " (UTC)" : null;

export function PlanSummary({ e }: { e: Entitlement }) {
  return (
    <div className="space-y-4">
      {e.paymentWarning ? (
        <Notice tone="warn" title="Payment problem">
          Your latest payment failed. Premium stays active until {formatDate(e.paymentWarning.graceEndsAt)}. Update your
          payment method to keep it; after that your account returns to Free.
        </Notice>
      ) : null}
      <dl className="grid gap-4 sm:grid-cols-3">
      <div>
        <dt className="text-sm text-muted">Current plan</dt>
        <dd className="mt-1 flex items-center gap-2 text-lg font-semibold">
          {PLAN_LABEL[e.plan]} <Badge tone={e.isPremium ? "accent" : "neutral"}>{e.isPremium ? "Premium" : "Free"}</Badge>
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted">{e.plan === "PRO_LIFETIME" ? "Access" : "Premium until"}</dt>
        <dd className="mt-1 text-lg font-semibold">
          {e.plan === "PRO_LIFETIME" ? "Does not expire" : (formatDate(e.expiresAt) ?? "-")}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-muted">Free trial</dt>
        <dd className="mt-1 text-lg font-semibold">
          {e.trial.active ? "Active" : e.trial.used ? "Used" : "Not started"}
        </dd>
      </div>
      </dl>
    </div>
  );
}
