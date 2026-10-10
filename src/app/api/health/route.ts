import { NextResponse, type NextRequest } from "next/server";
import { isLocalUrl, PRODUCTION_URL, site } from "@/config/site";
import { classifyDbError, type DbErrorKind } from "@/lib/db/errors";
import { COLUMNS } from "@/lib/db/queries";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { getSupabasePublicConfig, getSupabaseServiceKey } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Check = "ok" | "failed" | "not_configured";
type ObjectStatus = "ok" | DbErrorKind;

/** COLUMNS keys that are named queries rather than table names. */
const QUERY_TABLE: Record<string, string> = { subscription_details: "subscriptions" };

/** Tables/columns the app reads, plus tables only the server writes. */
const TABLE_PROBES: Record<string, string> = {
  ...COLUMNS,
  x_profile_history: "id",
  webhook_events: "id",
  early_adopter_slots: "slot",
  checkout_orders: "id",
  payment_adjustments: "id",
};

/**
 * GET /api/health - deployment self-check for the site owner.
 * Reports only object NAMES and pass/fail status: never keys, row data,
 * counts or user information. Probes run with the service role so they test
 * the schema itself (RLS is covered by the migration tests).
 */
export async function GET(request: NextRequest) {
  const cfg = getSupabasePublicConfig();
  const warnings: string[] = [];
  let auth: Check = "not_configured";
  let database: Check = "not_configured";
  const tables: Record<string, ObjectStatus> = {};
  const functions: Record<string, ObjectStatus> = {};

  if (cfg) {
    try {
      const r = await fetch(`${cfg.url}/auth/v1/health`, { headers: { apikey: cfg.key }, signal: AbortSignal.timeout(5000) });
      auth = r.ok ? "ok" : "failed";
    } catch {
      auth = "failed";
    }
  } else {
    warnings.push("Supabase URL or publishable/anon key is not set in this deployment.");
  }

  if (cfg && getSupabaseServiceKey()) {
    try {
      const admin = createAdminClient();
      await Promise.all(
        Object.entries(TABLE_PROBES).map(async ([table, cols]) => {
          const { error } = await admin.from(QUERY_TABLE[table] ?? table).select(cols).limit(0);
          tables[table] = error ? classifyDbError(error) : "ok";
        }),
      );
      // early_adopter_available is read-only. start_trial is called with a
      // random id that has no X username, so it raises before inserting anything.
      const ea = await admin.rpc("early_adopter_available");
      functions.early_adopter_available = ea.error ? classifyDbError(ea.error) : "ok";
      const es = await admin.rpc("early_adopter_state");
      functions.early_adopter_state = es.error ? classifyDbError(es.error) : "ok"; // billing migration present
      const st = await admin.rpc("start_trial", { p_user_id: crypto.randomUUID(), p_days: 14 });
      functions.start_trial = st.error && /x_username_required/.test(st.error.message ?? "") ? "ok" : st.error ? classifyDbError(st.error) : "unknown";
      const allOk = [...Object.values(tables), ...Object.values(functions)].every((s) => s === "ok");
      database = allOk ? "ok" : "failed";
      if (Object.values(tables).includes("table_missing") || Object.values(functions).includes("function_missing")) {
        warnings.push("Migrations are missing in the connected Supabase project: run supabase/migrations/*.sql in order.");
      } else if (Object.values(tables).includes("column_missing")) {
        warnings.push("A newer migration is missing: run the remaining files in supabase/migrations/.");
      }
      if (Object.values(tables).includes("permission_denied")) {
        warnings.push("service_role lacks table privileges: run the latest migration (it grants them).");
      }
    } catch {
      database = "failed";
      warnings.push("The service-role key was rejected or Supabase was unreachable.");
    }
  } else if (cfg) {
    warnings.push("SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) is not set; trials cannot be started.");
  }

  const vercelEnv = process.env.VERCEL_ENV ?? null;
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || null;
  if (vercelEnv === "production") {
    if (rawSiteUrl && isLocalUrl(rawSiteUrl)) warnings.push(`NEXT_PUBLIC_SITE_URL is localhost in production; using ${PRODUCTION_URL} instead. Fix it in Vercel.`);
    if (new URL(site.url).host !== request.nextUrl.host) warnings.push(`Site URL host (${new URL(site.url).host}) differs from this request's host (${request.nextUrl.host}).`);
  }

  const cryptoStatus = nowPaymentsStatus();
  const ok = auth === "ok" && database === "ok";
  return NextResponse.json(
    {
      ok,
      auth,
      database,
      tables,
      functions,
      config: { siteUrl: site.url, vercelEnv, serviceKeyConfigured: !!getSupabaseServiceKey() },
      // Setting NAMES that are missing or invalid, never values. Payments are optional for "ok".
      billing: {
        crypto: { available: cryptoStatus.available, environment: cryptoStatus.environment, problems: cryptoStatus.problems },
        earlyAdopterEnabled: process.env.EARLY_ADOPTER_ENABLED === "true",
      },
      warnings,
      manualChecks: [
        "Supabase Auth > URL Configuration > Site URL must be https://www.growxapp.org (it cannot be read from here).",
        "Supabase Auth > Redirect URLs must include https://www.growxapp.org/**",
      ],
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
