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
  /** Entitlement: admin-granted gifts (recipient-readable columns only; never the reason or the admin). */
  premium_gifts: "status, duration, starts_at, expires_at",
  /** X Accounts: active permanent bindings and purchased slots (account page, /api/x-accounts, /api/entitlement). */
  x_account_bindings: "username, normalized_username, confirmed_at, created_at",
  account_slot_grants: "slots, status, created_at",
  /** Account page: slot purchase history. */
  slot_grant_history: "id, order_id, status, revoked_reason, created_at",
} as const;

export type AppTable = keyof typeof COLUMNS;
