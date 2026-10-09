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
  /** 'paddle' (card etc.) or 'nowpayments' (crypto). Optional for backwards compatibility. */
  provider?: string;
  /** When a recurring payment first failed; required for any past_due grace. */
  past_due_since?: string | null;
}

/** Grace days after a failed recurring payment, by provider. 0 = no grace. */
export interface GracePolicy {
  paddle: number;
  nowpayments: number;
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
  /** Set while Premium is retained only because of a payment grace period. */
  paymentWarning: { type: "past_due"; graceEndsAt: string } | null;
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
