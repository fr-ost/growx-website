import { describe, expect, it } from "vitest";
import { resolveEntitlement } from "@/lib/entitlement/resolve";
import type { Entitlement, GiftRecord, SubscriptionRecord, TrialRecord } from "@/lib/entitlement/types";

/**
 * The extension's validator for GET /api/entitlement (XFOLLOW shared/plan.js, parseEntitlement), reduced to the
 * rules that reject an answer. An answer it rejects shows "The answer doesn't match the entitlement contract" and
 * Premium is never granted, so every answer the server can produce must pass it.
 */
const EXTENSION_PLANS = ["FREE", "TRIAL", "PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME"];
const isoOrNull = (v: unknown) => (v === null ? null : typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : undefined);
function extensionAccepts(json: Record<string, unknown>): boolean {
  if (!EXTENSION_PLANS.includes(json.plan as string) || typeof json.isPremium !== "boolean") return false;
  if (json.isPremium !== (json.plan !== "FREE")) return false;
  const expiresAt = isoOrNull(json.expiresAt === undefined ? null : json.expiresAt);
  const checkedAt = isoOrNull(json.checkedAt);
  if (expiresAt === undefined || !checkedAt) return false;
  if ((json.plan === "TRIAL" || json.plan === "PRO_MONTHLY" || json.plan === "PRO_YEARLY") && !expiresAt) return false;
  return true;
}
/** The extension falls back to "none" for any other source, which would hide where Premium comes from. */
const EXTENSION_SOURCES = ["none", "trial", "subscription"];

const NOW = new Date("2026-10-18T12:00:00Z");
const DAY = 86_400_000;
const iso = (ms: number) => new Date(NOW.getTime() + ms).toISOString();
const gift = (duration: string, days: number | null, status = "active"): GiftRecord => ({ status, duration, starts_at: iso(-DAY), expires_at: days === null ? null : iso(days * DAY) });
const trial: TrialRecord = { status: "active", started_at: iso(-DAY), expires_at: iso(29 * DAY) };
const monthly: SubscriptionRecord = { plan: "PRO_MONTHLY", status: "active", current_period_end: iso(10 * DAY) };
const lifetime: SubscriptionRecord = { plan: "PRO_LIFETIME", status: "active", current_period_end: null };

const cases: [string, { trials: TrialRecord[]; subscriptions: SubscriptionRecord[]; gifts?: GiftRecord[] }][] = [
  ["nothing", { trials: [], subscriptions: [] }],
  ["trial", { trials: [trial], subscriptions: [] }],
  ["monthly", { trials: [], subscriptions: [monthly] }],
  ["lifetime", { trials: [], subscriptions: [lifetime] }],
  ...(
    [
      ["7d", 7],
      ["30d", 30],
      ["90d", 90],
      ["1y", 365],
      ["lifetime", null],
    ] as const
  ).flatMap(([d, days]): typeof cases => [
    [`gift ${d}`, { trials: [], subscriptions: [], gifts: [gift(d, days)] }],
    [`gift ${d} + trial`, { trials: [trial], subscriptions: [], gifts: [gift(d, days)] }],
    [`gift ${d} + monthly`, { trials: [], subscriptions: [monthly], gifts: [gift(d, days)] }],
    [`gift ${d} + lifetime`, { trials: [], subscriptions: [lifetime], gifts: [gift(d, days)] }],
    [`revoked gift ${d}`, { trials: [], subscriptions: [], gifts: [gift(d, days, "revoked")] }],
  ]),
  ["gift without a stored duration", { trials: [], subscriptions: [], gifts: [{ status: "active", starts_at: iso(-DAY), expires_at: iso(5 * DAY) }] }],
];

describe("entitlement answers match the extension contract", () => {
  it.each(cases)("%s", (_name, input) => {
    const e: Entitlement = resolveEntitlement(input, NOW);
    const json = JSON.parse(JSON.stringify(e)) as Record<string, unknown>;
    expect(extensionAccepts(json)).toBe(true);
    expect(EXTENSION_SOURCES).toContain(e.source);
  });

  it("a gifted user is Premium in the extension's eyes", () => {
    for (const [d, days] of [["7d", 7], ["30d", 30], ["90d", 90], ["1y", 365], ["lifetime", null]] as const) {
      const e = resolveEntitlement({ trials: [], subscriptions: [], gifts: [gift(d, days)] }, NOW);
      expect(e).toMatchObject({ isPremium: true, source: "subscription", gift: { effective: true } });
    }
  });
});
