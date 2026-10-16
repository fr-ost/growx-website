import type { SupabaseClient } from "@supabase/supabase-js";
import { BASE_X_ACCOUNT_SLOTS } from "@/config/pricing";
import { logDbIssue, toDbIssue } from "@/lib/db/errors";
import { COLUMNS } from "@/lib/db/queries";

/**
 * Permanent X account bindings (see supabase/migrations/*_x_account_bindings.sql and docs/X_ACCOUNTS.md).
 * The database is authoritative for validation, uniqueness and capacity; this module only reads (RLS,
 * user-scoped) and mirrors the normalisation so the UI can show the exact name before confirmation.
 */
export { normalizeXUsername, X_USERNAME_RE, X_USERNAME_TAKEN_MESSAGE } from "./username";

export interface LinkedXAccount {
  username: string;
  normalizedUsername: string;
  linkedAt: string;
}

export interface XAccountSummary {
  linkedXAccounts: LinkedXAccount[];
  baseAccountSlots: number;
  purchasedExtraSlots: number;
  allowedAccountSlots: number;
  usedAccountSlots: number;
  availableAccountSlots: number;
}

export class XAccountsLoadError extends Error {}

/** Pure: counts -> summary. Used slots can exceed allowed after a refunded slot; available never goes below 0. */
export function summarize(bindings: { username: string; normalized_username: string; confirmed_at: string }[], activeGrantSlots: number): XAccountSummary {
  const allowed = BASE_X_ACCOUNT_SLOTS + activeGrantSlots;
  return {
    linkedXAccounts: bindings.map((b) => ({ username: b.username, normalizedUsername: b.normalized_username, linkedAt: b.confirmed_at })),
    baseAccountSlots: BASE_X_ACCOUNT_SLOTS,
    purchasedExtraSlots: activeGrantSlots,
    allowedAccountSlots: allowed,
    usedAccountSlots: bindings.length,
    availableAccountSlots: Math.max(0, allowed - bindings.length),
  };
}

/** Reads the caller's ACTIVE bindings and ACTIVE slot grants through a user-scoped client (RLS). Throws on DB error. */
export async function loadXAccounts(supabase: SupabaseClient, userId: string): Promise<XAccountSummary> {
  const [b, g] = await Promise.all([
    supabase.from("x_account_bindings").select(COLUMNS.x_account_bindings).eq("user_id", userId).eq("status", "active").order("created_at", { ascending: true }),
    supabase.from("account_slot_grants").select(COLUMNS.account_slot_grants).eq("user_id", userId).eq("status", "active"),
  ]);
  if (b.error || g.error) {
    if (b.error) logDbIssue(toDbIssue("x_account_bindings", b.error), b.error);
    if (g.error) logDbIssue(toDbIssue("account_slot_grants", g.error), g.error);
    throw new XAccountsLoadError("x_accounts_unavailable");
  }
  const rows = (b.data ?? []) as unknown as { username: string; normalized_username: string; confirmed_at: string }[];
  const slots = ((g.data ?? []) as unknown as { slots: number }[]).reduce((n, r) => n + Number(r.slots ?? 0), 0);
  return summarize(rows, slots);
}

export type RegisterOutcome =
  | { status: "linked" | "already_linked"; normalizedUsername: string }
  | { status: "taken" | "no_slot" | "invalid_username" | "no_account" | "error" };

/** Calls public.register_x_account (service role). The user id MUST come from a verified session. */
export async function registerXAccount(admin: SupabaseClient, userId: string, username: string): Promise<RegisterOutcome> {
  const { data, error } = await admin.rpc("register_x_account", { p_user: userId, p_username: username });
  if (error) {
    console.error(JSON.stringify({ event: "register_x_account_failed", code: error.code ?? "unknown" }));
    return { status: "error" };
  }
  const r = data as { status?: string; normalized_username?: string } | null;
  if ((r?.status === "linked" || r?.status === "already_linked") && r.normalized_username) return { status: r.status, normalizedUsername: r.normalized_username };
  if (r?.status === "taken" || r?.status === "no_slot" || r?.status === "invalid_username" || r?.status === "no_account") return { status: r.status };
  return { status: "error" };
}
