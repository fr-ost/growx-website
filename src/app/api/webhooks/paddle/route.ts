import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handlePaddleWebhook } from "@/lib/billing/service";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Paddle Billing webhook. Signature is verified over the EXACT raw body before anything is parsed. */
export async function POST(request: NextRequest) {
  const rawBody = await request.text(); // raw bytes, never re-serialised
  try {
    const r = await handlePaddleWebhook(rawBody, request.headers.get("paddle-signature"), { admin: createAdminClient() });
    return NextResponse.json(r.body, { status: r.status });
  } catch (e) {
    // 500 makes Paddle retry; the DB transaction was rolled back, so nothing is half-applied.
    console.error(JSON.stringify({ event: "paddle_webhook_error", message: e instanceof Error ? e.message.slice(0, 120) : "unknown" }));
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
