# Billing: Paddle (card) and NOWPayments (crypto)

**Status: implemented for SANDBOX / TEST use only. Live payments are NOT enabled.**
No real provider products, prices, API keys or webhooks exist yet; you create them (below) and put the values into Vercel environment variables. Until a provider is fully configured, its checkout stays unavailable and the pricing buttons say "Coming soon".

What was and was not verified is listed honestly in [`BILLING_TESTING.md`](BILLING_TESTING.md). In short: the code and database logic are covered by automated tests (including real concurrent PostgreSQL connections and the official Paddle SDK signature verifier), but **no end-to-end run against the real Paddle or NOWPayments sandbox has been performed yet** (the build environment could not reach either provider). Run the sandbox checklist below before trusting it.

## Prices (fixed in `src/config/pricing.ts`, never taken from the browser)
| Product id | Plan granted | Price | Notes |
|---|---|---|---|
| `PRO_MONTHLY` | PRO_MONTHLY | $1.99 / month | Paddle: recurring. Crypto: prepaid 30 days, does not renew |
| `PRO_YEARLY` | PRO_YEARLY | $14.99 / year | Paddle: recurring. Crypto: prepaid 365 days, does not renew |
| `PRO_LIFETIME` | PRO_LIFETIME | $29.99 once | never expires |
| `PRO_LIFETIME_EARLY` | PRO_LIFETIME | $0.99 once | first 100 successful purchases, both providers combined; disabled until `EARLY_ADOPTER_ENABLED=true` |

The Paddle price you create must match these numbers; the server validates the **product mapped from the price id** (not an amount supplied by the browser) and the currency. For crypto the server fixes the USD amount and the pay asset when it creates the order and rejects any provider payload that does not match.

## How it works
```
Browser ──POST /api/billing/{paddle|crypto}/checkout {product[,payCurrency]}──▶ server
          (session cookie required, same-origin only, strict zod body: nothing but the product id)
server: verify session user → create_checkout_order() (SQL, atomic) → create Paddle transaction / NOWPayments payment
        with order id in provider metadata → return transaction id / pay address
Provider ──signed webhook / IPN──▶ /api/webhooks/{paddle|nowpayments}
server: verify signature on the RAW body → map event → billing_apply() (one SQL transaction)
        → payments / subscriptions / adjustments / entitlement
Browser return page: only polls GET /api/billing/orders/{id}; it NEVER grants Premium.
```
Key properties:
* **Only verified webhooks (and, for crypto, a verified API re-fetch of the payment) change entitlement.** Redirects, query strings and client state never do.
* `checkout_orders` rows are created only by the server for the signed-in user; the webhook finds the user through the order, never through client data. Customers with no matching order are recorded as `unlinked` and grant nothing.
* `billing_apply()` is idempotent per `(provider, event id)` and atomic: a failure rolls everything back (including the idempotency row) so the provider retries. Deliberate rejections are recorded in `webhook_events.result` and acknowledged.
* Out-of-order protection: a subscription event older than `subscriptions.provider_updated_at` is `stale`; payment statuses are sticky (`succeeded` is never downgraded by a late `pending`/`failed`; `refunded`/`disputed` are final).
* Refunds/chargebacks are applied once per **provider adjustment id** (`payment_adjustments`), even if several events announce the same adjustment.
* RLS is unchanged and enabled; every billing function is executable by `service_role` only. The browser can read only its own `checkout_orders`, `payments`, `subscriptions` (RLS) and cannot write any of them.

### Paddle semantics used
| Paddle event | Effect |
|---|---|
| `transaction.paid` | payment recorded `succeeded`, no fulfilment yet |
| `transaction.completed` | fulfilment for one-time (lifetime) purchases: creates the lifetime subscription (and claims an early-adopter slot) |
| `transaction.payment_failed` | payment `failed` (not conclusive; Paddle retries) |
| `transaction.canceled` | order closed |
| `subscription.created/activated/updated/past_due/canceled/paused/resumed` | authoritative for recurring access: status, period end, cancel-at-period-end. `past_due` starts the 3-day grace window. `trialing` is ignored (no Paddle trials are used) |
| `adjustment.created/updated` | only `approved` refunds/chargebacks act: full refund → payment `refunded` and access revoked; partial refund → recorded, access kept; chargeback → payment `disputed`, access revoked |

### NOWPayments semantics used
| NOWPayments status | Effect |
|---|---|
| `waiting` | pending |
| `confirming`, `confirmed`, `sending` | confirming, **no access yet** |
| `partially_paid` | recorded, **no access**; shown to the user as partial (contact support) |
| `finished` | the only status that fulfils, and only if `actually_paid >= pay_amount`; extends one subscription row per (user, plan) by 30/365 days (stacking on remaining time) or creates lifetime |
| `failed`, `expired` | order closed, reservation released |
| `refunded` | treated as a full refund adjustment |

Crypto is **prepaid** (no automatic wallet debits, no renewals). A monthly/yearly crypto period simply ends; the user buys another period. Grace for crypto is 0 days.

### Early-adopter ($0.99, first 100)
* Inventory = permanent slots (`early_adopter_slots`, primary key 1..100) + unexpired reservations on open early orders (30 min card / 1 h crypto), all under one advisory lock. Verified with 150 simultaneous real connections: exactly 100 reservations; 300 racing deliveries: exactly 100 slots.
* One early order per user. A slot is claimed only when a **verified successful** payment is fulfilled.
* If a paid early order arrives after its reservation expired and no inventory remains, it is **not** granted: the order becomes `refund_required` and you refund it manually in the provider dashboard (see runbook).
* Refunds do **not** free a slot.
* The API/UI exposes only `available | temporarily unavailable | sold out`, never counts or remaining slots. Keep `EARLY_ADOPTER_ENABLED=false` until you have run the early-adopter checks in the sandbox.

## Environment variables
All optional; a provider with missing settings is simply unavailable. Placeholders live in `.env.example`; set real values only in Vercel (Production/Preview), never in git, never in chat.

| Variable | Scope | Purpose |
|---|---|---|
| `PADDLE_ENV` | server | `sandbox` (default) or `production` |
| `PADDLE_API_KEY` | **secret** | server API key (sandbox keys contain `sdbx`) |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | public | Paddle.js client-side token (sandbox: `test_…`) |
| `PADDLE_WEBHOOK_SECRET` | **secret** | notification destination secret key |
| `PADDLE_PRICE_ID_MONTHLY` / `_YEARLY` / `_LIFETIME` / `_EARLY_ADOPTER` | server | `pri_…` ids of prices **you** create |
| `NOWPAYMENTS_ENV` | server | `sandbox` (default) or `production` |
| `NOWPAYMENTS_API_KEY` | **secret** | |
| `NOWPAYMENTS_IPN_SECRET` | **secret** | IPN secret key |
| `NOWPAYMENTS_PAY_CURRENCIES` | server | allowlist of pay asset codes (default `usdttrc20,usdterc20,usdcerc20`); verify the codes in your account |
| `EARLY_ADOPTER_ENABLED` | server | `true` to offer the $0.99 plan |
| `BILLING_LIVE_APPROVED` | server | must be `true` **in addition to** `*_ENV=production` before any live mode works |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | already required |

Safety interlocks (all unit-tested): production mode without `BILLING_LIVE_APPROVED=true` is unavailable; production credentials in sandbox mode (or the reverse) are detected and refuse to start; a missing price id disables only that product. `GET /api/health` lists *names* of missing billing settings (never values). `GET /api/billing/options` is public and reports availability only.

## Paddle sandbox setup (you do this; nothing here was done for you)
1. Create a **sandbox** account at sandbox-vendors.paddle.com.
2. Catalog → Products: create one product ("GrowX Premium") and four **prices** in USD: monthly $1.99 (recurring monthly), yearly $14.99 (recurring yearly), lifetime $29.99 (one-time), early-adopter lifetime $0.99 (one-time). The server maps price id → product through the four env vars, so each price id must be configured exactly once. Copy the four `pri_…` ids into the `PADDLE_PRICE_ID_*` variables.
3. Developer tools → Authentication: create a server API key (→ `PADDLE_API_KEY`) and a client-side token (→ `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`).
4. Developer tools → Notifications: add a destination, type *webhook*, URL `https://<your sandbox/preview or production domain>/api/webhooks/paddle`, and subscribe to: `transaction.paid`, `transaction.completed`, `transaction.payment_failed`, `transaction.canceled`, `subscription.created`, `subscription.activated`, `subscription.updated`, `subscription.past_due`, `subscription.canceled`, `subscription.paused`, `subscription.resumed`, `adjustment.created`, `adjustment.updated`. Copy the destination's secret key into `PADDLE_WEBHOOK_SECRET`.
5. Checkout settings: set the *default payment link* / approved domain to the site domain (Paddle.js overlay requires the domain to be approved). Subscription management emails and the customer portal are handled by Paddle.
6. Set `PADDLE_ENV=sandbox` and redeploy.
7. The Content-Security-Policy in `next.config.ts` allows `cdn.paddle.com`, `*.paddle.com` and the `buy.paddle.com` / `sandbox-buy.paddle.com` frames. **Verify in the browser console during the first sandbox checkout** that nothing is blocked, and tell me if a host must be added.
8. Test cards: use Paddle's sandbox test card numbers from their documentation (never real cards).

## NOWPayments sandbox setup
1. Create a **sandbox** account (sandbox.nowpayments.io) and a store; note the exact pay-currency codes the sandbox supports (→ `NOWPAYMENTS_PAY_CURRENCIES`).
2. Settings → API keys: create an API key (→ `NOWPAYMENTS_API_KEY`).
3. Settings → Payments / IPN: generate the IPN secret (→ `NOWPAYMENTS_IPN_SECRET`). The IPN callback URL is sent with each payment (`https://<domain>/api/webhooks/nowpayments`), so no global URL is needed.
4. Set `NOWPAYMENTS_ENV=sandbox` and redeploy.
5. Verify in the sandbox: payment creation response shape (`pay_address`, `pay_amount`, `pay_currency`, `expiration_estimate_date`), the `x-nowpayments-sig` header, the exact status strings, and `actually_paid` semantics. The mapping is implemented from NOWPayments' public documentation as recalled by the author; **it has not been run against the real sandbox**. Any difference shows up as an `ignored`/`rejected` row in `webhook_events.result` and no access is granted, so a mismatch fails safe.

## Sandbox end-to-end checklist
Run each with a throwaway test account and check `/account`, `/api/entitlement` and the `payments`/`subscriptions`/`webhook_events` tables.
1. Card monthly → subscription active after `subscription.created/activated`; cancel → "ends on <date>"; Paddle simulator: `subscription.past_due` → still Premium for 3 days, then Free.
2. Card lifetime → Premium only after `transaction.completed`; replay the same event from the Paddle dashboard → `duplicate`, no second grant.
3. Refund the lifetime payment in the Paddle dashboard → payment `refunded`, Premium revoked.
4. Crypto monthly: create payment, pay in the sandbox → `confirming` (no access) → `finished` (access for 30 days); underpay → `partially_paid` (no access); let one expire → order `expired`.
5. Early adopter: enable `EARLY_ADOPTER_ENABLED=true` in sandbox only, buy once with each provider, confirm both consume slots from the same pool, a second early purchase by the same user is refused.
6. Webhook rejection: send a request with a wrong/missing signature (e.g. `curl -X POST …/api/webhooks/paddle -d '{}'`) → 401, no database change.

## Operations runbook
* `checkout_orders.status = 'refund_required'`: money moved but access was (correctly) not granted (late early-adopter payment with no inventory, amount/asset/product mismatch, chargeback-blocked renewal). Refund it in the provider dashboard. The resulting refund event closes the payment as `refunded`.
* `webhook_events.result` of `unlinked` / `rejected:*` shows why an event did nothing. Provider-side retries for `5xx` are expected and safe (idempotent).
* A cancelled card subscription keeps access until `current_period_end`; a refund or chargeback revokes immediately (`access_revoked_at`, `revoked_reason`).
* Revoked subscriptions stay revoked even if later subscription events arrive (`revoked_unchanged`). Re-purchase creates a new subscription.

## Before enabling LIVE payments (explicit owner approval required)
Nothing below has been done. Live mode needs *both* `PADDLE_ENV=production` / `NOWPAYMENTS_ENV=production` **and** `BILLING_LIVE_APPROVED=true`.
- [ ] Paddle account verified/approved for live selling; live products & prices created to match the table above; live API key, client token, price ids, webhook destination + secret set in Vercel **Production** only.
- [ ] NOWPayments account approved; live API key + IPN secret; payout wallet and supported assets confirmed; fee/underpayment policy decided.
- [ ] Complete the sandbox checklist above end-to-end with both providers and record the results.
- [ ] Confirm Paddle's real dunning schedule vs. the 3-day grace; confirm CSP hosts from the sandbox console.
- [ ] Decide and publish the refund policy and the meaning of "lifetime"; lawyer review of `/terms`, `/privacy` (Paddle is merchant of record; NOWPayments is not).
- [ ] Add rate limits (Vercel Firewall) on `/api/billing/*` and the webhook paths (provider IPs can be allow-listed).
- [ ] Decide `EARLY_ADOPTER_ENABLED`; confirm that over-cap payments are refunded manually (above).
- [ ] Monitor `webhook_events` for failures during the first live transactions; keep a manual-refund runbook.
- [ ] Apply to production only through the reviewed migration (`20261010050903_billing_core.sql` is already applied, see below).

## Database
`supabase/migrations/20261010050903_billing_core.sql` (applied to production project `growx`, ref `zyzfufifzitjmwxfqbqx` on 2026-10-10 after a rolled-back dry run and your approval; recorded in `supabase_migrations.schema_migrations` as version `20261010050903`). It is additive: new tables `checkout_orders`, `payment_adjustments`; new columns on `payments`, `subscriptions`, `webhook_events`; a widened `payments.status` CHECK; seven service-role-only functions. No existing data was changed (the project had 0 payments / 0 subscriptions).
