# Billing: NOWPayments (crypto)

Paddle was removed (it rejected the product). Payments are **cryptocurrency only, through NOWPayments hosted invoices**, in live mode by default. Nothing has been run against the real NOWPayments service yet (see [`BILLING_TESTING.md`](BILLING_TESTING.md)), so the first purchase should be a small real test that you make yourself.

## Prices (fixed in `src/config/pricing.ts`, never taken from the browser)
| Product id | Plan granted | Price | Notes |
|---|---|---|---|
| `PRO_MONTHLY` | PRO_MONTHLY | $1.99 | prepaid 30 days, does not renew |
| `PRO_YEARLY` | PRO_YEARLY | $14.99 | prepaid 365 days, does not renew |
| `PRO_LIFETIME` | PRO_LIFETIME | $29.99 once | never expires |
| `PRO_LIFETIME_EARLY` | PRO_LIFETIME | $0.99 once | first 100 successful purchases; off until `EARLY_ADOPTER_ENABLED=true` |

## How it works (hosted invoice)
```
/pricing "Pay with crypto" ──▶ /checkout?plan=X   (login required; invoice summary with the server's price)
"Continue to payment" ──POST /api/billing/crypto/checkout {product}──▶ server
          (session cookie, verified email, same-origin, strict body: only the product id)
server: create_checkout_order() (SQL, atomic, no coin) → NOWPayments POST /invoice with the SERVER's USD price,
        order id, IPN URL, success_url=/checkout/{order}, cancel_url=/checkout/{order}?canceled=1
        → browser goes to the NOWPayments invoice page; the customer picks ANY coin enabled in your account
NOWPayments ──IPN──▶ /api/webhooks/nowpayments
server: verify x-nowpayments-sig (HMAC-SHA512 of key-sorted JSON) → re-fetch the payment from the NOWPayments API
        → first verified payment binds the order to that payment id + coin
        → billing_apply() (one SQL transaction, strict amount/coin/reference checks) → payments / subscriptions
/checkout/{order}: only polls GET /api/billing/orders/{id}; it NEVER grants Premium.
```
* **Which coins are offered is controlled in the NOWPayments dashboard** (not in this code). To accept only Ethereum and BNB Smart Chain / BEP20 coins, enable only those coins there and disable the rest (including USDT TRC20).
* Coin minimums: NOWPayments enforces a minimum per coin. If a plan's price is below a coin's minimum, that coin cannot be used for that plan on the invoice page.
* A second payment against the same invoice (e.g. a customer pays twice) is never granted twice: it is recorded as `rejected:order_reference_mismatch` in `webhook_events`; refund it manually.
* Only a `finished` payment with `actually_paid >= pay_amount`, matching the order's amount, asset and product, grants access. `waiting`, `confirming`, `confirmed`, `sending`, `partially_paid`, `failed`, `expired` never do. `refunded` revokes.
* A renewal is a new payment: it extends one subscription row per (user, plan) by 30/365 days, stacking on remaining time.
* `billing_apply()` is idempotent per event, atomic and out-of-order safe; refunds are applied once per adjustment.
* Early adopter: first 100 verified purchases, enforced under one advisory lock (tested with 150 concurrent real connections). Only `available | temporarily unavailable | sold out` is ever shown, never a count. A paid early order with no inventory left is not granted: it becomes `refund_required` and you refund it manually.
* Entitlement has no grace period for crypto (`BILLING_GRACE_DAYS_CRYPTO=0`).

## Environment variables (Vercel → Production)
| Variable | Purpose |
|---|---|
| `NOWPAYMENTS_API_KEY` (**secret**) | NOWPayments API key |
| `NOWPAYMENTS_IPN_SECRET` (**secret**) | IPN secret key |
| `BILLING_LIVE_APPROVED` | set to `true` to take real payments (the on-switch) |
| `NOWPAYMENTS_ENV` | optional; live is the default, `sandbox` only for testing |
| `EARLY_ADOPTER_ENABLED` | `true` to offer the $0.99 plan (leave off until you have verified purchases work) |

Checkout stays "Coming soon" until the key, IPN secret and `BILLING_LIVE_APPROVED=true` are all set. `GET /api/health` lists the *names* of anything missing under `billing.crypto.problems`.

## NOWPayments dashboard setup
1. Create/verify your account at nowpayments.io and set your payout wallet and the coins you accept (enable only Ethereum and BNB Smart Chain / BEP20 coins; disable USDT TRC20 and everything else).
2. **Store settings → API keys**: create an API key.
3. **Store settings → Instant payment notifications (IPN)**: generate the IPN secret key. No global callback URL is required; the site sends `https://www.growxapp.org/api/webhooks/nowpayments` with every payment.
4. Put the three values in Vercel as above, set `BILLING_LIVE_APPROVED=true`, and **redeploy**.

## First live test (by you)
1. Check `/api/health` shows `billing.crypto.available: true`.
2. Log in with a confirmed account, choose the **monthly** plan, pay with the smallest-fee asset.
3. `/account` must show Premium only after NOWPayments marks the payment `finished`. Check `webhook_events.result` (`applied`) and `payments`/`subscriptions` in Supabase.
4. If `result` is `rejected:*` or `ignored`, send me the value; a mismatch with NOWPayments' real payloads fails safe (no access granted).

## Operations runbook
* `checkout_orders.status = 'refund_required'`: money moved but access was (correctly) not granted (late early-adopter payment with no slot, wrong amount/asset, partial payment). Refund manually from NOWPayments; the refund event closes the payment.
* `partially_paid`: the customer must send the remainder to the same address or contact support.
* `webhook_events.result` of `unlinked` / `rejected:*` shows why an event did nothing.

## Database
Schema from `20261010050903_billing_core.sql` (applied to production). It still allows a `paddle` provider value, which is simply unused; no data or schema change was needed to remove Paddle.
