import { NextResponse } from "next/server";
import { EARLY_BIRD_LIMIT } from "@/config/pricing";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { getEarlyBird, type EarlyBird } from "@/lib/billing/early-bird";
import { getSupabaseServiceKey } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Public. What the pricing UI may offer right now: availability plus the early-bird counter
 * (real data from the database). No keys, price ids or user information.
 */
export async function GET() {
  const crypto = nowPaymentsStatus();
  let earlyBird: EarlyBird = { state: "off", total: EARLY_BIRD_LIMIT, remaining: null };
  if (crypto.available && getSupabaseServiceKey()) earlyBird = await getEarlyBird(createAdminClient());

  return NextResponse.json(
    {
      crypto: { available: crypto.available, environment: crypto.environment, products: crypto.products, prepaid: true },
      earlyBird,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
