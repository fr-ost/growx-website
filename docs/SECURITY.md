# Security notes and pre-launch review list

## Implemented
- Server-side authorisation on protected pages, Server Actions and API (`getUser()`); the proxy is not the only gate.
- RLS on every table, least-privilege grants, no `anon` access, service-role-only writes for billing/trial data.
- Service role key read only in `src/lib/supabase/admin.ts` (`server-only`); never `NEXT_PUBLIC_`.
- Input validation with zod (credentials, X username); open-redirect-safe `next` handling; POST-only sign-out with origin check.
- Explicit CORS allowlist (exact `chrome-extension://` ids, no wildcard, no credentials); `no-store` on API responses.
- Generic auth error messages; no tokens/emails logged by our code.
- Security headers (`X-Frame-Options`, `nosniff`, HSTS, Referrer-Policy, Permissions-Policy).

## Must be done before production launch
1. **Test against a real Supabase project**: apply migrations, then verify RLS with two real users using the anon key (PGlite is only an approximation).
2. Supabase Auth settings: enable **Confirm email**; set Site URL and Redirect URLs; set minimum password length/strength and leaked-password protection; configure a real SMTP provider (the built-in mailer is heavily rate limited); enable CAPTCHA (Turnstile/hCaptcha) on sign-up to limit trial farming.
3. **Rate limiting** on `/api/entitlement`, `/login`, `/signup` (Vercel Firewall or an edge limiter). Not implemented.
4. **Content-Security-Policy**: not set (Next.js inline scripts need nonces). Add a nonce-based CSP via the proxy and test.
5. Password reset is implemented (`/forgot-password`, `/reset-password`): add `https://www.growxapp.net/auth/callback` to Supabase Redirect URLs and test the email template. Email-change handling is not built.
6. Decide account deletion/data export procedure (GDPR/CCPA); privacy policy and terms need legal review.
7. Trial abuse is only mitigated: self-reported usernames and throwaway emails can't be fully prevented. Consider CAPTCHA, disposable-email blocking, or IP/device signals; review privacy implications first.
8. Payments (future): webhook signature verification, idempotency, replay protection, secrets in Vercel env, reconcile jobs, tax/refund policy.
9. Dependency audit (`npm audit`), Dependabot/Renovate, and secret scanning in CI.
10. Review logging on Vercel/Supabase for personal data; set retention.
11. Review Supabase JWT signing keys (asymmetric keys recommended) and token lifetimes for the extension flow.
12. Independent penetration test before taking payments.
