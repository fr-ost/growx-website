/**
 * Every column the app reads, per table. Shared by the app and by the schema
 * test (tests/db.test.ts), which checks each one exists in the migrations and
 * is readable by the `authenticated` role, so query/schema drift fails CI.
 */
export const COLUMNS = {
  trials: "status, started_at, expires_at",
  subscriptions: "plan, status, current_period_end, provider, past_due_since",
  x_profiles: "x_username",
  payments: "id, product, amount_minor, currency, status, created_at",
  profiles: "id",
} as const;

export type AppTable = keyof typeof COLUMNS;
