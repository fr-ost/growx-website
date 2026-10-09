/**
 * Classifies Supabase/PostgREST errors into a small set of actionable kinds,
 * and logs them WITHOUT user data (no emails, ids, tokens or row values).
 */
export type DbErrorKind =
  | "table_missing" // migration not applied (or wrong Supabase project)
  | "column_missing" // a later migration not applied
  | "function_missing" // RPC not created (migration not applied)
  | "permission_denied" // grants / RLS / key problem
  | "auth" // session token rejected by the database
  | "unreachable" // network / Supabase down / wrong URL
  | "unknown";

export interface DbIssue {
  kind: DbErrorKind;
  /** Postgres / PostgREST code, e.g. PGRST205, 42703. */
  code: string | null;
  /** Which logical query failed, e.g. "trials". Never user data. */
  source: string;
}

interface PgLikeError {
  code?: string | null;
  message?: string | null;
}

export function classifyDbError(error: PgLikeError | null | undefined): DbErrorKind {
  if (!error) return "unknown";
  const code = String(error.code ?? "");
  const msg = String(error.message ?? "");
  if (code === "PGRST205" || code === "42P01" || /could not find the table/i.test(msg)) return "table_missing";
  if (code === "42703" || code === "PGRST204" || /column .* does not exist/i.test(msg)) return "column_missing";
  if (code === "PGRST202" || code === "42883" || /could not find the function/i.test(msg)) return "function_missing";
  if (code === "42501" || /permission denied/i.test(msg)) return "permission_denied";
  if (code.startsWith("PGRST3") || /jwt/i.test(msg)) return "auth";
  if (/fetch failed|network|ECONNREFUSED|ENOTFOUND|timeout/i.test(msg)) return "unreachable";
  return "unknown";
}

export function toDbIssue(source: string, error: PgLikeError | null | undefined): DbIssue {
  return { kind: classifyDbError(error), code: error?.code ? String(error.code) : null, source };
}

/** Server log line for Vercel logs. Message is truncated and never includes details/hints (which can echo row values). */
export function logDbIssue(issue: DbIssue, error?: PgLikeError | null) {
  const message = String(error?.message ?? "").slice(0, 160);
  console.error(JSON.stringify({ event: "db_query_failed", source: issue.source, kind: issue.kind, code: issue.code, message }));
}

export const DB_ISSUE_HELP: Record<DbErrorKind, string> = {
  table_missing: "A database table is missing. The Supabase migrations have not been applied to this project.",
  column_missing: "A database column is missing. A newer Supabase migration has not been applied.",
  function_missing: "A database function is missing. The Supabase migrations have not been fully applied.",
  permission_denied: "The database refused access. Table grants or policies are not set up as expected.",
  auth: "Your session was not accepted by the database. Signing out and in again usually fixes this.",
  unreachable: "The database could not be reached. Please try again shortly.",
  unknown: "An unexpected database error occurred.",
};
