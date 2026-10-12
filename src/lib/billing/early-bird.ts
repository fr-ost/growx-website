import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EARLY_BIRD_LIMIT } from "@/config/pricing";

export type EarlyBirdState = "available" | "temporarily_unavailable" | "sold_out" | "off";

export interface EarlyBird {
  state: EarlyBirdState;
  total: number;
  /** Spots not yet claimed by a verified purchase; null when it could not be read. Reservations of unpaid checkouts are not counted. */
  remaining: number | null;
}

/** The early-bird price is on by default; EARLY_ADOPTER_ENABLED=false switches it off. */
export const earlyBirdEnabled = (env: Record<string, string | undefined> = process.env) => env.EARLY_ADOPTER_ENABLED !== "false";

/**
 * Early-bird availability, read from the database (the only source of truth: slots are claimed only
 * by verified successful payments). Any failure reports "off" so the regular price applies.
 */
export async function getEarlyBird(admin: SupabaseClient, env: Record<string, string | undefined> = process.env): Promise<EarlyBird> {
  const off: EarlyBird = { state: "off", total: EARLY_BIRD_LIMIT, remaining: null };
  if (!earlyBirdEnabled(env)) return off;
  try {
    const [st, slots] = await Promise.all([
      admin.rpc("early_adopter_state"),
      admin.from("early_adopter_slots").select("slot", { count: "exact", head: true }),
    ]);
    if (st.error) return off;
    const claimed = slots.error || typeof slots.count !== "number" ? null : slots.count;
    const remaining = claimed === null ? null : Math.max(0, EARLY_BIRD_LIMIT - claimed);
    if (st.data === "sold_out" || remaining === 0) return { state: "sold_out", total: EARLY_BIRD_LIMIT, remaining: 0 };
    if (st.data === "available") return { state: "available", total: EARLY_BIRD_LIMIT, remaining };
    if (st.data === "unavailable") return { state: "temporarily_unavailable", total: EARLY_BIRD_LIMIT, remaining };
    return off;
  } catch {
    return off;
  }
}
