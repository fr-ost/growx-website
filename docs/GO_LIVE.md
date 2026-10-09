# Go-live checklist (Vercel + Supabase)

Work through these in order. Nothing here was verified against your live project by the code authors (the build environment cannot reach it); the `/api/health` endpoint lets you verify the key parts yourself.

## 1. Supabase
- [ ] Apply **both** migrations in `supabase/migrations/` in order (SQL Editor, or `supabase db push`).
- [ ] Auth > Providers > Email: enabled, **Confirm email ON**.
- [ ] Auth > URL Configuration: Site URL `https://www.growxapp.net`; Redirect URLs: `https://www.growxapp.net/auth/callback`, `http://localhost:3000/auth/callback`.
- [ ] Auth > SMTP: configure a real provider (the default mailer allows only a few emails per hour, so sign-ups will fail to receive mail under load). Set sender `support@growxapp.net` or a no-reply on your domain, and add SPF/DKIM DNS records.
- [ ] Auth > Attack protection: enable CAPTCHA (Turnstile/hCaptcha) and leaked-password protection; set minimum password length 8+.
- [ ] (Optional) Google provider, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.

## 2. Vercel environment variables (Production)
`NEXT_PUBLIC_SITE_URL=https://www.growxapp.net`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (sensitive), `BILLING_GRACE_DAYS_CARD=3`, `BILLING_GRACE_DAYS_CRYPTO=0`. `NEXT_PUBLIC_*` values are inlined at build time, so **redeploy** after changing them.

## 3. Domain
- [ ] Vercel > Domains: `www.growxapp.net` is the primary; the bare `growxapp.net` redirects to it (the app also redirects it).
- [ ] HTTPS certificate issued.

## 4. Verify (replace the domain)
1. `https://www.growxapp.net/api/health` must return `{"ok":true,"auth":"ok","database":"ok"}`. `database: failed` usually means a migration is missing or the service-role key is wrong.
2. Sign up with a real email, click the confirmation link, log in.
3. Dashboard: save an X username, start the 14-day trial; the plan should show "Premium trial" with an expiry 14 days out. Try starting again: it must be refused.
4. `/api/entitlement` in the same browser returns `plan: "TRIAL"`. In a private window it returns 401.
5. A second account using the same X username must be refused a trial.
6. Forgot password: request a reset, follow the link, set a new password.
7. In Supabase Table Editor confirm rows appeared in `profiles`, `x_profiles`, `x_profile_history`, `trials`.
8. Share a link and check the preview (Open Graph image `/opengraph-image`).

## 5. Still needed before charging money
- Vercel Firewall rate-limit rules for `/api/*`, `/login`, `/signup`, `/forgot-password` (suggested: 20 requests/minute/IP on `/api/entitlement`, 10/minute on auth pages).
- Legal review of `/privacy` and `/terms`.
- Paddle / NOWPayments integration, verified webhooks, and end-to-end tests (not built; see `PAYMENTS.md`).
- Extension update (see `EXTENSION_INTEGRATION.md`).
- Remaining items in `SECURITY.md`.
