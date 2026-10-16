import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EARLY_BIRD_LIMIT } from "@/config/pricing";

export type EarlyBirdState = "available" | "temporarily_unavailable" | "sold_out" | "off";

export interface EarlyBird {
  state: EarlyBirdState;
  /** Size of the early-bird campaign (the allocation, 100 initially). Remaining is shown against this. */
  total: number;
  /** Spots not yet claimed by a verified purchase; null when it could not be read. Reservations of unpaid checkouts are not counted. */
  remaining: number | null;
}

/** Emergency kill switch on the server: EARLY_ADOPTER_ENABLED=false forces the regular price whatever the admin setting says. */
export const earlyBirdEnabled = (env: Record<string, string | undefined> = process.env) => env.EARLY_ADOPTER_ENABLED !== "false";

export interface EarlyBirdStatus {
  state: "available" | "unavailable" | "sold_out" | "off";
  enabled: boolean;
  sold: number;
  open_reservations: number;
  sales_cap: number;
  campaign_allocation: number;
  remaining: number;
  updated_at: string;
}

/** Raw status from the database (public.early_bird_status). Throws on error. */
export async function readEarlyBirdStatus(admin: SupabaseClient): Promise<EarlyBirdStatus> {
  const { data, error } = await admin.rpc("early_bird_status");
  if (error || !data) throw new Error(`early_bird_status failed: ${error?.code ?? "no_data"}`);
  return data as EarlyBirdStatus;
}

/**
 * Early-bird availability, read from the database: the admin settings (enabled, remaining spots) and the successful
 * sales recorded in early_adopter_slots are the only source of truth. Any failure reports "off" so the regular
 * price applies; nothing here is ever invented.
 */
export async function getEarlyBird(admin: SupabaseClient, env: Record<string, string | undefined> = process.env): Promise<EarlyBird> {
  const off: EarlyBird = { state: "off", total: EARLY_BIRD_LIMIT, remaining: null };
  if (!earlyBirdEnabled(env)) return off;
  try {
    const s = await readEarlyBirdStatus(admin);
    const total = s.campaign_allocation;
    if (s.state === "off" || !s.enabled) return { state: "off", total, remaining: null };
    if (s.state === "sold_out" || s.remaining <= 0) return { state: "sold_out", total, remaining: 0 };
    if (s.state === "available") return { state: "available", total, remaining: s.remaining };
    if (s.state === "unavailable") return { state: "temporarily_unavailable", total, remaining: s.remaining };
    return off;
  } catch {
    return off;
  }
}
