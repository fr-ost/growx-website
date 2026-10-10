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
  "checkedAt": "2026-10-09T12:05:00.000Z"
}
```
- `plan`: `FREE | TRIAL | PRO_MONTHLY | PRO_YEARLY | PRO_LIFETIME`
- `expiresAt`: `null` for `FREE` and `PRO_LIFETIME`.
- `source`: `none | trial | subscription`.
- `paymentWarning`: `null`, or `{ "type": "past_due", "graceEndsAt": ISO }` while Premium is retained only because of the grace period (default 3 days for card subscriptions; `expiresAt` equals `graceEndsAt` then). After it passes the plan becomes `FREE`.
- `checkedAt` is server time; clients must not use their own clock to decide expiry.

**Errors:** `401 unauthenticated`, `503 unavailable` (database error: *never* treated as Premium; clients should keep a cached value), `503 not_configured`.

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

## Billing endpoints (Phase 3, sandbox-ready; see `BILLING.md`)
| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/billing/options` | public | availability only (card/crypto products, early-adopter state: `unavailable|available|temporarily_unavailable|sold_out`); no keys, ids or counts |
| `POST /api/billing/crypto/checkout` `{product, payCurrency}` | session, same-origin | creates an order + NOWPayments payment, returns address/amount/asset/expiry |
| `GET /api/billing/orders/{id}` | session (own orders only) | status polling; never grants anything |
| `POST /api/webhooks/nowpayments` | `x-nowpayments-sig` | verified IPN only |

Errors never include provider payloads or secrets. These endpoints answer 503 `checkout_unavailable` while the provider is not configured.
