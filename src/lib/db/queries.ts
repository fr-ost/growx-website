/**
 * Every column the app reads, per table. Shared by the app and by the schema
 * test (tests/db.test.ts), which checks each one exists in the migrations and
 * is readable by the `authenticated` role, so query/schema drift fails CI.
 */
export const COLUMNS = {
  trials: "status, started_at, expires_at",
  subscriptions: "plan, status, current_period_end, provider, past_due_since, access_revoked_at",
  x_profiles: "x_username",
  payments: "id, provider, product, amount_minor, currency, status, refunded_minor, created_at",
  /** Account page: subscription details. */
  subscription_details: "id, provider, plan, status, current_period_end, cancel_at_period_end, past_due_since, access_revoked_at, revoked_reason, created_at",
  checkout_orders: "id, provider, product, status, reservation_expires_at, created_at",
  profiles: "id",
} as const;

export type AppTable = keyof typeof COLUMNS;
