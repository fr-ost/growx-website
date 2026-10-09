import type { SupabaseClient } from "@supabase/supabase-js";
import { TRIAL_DAYS } from "@/config/pricing";

export type StartTrialResult =
  | { ok: true; startedAt: string; expiresAt: string }
  | { ok: false; reason: "email_not_verified" | "x_username_required" | "already_used" | "username_already_used" | "error" };

interface PgError {
  code?: string;
  message?: string;
}

/**
 * Starts the one-time trial for an authenticated user.
 *
 * `userId` MUST come from a verified session, never from request input.
 * `admin` must be a service-role client: `public.start_trial` is executable
 * only by service_role. Uniqueness (one trial per account and per self-reported
 * X username) is enforced by database constraints, so concurrent or repeated
 * calls cannot create a second trial.
 */
export async function startTrial(
  admin: SupabaseClient,
  user: { id: string; emailConfirmed: boolean },
): Promise<StartTrialResult> {
  if (!user.emailConfirmed) return { ok: false, reason: "email_not_verified" };

  const { data, error } = await admin.rpc("start_trial", { p_user_id: user.id, p_days: TRIAL_DAYS });
  if (error) return { ok: false, reason: mapError(error as PgError) };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.started_at || !row?.expires_at) return { ok: false, reason: "error" };
  return { ok: true, startedAt: row.started_at, expiresAt: row.expires_at };
}

function mapError(e: PgError): Exclude<StartTrialResult, { ok: true }>["reason"] {
  if (e.code === "23505") {
    return e.message?.includes("trials_x_username_key") ? "username_already_used" : "already_used";
  }
  if (e.message?.includes("x_username_required")) return "x_username_required";
  return "error";
}
