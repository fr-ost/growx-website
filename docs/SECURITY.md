# Security notes and pre-launch review list

## Implemented
- Server-side authorisation on protected pages, Server Actions and API (`getUser()`); the proxy is not the only gate.
- RLS on every table, least-privilege grants, no `anon` access, service-role-only writes for billing/trial data.
- Service role key read only in `src/lib/supabase/admin.ts` (`server-only`); never `NEXT_PUBLIC_`.
- Input validation with zod (credentials, X username); open-redirect-safe `next` handling; POST-only sign-out with origin check.
- Explicit CORS allowlist (exact `chrome-extension://` ids, no wildcard, no credentials); `no-store` on API responses.
- Generic auth error messages; no tokens/emails logged by our code.
- Security headers (`X-Frame-Options`, `nosniff`, HSTS, Referrer-Policy, Permissions-Policy).

- Billing: the webhook endpoint verifies NOWPayments (HMAC-SHA512 over key-sorted JSON, constant-time compare, plus an API re-fetch) signatures before any state change; checkout endpoints require a session, same-origin, a strict body of only a product id; prices, plans, entitlement and early-adopter eligibility are server-owned; all billing SQL functions are service-role only; no payment secrets or card/wallet data are stored.

## Must be done before production launch
1. **Test against a real Supabase project**: apply migrations, then verify RLS with two real users using the anon key (PGlite is only an approximation).
2. Supabase Auth settings: enable **Confirm email**; set Site URL and Redirect URLs; set minimum password length/strength and leaked-password protection; configure a real SMTP provider (the built-in mailer is heavily rate limited); enable CAPTCHA (Turnstile/hCaptcha) on sign-up to limit trial farming.
3. **Rate limiting** on `/api/entitlement`, `/login`, `/signup` (Vercel Firewall or an edge limiter). Not implemented.
4. **Content-Security-Policy**: a production CSP is set in `next.config.ts` (`script-src 'self' 'unsafe-inline'`). A nonce-based CSP would be stricter but makes every page dynamic; revisit.
5. Password reset is implemented (`/forgot-password`, `/reset-password`): add `https://www.growxapp.org/**` to Supabase Redirect URLs and use the token-hash email templates in GO_LIVE.md. Email-change handling is not built.
6. Decide account deletion/data export procedure (GDPR/CCPA); privacy policy and terms need legal review.
7. Trial abuse is only mitigated: self-reported usernames and throwaway emails can't be fully prevented. Consider CAPTCHA, disposable-email blocking, or IP/device signals; review privacy implications first.
8. Payments: implemented (see `BILLING.md`): signatures verified on the raw body, idempotent atomic processing, server-owned prices, secrets only in env. Still to do: sandbox end-to-end run, rate limits on `/api/billing/*` and webhook paths, reconcile job for stuck orders, tax/refund policy, live-mode approval.
9. Dependency audit (`npm audit`), Dependabot/Renovate, and secret scanning in CI.
10. Review logging on Vercel/Supabase for personal data; set retention.
11. Review Supabase JWT signing keys (asymmetric keys recommended) and token lifetimes for the extension flow.
12. Independent penetration test before taking payments.
