# Go-live checklist (Vercel + Supabase) - www.growxapp.org

The build environment that produced this code cannot reach your live site or dashboards, so these steps are for you to run. `GET https://www.growxapp.org/api/health` tells you whether the important parts are wired up.

## 1. Vercel
- [ ] **Domains:** add `www.growxapp.org` and `growxapp.org`. Make one primary and let Vercel redirect the other (the app itself does not redirect between hosts, so there is no redirect loop).
- [ ] **Environment variables (Production):**
  - `NEXT_PUBLIC_SITE_URL=https://www.growxapp.org` (**update it if it still says growxapp.net**; it is used for metadata, sitemap and robots).
  - Supabase: the Vercel Supabase integration's variables work as-is (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). The names in `.env.example` (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) also work.
  - Optional: `NEXT_PUBLIC_SUPPORT_EMAIL` (defaults to support@growxapp.org), `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` (after enabling Google in Supabase), `BILLING_GRACE_DAYS_CARD=3`, `BILLING_GRACE_DAYS_CRYPTO=0`.
- [ ] **Redeploy** after changing any `NEXT_PUBLIC_*` variable (they are baked in at build time).

## 2. Supabase
- [ ] **SQL Editor:** run all five files in `supabase/migrations/` in order (all applied on production `zyzfufifzitjmwxfqbqx`, the last one, `billing_core`, on 2026-10-10), then the read-only `supabase/verify.sql` (every row `ok = true`). The Vercel integration does **not** do this for you. Details and troubleshooting: `SUPABASE_PRODUCTION.md`.
- [ ] **Auth > URL Configuration:**
  - Site URL: `https://www.growxapp.org`
  - Redirect URLs: `https://www.growxapp.org/**`, `https://growxapp.org/**`, `http://localhost:3000/**` (plus your `*.vercel.app` preview URL if you test there). Remove any growxapp.net entries.
- [ ] **Auth > Providers > Email:** enabled; **Confirm email ON**.
- [ ] **Auth > Email Templates (recommended):** so confirmation and reset links work even when opened in a different browser or on a phone, change the link in:
  - *Confirm signup*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
  - *Reset password*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
  (The default templates also work, but only in the same browser that requested the email; otherwise users are told their email is confirmed and asked to log in.)
- [ ] **Auth > SMTP:** set up a real provider and send from your domain (e.g. no-reply@growxapp.org) with SPF/DKIM. The built-in mailer sends only a few emails per hour.
- [ ] **Auth > Attack protection:** CAPTCHA and leaked-password protection; minimum password length 8+.
- [ ] (Optional) Google provider, callback URL as shown by Supabase.

## 3. Email
- [ ] Make sure `support@growxapp.org` exists and receives mail (it is shown on the site and in the legal drafts).

## 4. Verify
1. `https://www.growxapp.org/api/health` returns `{"ok":true,"auth":"ok","database":"ok"}`.
   - `auth: "not_configured"`: Supabase URL/key env vars missing; redeploy after adding them.
   - `database: "failed"`: the `tables` / `functions` entries name what is missing (migrations not run, wrong project, or a bad service-role key).
2. Sign up with a real email, open the confirmation link, log in.
3. Dashboard: save your X username, start the trial; the plan card shows "Premium trial" with 14 days left. Pressing start again (or using the same username on a second account) is refused.
4. `https://www.growxapp.org/api/entitlement` in the same browser returns `"plan":"TRIAL"`; in a private window it returns 401.
5. Forgot password: request a reset link, follow it, set a new password.
6. Supabase Table Editor shows rows in `profiles`, `x_profiles`, `x_profile_history`, `trials`.

## 5. Before charging money
- Vercel Firewall rate limits for `/api/*`, `/login`, `/signup`, `/forgot-password`.
- Legal review of `/privacy` and `/terms`.
- Payments: NOWPayments (crypto) only; follow `BILLING.md` for the dashboard setup and the first live test.
- Extension update (see `EXTENSION_INTEGRATION.md`).
