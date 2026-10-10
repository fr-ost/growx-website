import { describe, expect, it } from "vitest";
import { resolveEntitlement } from "@/lib/entitlement/resolve";

const NOW = new Date("2026-10-09T12:00:00Z");
const iso = (offsetMs: number) => new Date(NOW.getTime() + offsetMs).toISOString();
const DAY = 86_400_000;

describe("resolveEntitlement", () => {
  it("no records => FREE", () => {
    const e = resolveEntitlement({ trials: [], subscriptions: [] }, NOW);
    expect(e).toMatchObject({ plan: "FREE", isPremium: false, expiresAt: null, source: "none" });
    expect(e.trial.used).toBe(false);
  });

  it("active trial => TRIAL with expiry", () => {
    const e = resolveEntitlement({ trials: [{ status: "active", started_at: iso(-DAY), expires_at: iso(13 * DAY) }], subscriptions: [] }, NOW);
    expect(e).toMatchObject({ plan: "TRIAL", isPremium: true, expiresAt: iso(13 * DAY) });
    expect(e.trial).toMatchObject({ used: true, active: true });
  });

  it("expired trial does not grant Premium but is remembered as used", () => {
    const e = resolveEntitlement({ trials: [{ status: "active", started_at: iso(-15 * DAY), expires_at: iso(-1000) }], subscriptions: [] }, NOW);
    expect(e).toMatchObject({ plan: "FREE", isPremium: false });
    expect(e.trial).toMatchObject({ used: true, active: false });
  });

  it("revoked trial does not grant Premium", () => {
    const e = resolveEntitlement({ trials: [{ status: "revoked", started_at: iso(-DAY), expires_at: iso(DAY) }], subscriptions: [] }, NOW);
    expect(e.isPremium).toBe(false);
  });

  it("trial expiring exactly now is expired", () => {
    const e = resolveEntitlement({ trials: [{ status: "active", started_at: iso(-DAY), expires_at: NOW.toISOString() }], subscriptions: [] }, NOW);
    expect(e.plan).toBe("FREE");
  });

  it("active monthly/yearly subscription grants Premium until period end", () => {
    const m = resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_MONTHLY", status: "active", current_period_end: iso(10 * DAY) }] }, NOW);
    expect(m).toMatchObject({ plan: "PRO_MONTHLY", isPremium: true, expiresAt: iso(10 * DAY), source: "subscription" });
    const y = resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_YEARLY", status: "active", current_period_end: iso(300 * DAY) }] }, NOW);
    expect(y.plan).toBe("PRO_YEARLY");
  });

  it.each(["canceled", "expired", "refunded", "weird"])("status %s never grants Premium", (status) => {
    const e = resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_YEARLY", status, current_period_end: iso(100 * DAY) }] }, NOW);
    expect(e.isPremium).toBe(false);
  });

  it("active subscription past its period end does not grant Premium", () => {
    const e = resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_MONTHLY", status: "active", current_period_end: iso(-1) }] }, NOW);
    expect(e.isPremium).toBe(false);
  });

  it("recurring plan with missing/invalid period end fails closed", () => {
    expect(resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_MONTHLY", status: "active", current_period_end: null }] }, NOW).isPremium).toBe(false);
    expect(resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_MONTHLY", status: "active", current_period_end: "garbage" }] }, NOW).isPremium).toBe(false);
  });

  it("lifetime never expires, regardless of how far in the future we are", () => {
    const sub = [{ plan: "PRO_LIFETIME", status: "active", current_period_end: null }];
    const far = new Date("2099-01-01T00:00:00Z");
    expect(resolveEntitlement({ trials: [], subscriptions: sub }, far)).toMatchObject({ plan: "PRO_LIFETIME", isPremium: true, expiresAt: null });
  });

  it("refunded lifetime does not grant Premium", () => {
    expect(resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_LIFETIME", status: "refunded", current_period_end: null }] }, NOW).isPremium).toBe(false);
  });

  it("unknown plan strings never grant Premium", () => {
    expect(resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_ULTRA", status: "active", current_period_end: null }] }, NOW).isPremium).toBe(false);
  });

  it("highest valid plan wins: lifetime > yearly > monthly > trial", () => {
    const e = resolveEntitlement(
      {
        trials: [{ status: "active", started_at: iso(-DAY), expires_at: iso(13 * DAY) }],
        subscriptions: [
          { plan: "PRO_MONTHLY", status: "active", current_period_end: iso(5 * DAY) },
          { plan: "PRO_LIFETIME", status: "active", current_period_end: null },
          { plan: "PRO_YEARLY", status: "active", current_period_end: iso(50 * DAY) },
        ],
      },
      NOW,
    );
    expect(e.plan).toBe("PRO_LIFETIME");
  });

  it("an expired higher plan does not shadow a valid lower one", () => {
    const e = resolveEntitlement(
      { trials: [{ status: "active", started_at: iso(-DAY), expires_at: iso(13 * DAY) }], subscriptions: [{ plan: "PRO_YEARLY", status: "canceled", current_period_end: iso(100 * DAY) }] },
      NOW,
    );
    expect(e.plan).toBe("TRIAL");
  });

  describe("past_due grace period", () => {
    const sub = (over: Record<string, unknown>) => ({
      plan: "PRO_MONTHLY",
      status: "past_due",
      current_period_end: iso(-DAY),
      provider: "paddle",
      past_due_since: iso(-DAY),
      ...over,
    });

    it("keeps Premium during the 3-day card grace and exposes a warning", () => {
      const e = resolveEntitlement({ trials: [], subscriptions: [sub({})] }, NOW);
      expect(e).toMatchObject({ plan: "PRO_MONTHLY", isPremium: true, expiresAt: iso(2 * DAY) });
      expect(e.paymentWarning).toEqual({ type: "past_due", graceEndsAt: iso(2 * DAY) });
    });

    it("reverts to Free once the grace period has passed", () => {
      const e = resolveEntitlement({ trials: [], subscriptions: [sub({ past_due_since: iso(-3 * DAY - 1) })] }, NOW);
      expect(e).toMatchObject({ plan: "FREE", isPremium: false, paymentWarning: null });
    });

    it("grace is configurable", () => {
      const s = sub({ past_due_since: iso(-2 * DAY) });
      expect(resolveEntitlement({ trials: [], subscriptions: [s] }, NOW, { paddle: 1, nowpayments: 0 }).isPremium).toBe(false);
      expect(resolveEntitlement({ trials: [], subscriptions: [s] }, NOW, { paddle: 7, nowpayments: 0 }).isPremium).toBe(true);
    });

    it("crypto subscriptions get no card-style grace by default", () => {
      const e = resolveEntitlement({ trials: [], subscriptions: [sub({ provider: "nowpayments" })] }, NOW);
      expect(e.isPremium).toBe(false);
    });

    it("fails closed without past_due_since, with an unknown provider, or with grace 0", () => {
      expect(resolveEntitlement({ trials: [], subscriptions: [sub({ past_due_since: null })] }, NOW).isPremium).toBe(false);
      expect(resolveEntitlement({ trials: [], subscriptions: [sub({ provider: undefined })] }, NOW).isPremium).toBe(false);
      expect(resolveEntitlement({ trials: [], subscriptions: [sub({})] }, NOW, { paddle: 0, nowpayments: 0 }).isPremium).toBe(false);
    });

    it("never applies to lifetime, and a verified successful payment (active again) clears the warning", () => {
      expect(resolveEntitlement({ trials: [], subscriptions: [sub({ plan: "PRO_LIFETIME", past_due_since: iso(-DAY) })] }, NOW).isPremium).toBe(false);
      const life = resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_LIFETIME", status: "active", current_period_end: null }] }, NOW);
      expect(life.paymentWarning).toBeNull();
      const restored = resolveEntitlement({ trials: [], subscriptions: [sub({ status: "active", current_period_end: iso(20 * DAY), past_due_since: null })] }, NOW);
      expect(restored).toMatchObject({ plan: "PRO_MONTHLY", paymentWarning: null });
    });
  });
});

describe("refund / chargeback revocation", () => {
  const live = { plan: "PRO_LIFETIME", status: "active", current_period_end: null, provider: "paddle" };
  it("revoked access never grants Premium, for any plan or status", () => {
    const revoked = { access_revoked_at: iso(-1000) };
    expect(resolveEntitlement({ trials: [], subscriptions: [{ ...live, ...revoked }] }, NOW).isPremium).toBe(false);
    expect(resolveEntitlement({ trials: [], subscriptions: [{ plan: "PRO_YEARLY", status: "active", current_period_end: iso(DAY), ...revoked }] }, NOW).isPremium).toBe(false);
  });
  it("a revoked subscription does not hide a valid trial or another valid subscription", () => {
    const e = resolveEntitlement(
      { trials: [], subscriptions: [{ ...live, access_revoked_at: iso(-1) }, { plan: "PRO_MONTHLY", status: "active", current_period_end: iso(5 * DAY) }] },
      NOW,
    );
    expect(e.plan).toBe("PRO_MONTHLY");
  });
});
