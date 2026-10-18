import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readEarlyBirdStatus, type EarlyBirdStatus } from "@/lib/billing/early-bird";
import { getBillable, isBillableId } from "@/lib/billing/catalog";
import { INVOICE_STATUSES, invoiceNumber } from "@/lib/invoices";

/** Admin-only reads (service role). Callers MUST have checked isAdmin() for the verified session user first. */

export { GIFT_DURATIONS, type GiftDuration } from "./durations";
import type { GiftDuration } from "./durations";

export interface GiftRow {
  id: string;
  userId: string;
  recipient: string | null;
  duration: GiftDuration;
  status: "active" | "expired" | "revoked";
  startsAt: string;
  expiresAt: string | null;
  reason: string | null;
  grantedBy: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
  createdAt: string;
}

export interface AuditRow {
  id: number;
  action: string;
  admin: string | null;
  recipient: string | null;
  duration: string | null;
  prevExpiresAt: string | null;
  newExpiresAt: string | null;
  reason: string | null;
  createdAt: string;
}

async function emailsFor(admin: SupabaseClient, ids: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x))];
  if (!unique.length) return new Map();
  const { data } = await admin.from("profiles").select("id, email").in("id", unique);
  return new Map(((data ?? []) as { id: string; email: string | null }[]).map((r) => [r.id, r.email ?? r.id]));
}

export async function loadGifts(admin: SupabaseClient, now = Date.now()): Promise<{ gifts: GiftRow[]; audit: AuditRow[] }> {
  const [g, e] = await Promise.all([
    admin.from("premium_gifts").select("id, user_id, granted_by, duration, starts_at, expires_at, status, reason, revoked_at, revoked_by, revoke_reason, created_at").order("created_at", { ascending: false }).limit(200),
    admin.from("premium_gift_events").select("id, user_id, admin_id, action, duration, prev_expires_at, new_expires_at, reason, created_at").order("id", { ascending: false }).limit(100),
  ]);
  if (g.error || e.error) throw new Error(`gift read failed: ${(g.error ?? e.error)?.code ?? "unknown"}`);
  type G = { id: string; user_id: string; granted_by: string; duration: GiftDuration; starts_at: string; expires_at: string | null; status: string; reason: string | null; revoked_at: string | null; revoked_by: string | null; revoke_reason: string | null; created_at: string };
  type E = { id: number; user_id: string; admin_id: string; action: string; duration: string | null; prev_expires_at: string | null; new_expires_at: string | null; reason: string | null; created_at: string };
  const gifts = (g.data ?? []) as G[];
  const events = (e.data ?? []) as E[];
  const emails = await emailsFor(admin, [...gifts.flatMap((x) => [x.user_id, x.granted_by, x.revoked_by]), ...events.flatMap((x) => [x.user_id, x.admin_id])]);
  return {
    gifts: gifts.map((x) => ({
      id: x.id,
      userId: x.user_id,
      recipient: emails.get(x.user_id) ?? null,
      duration: x.duration,
      status: x.status === "revoked" ? "revoked" : x.expires_at && Date.parse(x.expires_at) <= now ? "expired" : "active",
      startsAt: x.starts_at,
      expiresAt: x.expires_at,
      reason: x.reason,
      grantedBy: emails.get(x.granted_by) ?? x.granted_by,
      revokedAt: x.revoked_at,
      revokedBy: x.revoked_by ? (emails.get(x.revoked_by) ?? x.revoked_by) : null,
      revokeReason: x.revoke_reason,
      createdAt: x.created_at,
    })),
    audit: events.map((x) => ({
      id: x.id,
      action: x.action,
      admin: emails.get(x.admin_id) ?? x.admin_id,
      recipient: emails.get(x.user_id) ?? x.user_id,
      duration: x.duration,
      prevExpiresAt: x.prev_expires_at,
      newExpiresAt: x.new_expires_at,
      reason: x.reason,
      createdAt: x.created_at,
    })),
  };
}

export interface EarlyBirdEventRow {
  id: number;
  action: string;
  admin: string | null;
  soldAtChange: number;
  prevEnabled: boolean | null;
  newEnabled: boolean | null;
  prevRemaining: number | null;
  newRemaining: number | null;
  prevAllocation: number | null;
  newAllocation: number | null;
  reason: string | null;
  createdAt: string;
}
export interface EarlyBirdSale {
  slot: number;
  claimedAt: string;
  buyer: string | null;
  amountMinor: number | null;
  paymentStatus: string | null;
}

export async function loadEarlyBirdAdmin(admin: SupabaseClient): Promise<{ status: EarlyBirdStatus; events: EarlyBirdEventRow[]; sales: EarlyBirdSale[] }> {
  const [status, ev, slots] = await Promise.all([
    readEarlyBirdStatus(admin),
    admin.from("early_bird_events").select("id, admin_id, action, sold_at_change, prev_enabled, new_enabled, prev_remaining, new_remaining, prev_allocation, new_allocation, reason, created_at").order("id", { ascending: false }).limit(50),
    admin.from("early_adopter_slots").select("slot, payment_id, claimed_at").order("claimed_at", { ascending: false }).limit(25),
  ]);
  if (ev.error || slots.error) throw new Error(`early bird read failed: ${(ev.error ?? slots.error)?.code ?? "unknown"}`);
  type V = { id: number; admin_id: string; action: string; sold_at_change: number; prev_enabled: boolean | null; new_enabled: boolean | null; prev_remaining: number | null; new_remaining: number | null; prev_allocation: number | null; new_allocation: number | null; reason: string | null; created_at: string };
  type S = { slot: number; payment_id: string; claimed_at: string };
  const events = (ev.data ?? []) as V[];
  const sl = (slots.data ?? []) as S[];
  const pays = sl.length
    ? (((await admin.from("payments").select("id, user_id, amount_minor, status").in("id", sl.map((s) => s.payment_id))).data ?? []) as { id: string; user_id: string; amount_minor: number; status: string }[])
    : [];
  const payById = new Map(pays.map((p) => [p.id, p]));
  const emails = await emailsFor(admin, [...events.map((x) => x.admin_id), ...pays.map((p) => p.user_id)]);
  return {
    status,
    events: events.map((x) => ({
      id: x.id,
      action: x.action,
      admin: emails.get(x.admin_id) ?? x.admin_id,
      soldAtChange: x.sold_at_change,
      prevEnabled: x.prev_enabled,
      newEnabled: x.new_enabled,
      prevRemaining: x.prev_remaining,
      newRemaining: x.new_remaining,
      prevAllocation: x.prev_allocation,
      newAllocation: x.new_allocation,
      reason: x.reason,
      createdAt: x.created_at,
    })),
    sales: sl.map((s) => {
      const p = payById.get(s.payment_id);
      return { slot: s.slot, claimedAt: s.claimed_at, buyer: p ? (emails.get(p.user_id) ?? null) : null, amountMinor: p?.amount_minor ?? null, paymentStatus: p?.status ?? null };
    }),
  };
}

export interface InvoiceListRow {
  paymentId: string;
  number: string;
  customer: string | null;
  product: string;
  amountMinor: number;
  refundedMinor: number;
  currency: string;
  status: string;
  createdAt: string;
}

/** All confirmed payments (newest first) as invoices, for the admin invoice history. */
export async function loadInvoices(admin: SupabaseClient, limit = 100): Promise<InvoiceListRow[]> {
  const { data, error } = await admin.from("payments").select("id, user_id, product, amount_minor, refunded_minor, currency, status, created_at").in("status", [...INVOICE_STATUSES]).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(`invoice read failed: ${error.code ?? "unknown"}`);
  const rows = (data ?? []) as { id: string; user_id: string; product: string; amount_minor: number; refunded_minor: number; currency: string; status: string; created_at: string }[];
  const emails = await emailsFor(admin, rows.map((r) => r.user_id));
  return rows.map((r) => ({
    paymentId: r.id,
    number: invoiceNumber(r.id, r.created_at),
    customer: emails.get(r.user_id) ?? null,
    product: isBillableId(r.product) ? getBillable(r.product).name : r.product,
    amountMinor: Number(r.amount_minor),
    refundedMinor: Number(r.refunded_minor ?? 0),
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
  }));
}
