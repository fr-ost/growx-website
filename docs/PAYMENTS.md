# Payment architecture

> **Paddle was later removed; only NOWPayments is used.** **Phase 3 implemented the sandbox integration described in [`BILLING.md`](BILLING.md)** (NOWPayments crypto only; Paddle was removed, verified webhooks, unified orders/payments/subscriptions). This file is the original design and still states the principles; where it differs, `BILLING.md` wins (e.g. crypto is prepaid with no renewals, and checkout availability comes from provider configuration, not a constant). Live payments are NOT enabled.

A browser redirect must **never** grant Premium.

## Principles
1. Only a **verified webhook** (signature checked against the raw body) changes billing state.
2. Webhook handlers run with the service role, are **idempotent**, and write `payments`, `subscriptions` and `webhook_events` only.
3. The entitlement resolver is provider-neutral: it reads `subscriptions` and `trials`, never provider payloads.
4. The user is identified by an id the server put in provider metadata at checkout creation (from the verified session), never by a client-supplied id; reconcile with the provider customer id.

## Tables (already migrated)
- `subscriptions(provider, provider_customer_id, provider_subscription_id, plan, status, current_period_end, cancel_at_period_end, source_payment_id)`; unique `(provider, provider_subscription_id)`.
- `payments(provider, provider_payment_id, product, amount_minor, currency, status)`; unique `(provider, provider_payment_id)`. `product` includes `PRO_LIFETIME_EARLY` so the cap is counted from `status='succeeded'` rows.
- `webhook_events(provider, event_id unique)`: insert first; unique violation => duplicate => return 200 without side effects.

## Future flow
1. **Checkout creation** (`POST /api/checkout`, authenticated): validate plan against `pricing.ts`, create a Paddle transaction / NOWPayments invoice with `user_id` in metadata, return the hosted checkout URL. Reject `EARLY_ADOPTER_LIFETIME` unless the cap check passes.
2. **Webhook** (`POST /api/webhooks/{provider}`): read raw body; verify signature (Paddle: `Paddle-Signature` HMAC over `ts:body`; NOWPayments: `x-nowpayments-sig` HMAC-SHA512 of the key-sorted JSON); reject on mismatch; insert `webhook_events`; process in one DB transaction; mark `processed_at`.
3. **Return page** only polls `/api/entitlement`; it never grants anything.

## Event handling
| Event | Action |
|---|---|
| Payment succeeded (subscription) | upsert subscription `active`, set `current_period_end` from provider |
| Payment succeeded (lifetime) | insert payment `succeeded`; create `PRO_LIFETIME` subscription (`current_period_end` null) linked via `source_payment_id` |
| Renewal | extend `current_period_end` |
| Payment failed (card) | payment `failed`; subscription `past_due` with `past_due_since = now()` (only if not already past_due). Premium is retained for `BILLING_GRACE_DAYS_CARD` (default 3) days from `past_due_since`, then Free. Paddle's own retry schedule may differ: confirm in the Paddle dashboard and align this value with it. A later verified successful payment sets `active`, clears `past_due_since`, and updates `current_period_end` |
| Renewal failure (crypto) | NOWPayments has no card-style automatic retries. Policy: no grace by default (`BILLING_GRACE_DAYS_CRYPTO=0`); the user keeps Premium until `current_period_end`, a renewal invoice is issued by us, and only a verified `finished` payment extends access. Revisit once the real NOWPayments recurring/invoice behaviour is confirmed |
| Cancellation | set `cancel_at_period_end=true`; access continues until `current_period_end`, then `canceled`/`expired` |
| Expiry | status `expired`; the resolver already denies access when the period end has passed |
| Refund / chargeback | payment `refunded`/`disputed`; subscription `refunded` => no Premium |
| Duplicate / out-of-order events | `webhook_events` unique key + compare provider timestamps before overwriting |
| Crypto underpayment / expiry (NOWPayments) | stay `pending`; grant only on `finished` status with full amount |

## First-100 early-adopter lifetime (database part implemented)
- Table `early_adopter_slots(slot 1..100 primary key, payment_id unique)` and service-role-only function `claim_early_adopter_slot(payment_id)`. It takes an advisory lock, returns the existing slot for a repeated payment (idempotent), returns NULL unless the payment is `product='PRO_LIFETIME_EARLY' and status='succeeded'`, and allocates the lowest free slot or NULL when sold out. The 1..100 primary key makes overselling impossible even under concurrency. Tested.
- `early_adopter_available()` returns a boolean only. The UI never shows a count.
- Future webhook: after a **verified** successful early payment, call `claim_early_adopter_slot`; if it returns a slot create the `PRO_LIFETIME` subscription; if NULL (sold out) apply the over-cap policy below. Pending/failed/canceled/abandoned checkouts never reach this call.
- At checkout creation, call `early_adopter_available()` and fall back to the regular $29.99 lifetime when false. Because several buyers can pass this check at once, the claim at payment confirmation is the real enforcement.
- **Over-cap policy (default, owner may change):** if a paid early purchase cannot get a slot, refund automatically and offer regular pricing; do not grant the early price.
- **Refunds do not free a slot** (the slot stays consumed) so the count of "first 100 purchases" is stable and cannot be gamed.
- `EARLY_ADOPTER_STATUS` in `src/config/pricing.ts` is `planned` until checkout exists; `sold_out` hides the tier.

## Provider notes
- Paddle: merchant-of-record handles tax; requires approval of the business/product. Sandbox first.
- NOWPayments: USDT/USDC first; confirm networks, fees and underpayment handling; refunds are manual.
