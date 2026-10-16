import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { X_ACCOUNT_SLOT_PRICE_CENTS, X_ACCOUNT_SLOT_PRICE_LABEL } from "@/config/pricing";
import { requireCaller } from "@/lib/api/caller";
import { apiError, corsHeaders, json } from "@/lib/api/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadXAccounts, registerXAccount, X_USERNAME_TAKEN_MESSAGE, type XAccountSummary } from "@/lib/x-accounts";

export const dynamic = "force-dynamic";

const IMMUTABLE_MESSAGE = "Linked X usernames are permanent and cannot be changed or removed here. Contact support for corrections.";

export function OPTIONS(request: NextRequest) {
  const headers = corsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: Object.keys(headers).length ? 204 : 403, headers });
}

const view = (s: XAccountSummary) => ({
  ...s,
  extraSlotPrice: { amountMinor: X_ACCOUNT_SLOT_PRICE_CENTS, currency: "USD", label: X_ACCOUNT_SLOT_PRICE_LABEL },
});

/**
 * GET /api/x-accounts : the caller's permanently linked X usernames and slot allowance.
 * Website (cookie) or extension (Bearer). Only the caller's own rows are ever readable (RLS).
 */
export async function GET(request: NextRequest) {
  const c = await requireCaller(request);
  if (!c.ok) return c.response;
  try {
    return json(view(await loadXAccounts(c.supabase, c.user.id)), { origin: c.origin });
  } catch {
    return apiError(503, "unavailable", "X accounts could not be loaded. Try again.", c.origin);
  }
}

/**
 * The browser/extension must have shown the user the exact username and the permanence warning and
 * received an explicit confirmation: `confirm: true` is required. Any other field is rejected.
 */
const registerBody = z.object({ username: z.string().max(64), confirm: z.literal(true) }).strict();

/** POST /api/x-accounts { username, confirm: true } : permanently link one X username to the caller's account. */
export async function POST(request: NextRequest) {
  const c = await requireCaller(request, { mutating: true });
  if (!c.ok) return c.response;
  const raw = await request.json().catch(() => null);
  const parsed = registerBody.safeParse(raw);
  if (!parsed.success) {
    const missingConfirm = raw && typeof raw === "object" && (raw as { confirm?: unknown }).confirm !== true;
    return missingConfirm
      ? apiError(400, "confirmation_required", "Confirm that this X username will be permanently linked to your GrowX account.", c.origin)
      : apiError(400, "invalid_request", "Invalid request.", c.origin);
  }

  const r = await registerXAccount(createAdminClient(), c.user.id, parsed.data.username);
  switch (r.status) {
    case "invalid_username":
      return apiError(400, "invalid_username", "Enter a valid X username: 1 to 15 letters, numbers or underscores.", c.origin);
    case "taken":
      return apiError(409, "x_username_taken", X_USERNAME_TAKEN_MESSAGE, c.origin);
    case "no_slot":
      return apiError(409, "no_slot_available", `All your X account slots are in use. Buy an extra slot (${X_ACCOUNT_SLOT_PRICE_LABEL}, one-time) to link another X username.`, c.origin);
    case "no_account":
    case "error":
      return apiError(503, "unavailable", "Could not link the X username. Try again.", c.origin);
  }
  let summary: XAccountSummary | null = null;
  try {
    summary = await loadXAccounts(c.supabase, c.user.id);
  } catch {
    /* linked; the summary is optional in this response */
  }
  return json(
    { status: r.status, normalizedUsername: r.normalizedUsername, ...(summary ? view(summary) : {}) },
    { status: r.status === "linked" ? 201 : 200, origin: c.origin },
  );
}

/** Bindings are permanent: there is no self-service change or removal. */
const immutable = (request: NextRequest) => apiError(405, "x_account_immutable", IMMUTABLE_MESSAGE, request.headers.get("origin"));
export const PUT = immutable;
export const PATCH = immutable;
export const DELETE = immutable;
