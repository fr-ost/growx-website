# API contract

All endpoints return JSON, `Cache-Control: no-store`. Errors: `{ "error": { "code": string, "message": string } }`.

## GET /api/entitlement

Returns the effective plan of the **authenticated caller**. There is no user-id parameter; query-string ids are ignored.

**Auth (one of):**
- `Authorization: Bearer <Supabase access token>` (extension; validated with `auth.getUser(token)` against Supabase Auth, then queried under that user's RLS).
- Website session cookie (browser).

**200**
```json
{
  "plan": "TRIAL",
  "isPremium": true,
  "expiresAt": "2026-10-23T12:00:00.000Z",
  "source": "trial",
  "paymentWarning": null,
  "trial": { "used": true, "active": true, "startedAt": "2026-10-09T12:00:00.000Z", "expiresAt": "2026-10-23T12:00:00.000Z" },
  "checkedAt": "2026-10-09T12:05:00.000Z",
  "linkedXAccounts": [{ "username": "MyMain", "normalizedUsername": "mymain" }],
  "baseAccountSlots": 2,
  "purchasedExtraSlots": 0,
  "allowedAccountSlots": 2,
  "usedAccountSlots": 1,
  "availableAccountSlots": 1
}
```
- `plan`: `FREE | TRIAL | PRO_MONTHLY | PRO_YEARLY | PRO_LIFETIME`
- `expiresAt`: `null` for `FREE` and `PRO_LIFETIME`.
- `source`: `none | trial | subscription`.
- `paymentWarning`: `null`, or `{ "type": "past_due", "graceEndsAt": ISO }` while Premium is retained only because of the grace period (default 3 days for card subscriptions; `expiresAt` equals `graceEndsAt` then). After it passes the plan becomes `FREE`.
- `checkedAt` is server time; clients must not use their own clock to decide expiry.
- X account fields (added; every field above is unchanged). See [`X_ACCOUNTS.md`](X_ACCOUNTS.md).
  - `linkedXAccounts`: the X usernames this GrowX account has **permanently** linked (active bindings, oldest first). `username` keeps the case the user typed (without `@`); `normalizedUsername` is lower case, for comparisons.
  - `allowedAccountSlots = baseAccountSlots (2) + purchasedExtraSlots` (paid, not refunded or charged back), computed on the server.
  - `usedAccountSlots` = number of linked usernames. It can exceed `allowedAccountSlots` after a slot was refunded: nothing is unlinked automatically.
  - `availableAccountSlots = max(0, allowed - used)`.
  - All six are `null` when they could not be read right now (the plan is still returned). Treat `null` as "unknown", never as permission.
  - **Not a proof of identity:** these list usernames the user declared and confirmed. They do not prove which X account is signed in on x.com, and nothing here verifies ownership of the X account.

**Errors:** `401 unauthenticated`, `401 session_revoked` (signed in elsewhere; definitive), `503 session_check_unavailable`, `503 unavailable` (database error: *never* treated as Premium; clients should keep a cached value), `503 not_configured`.

**Rules implemented** (`src/lib/entitlement/resolve.ts`, covered by tests)
- Trial grants Premium only if `status='active'` and `started_at <= now < expires_at`.
- `past_due` grants only for recurring plans with a known `past_due_since`, within the provider's grace window (card 3 days by default, crypto 0). Lifetime is never affected.
- Subscription grants if `status='active'`; monthly/yearly additionally need a future `current_period_end` (missing/invalid fails closed); lifetime needs no end date and never expires.
- `canceled`, `expired`, `refunded`, unknown statuses/plans never grant.
- Highest valid plan wins: lifetime > yearly > monthly > trial.
- No rows (new user, missing profile) => `FREE`.

**CORS:** only exact origins in `ALLOWED_EXTENSION_ORIGINS` (`chrome-extension://<id>`) get `Access-Control-Allow-Origin`; no wildcard, no credentials. `OPTIONS` returns 204 for allowed origins and 403 otherwise.

**Not implemented:** rate limiting (use Vercel Firewall / WAF rules before launch).

## Trial activation (not an HTTP endpoint)
`startTrialAction` is a Next.js Server Action on `/dashboard`. It requires a verified session and a confirmed email, uses the session user id (never form input), and calls `public.start_trial` with the service role. Database constraints guarantee at most one trial per account and one per self-reported X username. It is intentionally **not** exposed to the extension yet.

## Billing endpoints (NOWPayments, live; see `BILLING.md`)
| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/billing/options` | public | availability only (crypto products, early-adopter state: `unavailable|available|temporarily_unavailable|sold_out`); no keys, ids or counts |
| `POST /api/billing/crypto/checkout` `{product}` | session, verified email, same-origin | creates an order + NOWPayments hosted invoice, returns `{orderId, invoiceUrl}`; the customer picks the coin on the invoice page |
| `GET /api/billing/orders/{id}` | session (own orders only) | status polling; never grants anything |
| `POST /api/webhooks/nowpayments` | `x-nowpayments-sig` | verified IPN only |

Errors never include provider payloads or secrets. These endpoints answer 503 `checkout_unavailable` while the provider is not configured.

## X accounts (see `X_ACCOUNTS.md`)
| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/x-accounts` | session cookie or extension Bearer token; active session | the caller's linked usernames, slot counts (same fields as entitlement, plus `linkedAt`) and `extraSlotPrice` |
| `POST /api/x-accounts` `{username, confirm: true}` | same; cookie calls must be same-origin | permanently links one username. `201 {status:"linked"}`, `200 {status:"already_linked"}` (idempotent), `400 confirmation_required`, `400 invalid_username`, `409 x_username_taken` ("This X username is already linked to another GrowX account."), `409 no_slot_available` |
| `PUT` / `PATCH` / `DELETE /api/x-accounts` | any | always `405 x_account_immutable`: there is no self-service change or removal |
| `POST /api/x-accounts/slots/checkout` `{}` | session, verified email, same-origin | one extra slot ($0.99, one-time): server-owned order + NOWPayments hosted invoice, returns `{orderId, invoiceUrl}`. The body must be empty. The slot is added only by a verified IPN |
