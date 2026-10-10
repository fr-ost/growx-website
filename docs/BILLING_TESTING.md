# Billing: what was tested, and what was NOT

## Phase 4 audit (2026-10-10), live production evidence (read-only)
* 12 NOWPayments IPNs reached production, passed HMAC-SHA512 verification and API reconciliation, and were applied (`payment.waiting` -> `applied`); each was recorded once per provider state (duplicates collapse).
* Hosted-invoice orders were bound to the payment the customer created (e.g. coin `usdtbsc`), proving the IPN carries our `order_id`.
* **No payment has reached `finished` in production.** The payment-to-entitlement grant has therefore NOT been observed live; it is covered by database and handler tests only.
* RLS / privileges verified in production: RLS on every table; `authenticated` has SELECT-own only on billing tables, no writes; every billing function is service-role only.
* `subscriptions` contains two active rows with provider `paddle` created by Paddle **sandbox** webhook events (no real money). They grant Premium to one account until removed by the owner.


Results below are from real runs in the build environment on 2026-10-10 (no figures are estimated).

## Executed and passing
| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean |
| `npm test` (Vitest, 13 files) | **212 passed, 0 failed** |
| `npm run test:e2e` (production build + Playwright against a mock Supabase) | **314 passed, 0 failed** (the earlier suite plus a new billing section: unconfigured checkout, endpoint refusals, mocked crypto dialog states, early-adopter offer states) |
| Production build (`next build`, run by the e2e script) | succeeded |
| Production database after applying `20261010050903_billing_core` | 62/62 structural and privilege checks pass (tables, columns, functions, RLS, no anon access, no authenticated writes or billing-function execution); Supabase security advisors show no new findings (only INFO "RLS enabled, no policy" on the service-role-only tables, which is intentional) |

### Coverage against the required test list
| Required test | Where |
|---|---|
| Plan validation and fixed amounts | `billing-providers` (catalog, exact minor units, strict bodies), `billing-routes` |
| Authentication and order association | `billing-routes` (same-origin, session, verified email, session user owns the order), `billing-db` (orders bind to the user; payments never reassigned) |
| Invalid credentials / unconfigured provider | `billing-providers` (config gates, live interlock, sandbox/live mix), `billing-routes`, e2e (503/403/401) |
| NOWPayments signature verification | `billing-providers`: recursive key sort + HMAC-SHA512, tampering, wrong secret, missing header; API reconciliation; disagreement with provider is rejected |
| Duplicate and out-of-order events | `billing-db`, `billing-concurrency` (20 simultaneous deliveries apply once; stale subscription events ignored; sticky payment status) |
| Pending / success / failed / expired / partially paid | `billing-db`, `billing-providers`, e2e UI states (mocked endpoints) |
| Renewals, cancellation, expiry, grace | `billing-db` (card and crypto) + `entitlement` |
| Refund and chargeback | `billing-db` (full, partial, cumulative, duplicate announcements, chargeback blocks restore) |
| Early-adopter limits under concurrency | `billing-concurrency` on a **real PostgreSQL 16** with separate connections: 150 simultaneous checkouts reserve exactly 100; 100 payments + 100 duplicates at once give exactly 100 slots/grants; 5 late payments for 1 slot give 1 grant and 4 `refund_required`; 10 concurrent crypto `finished` events extend the period once |
| Entitlement activation and revocation | `billing-db`, `entitlement` |
| RLS and privileges | `billing-db`, `db`, production check above |

The concurrency suite starts a throwaway local PostgreSQL; it **skips itself** where PostgreSQL is unavailable (it ran here: 5/5).

## NOT done (be explicit before trusting this in production)
1. **No end-to-end test against the real NOWPayments service (live or sandbox).** The build environment could not reach it. The signature algorithm and status/response shapes were implemented from public documentation. A mismatch fails safe (nothing is granted), but make a small real purchase yourself first.
4. No load/performance test beyond the concurrency scenarios above; no penetration test; no rate limiting yet (use Vercel Firewall).
5. RLS/migration tests ran on PGlite and a local PostgreSQL 16, not on a Supabase branch with real JWTs; the production database was verified structurally via catalog queries only (no synthetic payments were written to production).
6. No real transaction of any kind was attempted, and live mode is not enabled.
