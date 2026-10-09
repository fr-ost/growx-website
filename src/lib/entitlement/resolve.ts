import type { Entitlement, GracePolicy, Plan, SubscriptionRecord, TrialRecord } from "./types";

const DAY_MS = 86_400_000;

/** Default policy: 3 days for card subscriptions (Paddle); none assumed for crypto. */
export const DEFAULT_GRACE: GracePolicy = { paddle: 3, nowpayments: 0 };

/** Higher wins when several entitlements are valid at once. */
const PRIORITY: Record<Plan, number> = {
  FREE: 0,
  TRIAL: 1,
  PRO_MONTHLY: 2,
  PRO_YEARLY: 3,
  PRO_LIFETIME: 4,
};

const ts = (v: string | null | undefined): number | null => {
  if (!v) return null;
  const n = Date.parse(v);
  return Number.isNaN(n) ? null : n;
};

function isTrialActive(t: TrialRecord, now: number): boolean {
  const end = ts(t.expires_at);
  const start = ts(t.started_at);
  return t.status === "active" && end !== null && start !== null && start <= now && end > now;
}

/** Returns the plan a subscription row grants right now, or null. Fails closed. */
function subscriptionGrant(
  s: SubscriptionRecord,
  now: number,
  grace: GracePolicy,
): { plan: Plan; expiresAt: number | null; graceEndsAt?: number } | null {
  if (s.status === "past_due") {
    // Grace applies to recurring plans only (lifetime is never past_due) and
    // only when we know when the failure started. Fails closed otherwise.
    if (s.plan !== "PRO_MONTHLY" && s.plan !== "PRO_YEARLY") return null;
    const days = s.provider === "paddle" ? grace.paddle : s.provider === "nowpayments" ? grace.nowpayments : 0;
    const since = ts(s.past_due_since);
    if (!(days > 0) || since === null) return null;
    const graceEnd = since + days * DAY_MS;
    if (graceEnd <= now) return null;
    return { plan: s.plan, expiresAt: graceEnd, graceEndsAt: graceEnd };
  }
  if (s.status !== "active") return null; // canceled, expired, refunded, unknown => no Premium
  switch (s.plan) {
    case "PRO_LIFETIME":
      return { plan: "PRO_LIFETIME", expiresAt: null };
    case "PRO_MONTHLY":
    case "PRO_YEARLY": {
      const end = ts(s.current_period_end);
      // A recurring plan without a valid, future period end grants nothing.
      if (end === null || end <= now) return null;
      return { plan: s.plan, expiresAt: end };
    }
    default:
      return null; // unknown plan strings never grant access
  }
}

/**
 * Pure, provider-neutral entitlement decision. Inputs must come from trusted
 * server-side reads, never from the browser.
 */
export function resolveEntitlement(
  input: { trials: TrialRecord[]; subscriptions: SubscriptionRecord[] },
  nowDate: Date = new Date(),
  grace: GracePolicy = DEFAULT_GRACE,
): Entitlement {
  const now = nowDate.getTime();

  const latestTrial = [...input.trials].sort((a, b) => (ts(b.started_at) ?? 0) - (ts(a.started_at) ?? 0))[0];
  const activeTrial = input.trials.filter((t) => isTrialActive(t, now)).sort((a, b) => (ts(b.expires_at) ?? 0) - (ts(a.expires_at) ?? 0))[0];

  let plan: Plan = "FREE";
  let expiresAt: number | null = null;
  let source: Entitlement["source"] = "none";
  let graceEndsAt: number | null = null;

  if (activeTrial) {
    plan = "TRIAL";
    expiresAt = ts(activeTrial.expires_at);
    source = "trial";
  }

  for (const s of input.subscriptions) {
    const g = subscriptionGrant(s, now, grace);
    if (!g) continue;
    const better =
      PRIORITY[g.plan] > PRIORITY[plan] ||
      (g.plan === plan && source === "subscription" && expiresAt !== null && (g.expiresAt === null || g.expiresAt > expiresAt));
    if (better) {
      plan = g.plan;
      expiresAt = g.expiresAt;
      source = "subscription";
      graceEndsAt = g.graceEndsAt ?? null;
    }
  }

  return {
    plan,
    isPremium: plan !== "FREE",
    expiresAt: expiresAt === null ? null : new Date(expiresAt).toISOString(),
    source,
    paymentWarning: graceEndsAt === null ? null : { type: "past_due", graceEndsAt: new Date(graceEndsAt).toISOString() },
    trial: {
      used: input.trials.length > 0,
      active: !!activeTrial,
      startedAt: latestTrial ? new Date(ts(latestTrial.started_at) ?? 0).toISOString() : null,
      expiresAt: latestTrial ? new Date(ts(latestTrial.expires_at) ?? 0).toISOString() : null,
    },
    checkedAt: nowDate.toISOString(),
  };
}

export const freeEntitlement = (now: Date = new Date()): Entitlement => resolveEntitlement({ trials: [], subscriptions: [] }, now);
