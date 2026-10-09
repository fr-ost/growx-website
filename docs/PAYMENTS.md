# Payment architecture (design only: nothing is integrated)

No checkout, webhook or payment endpoint exists. `CHECKOUT_AVAILABLE=false` in `src/config/pricing.ts`; paid buttons are disabled. A browser redirect must **never** grant Premium.

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
| Payment failed | payment `failed`; subscription `past_due` (no Premium; a grace period is a business decision) |
| Cancellation | set `cancel_at_period_end=true`; access continues until `current_period_end`, then `canceled`/`expired` |
| Expiry | status `expired`; the resolver already denies access when the period end has passed |
| Refund / chargeback | payment `refunded`/`disputed`; subscription `refunded` => no Premium |
| Duplicate / out-of-order events | `webhook_events` unique key + compare provider timestamps before overwriting |
| Crypto underpayment / expiry (NOWPayments) | stay `pending`; grant only on `finished` status with full amount |

## First-100 early-adopter lifetime
Enforce in a single SQL function (service role) that, under an advisory lock, counts `payments` with `product='PRO_LIFETIME_EARLY' and status='succeeded'` and refuses when >= 100; call it both at checkout creation and when a webhook confirms payment (a refunded purchase frees a slot only if you decide so). No frontend counter, countdown or "slots left" UI exists or should be added until this is built. Because payment may complete after the 100th slot is taken by someone else, decide the over-cap policy (refund vs. honour) up front.

## Provider notes
- Paddle: merchant-of-record handles tax; requires approval of the business/product. Sandbox first.
- NOWPayments: USDT/USDC first; confirm networks, fees and underpayment handling; refunds are manual.
