export const PLANS = ["FREE", "TRIAL", "PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME"] as const;
export type Plan = (typeof PLANS)[number];

export interface TrialRecord {
  status: string;
  started_at: string;
  expires_at: string;
}

export interface SubscriptionRecord {
  plan: string;
  status: string;
  current_period_end: string | null;
}

export interface Entitlement {
  /** Effective plan right now. */
  plan: Plan;
  /** True only when `plan` grants Premium features. */
  isPremium: boolean;
  /** ISO timestamp when Premium access ends; null for FREE and PRO_LIFETIME. */
  expiresAt: string | null;
  /** Where the effective plan came from. */
  source: "none" | "trial" | "subscription";
  trial: {
    /** An account can start only one trial, ever. */
    used: boolean;
    active: boolean;
    startedAt: string | null;
    expiresAt: string | null;
  };
  /** Server time used for the decision. Clients must not use their own clock. */
  checkedAt: string;
}
