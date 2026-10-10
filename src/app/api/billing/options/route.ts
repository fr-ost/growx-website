import { NextResponse } from "next/server";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { getSupabaseServiceKey } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Public. What the pricing UI may offer right now. Exposes availability only:
 * no keys, price ids, counts or remaining-slot numbers.
 */
export async function GET() {
  const crypto = nowPaymentsStatus();
  const providerOn = crypto.available;

  let earlyAdopter: "unavailable" | "available" | "temporarily_unavailable" | "sold_out" = "unavailable";
  const earlyEnabled = process.env.EARLY_ADOPTER_ENABLED === "true";
  if (earlyEnabled && providerOn && getSupabaseServiceKey()) {
    try {
      const { data, error } = await createAdminClient().rpc("early_adopter_state");
      if (!error && (data === "available" || data === "sold_out")) earlyAdopter = data;
      else if (!error && data === "unavailable") earlyAdopter = "temporarily_unavailable";
    } catch {
      earlyAdopter = "unavailable";
    }
  }

  return NextResponse.json(
    {
      crypto: { available: crypto.available, environment: crypto.environment, products: crypto.products, payCurrencies: crypto.payCurrencies, prepaid: true },
      earlyAdopter,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
