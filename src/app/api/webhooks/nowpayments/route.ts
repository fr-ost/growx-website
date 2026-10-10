import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getNowPayment } from "@/lib/billing/nowpayments";
import { handleNowPaymentsIpn } from "@/lib/billing/service";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** NOWPayments IPN. HMAC-SHA512 verified, then reconciled against the provider API, then applied idempotently. */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  try {
    const r = await handleNowPaymentsIpn(rawBody, request.headers.get("x-nowpayments-sig"), {
      admin: createAdminClient(),
      fetchPayment: (id) => getNowPayment(id),
    });
    return NextResponse.json(r.body, { status: r.status });
  } catch (e) {
    console.error(JSON.stringify({ event: "nowpayments_ipn_error", message: e instanceof Error ? e.message.slice(0, 120) : "unknown" }));
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
