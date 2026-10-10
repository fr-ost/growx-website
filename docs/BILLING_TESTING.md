# Billing: what was tested, and what was NOT

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
| Paddle signature verification | `billing-providers`: official SDK verifier on the exact raw body; wrong secret, tampered body (even whitespace), stale timestamp, malformed header; handler returns 401 with no DB call |
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
1. **No end-to-end test against the real Paddle sandbox or the real NOWPayments sandbox.** The build environment could not reach either provider's API or documentation. Paddle signature verification uses the official SDK against locally generated signatures; the NOWPayments signature algorithm and status/response shapes were implemented from public documentation and have never been exercised against the real service. Treat the sandbox checklist in `BILLING.md` as mandatory.
2. The Paddle.js overlay was not rendered; the CSP hosts for Paddle (`cdn.paddle.com`, `*.paddle.com`, `buy.paddle.com`, `sandbox-buy.paddle.com`) are from documentation and must be confirmed in a browser during the first sandbox checkout.
3. The card UI path (`Pay by card` → overlay) is covered only for availability/unconfigured states, not a real overlay session.
4. No load/performance test beyond the concurrency scenarios above; no penetration test; no rate limiting yet (use Vercel Firewall).
5. RLS/migration tests ran on PGlite and a local PostgreSQL 16, not on a Supabase branch with real JWTs; the production database was verified structurally via catalog queries only (no synthetic payments were written to production).
6. No real transaction of any kind was attempted, and live mode is not enabled.
