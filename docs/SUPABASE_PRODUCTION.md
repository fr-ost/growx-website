# Supabase production stabilization (Phase 2, Part 2)

This explains the three production errors, what the code now does about them, and the dashboard settings that only you can change. Nothing here was verified against the live project (no credentials are available to the code authors); use `/api/health` and `supabase/verify.sql` to confirm.

## Root causes

### 1. Verification and password-reset emails contain localhost URLs
- The app sends `emailRedirectTo` / `redirectTo` = `<request origin>/auth/callback?...`. On Vercel the request origin is `https://www.growxapp.org`, so the code does not produce localhost on its own.
- **Supabase Auth only uses that redirect if it matches its Redirect URLs allowlist. Otherwise it silently falls back to the project's Site URL.** A new Supabase project (including one created by the Vercel integration) starts with Site URL `http://localhost:3000` and an empty allowlist, which produces exactly the localhost links you see.
- Any template that uses `{{ .SiteURL }}` (as recommended in `GO_LIVE.md`) also renders localhost until Site URL is changed.
- Code hardening added: in a Vercel production deployment the app never builds a localhost redirect, and ignores a localhost `NEXT_PUBLIC_SITE_URL` (`src/lib/origin.ts`, `src/config/site.ts`). `/api/health` warns if `NEXT_PUBLIC_SITE_URL` is localhost in production.
- **Fix (manual):** Supabase > Authentication > URL Configuration (see below).

### 2. Dashboard: "We couldn't load all of your account data"
- Code path: the banner appeared when the `trials` or `subscriptions` query failed (inside `loadEntitlement`) **or** the `x_profiles` query failed. The underlying database error was discarded and never logged, so the cause was invisible.
- Most likely cause: the connected Supabase project does not have the migrations applied (`PGRST205` "Could not find the table"). If only the first migration was applied, the `subscriptions` query fails instead with `42703` (missing `past_due_since`). If tables exist but grants are missing, the error is `42501`. The Vercel Supabase integration creates a **new** project, so migrations run in a different project would not help.

### 3. Account: "Could not load your plan" / "Could not load payments"
- "Could not load your plan" = the same `loadEntitlement` failure as #2 (trials/subscriptions).
- "Could not load payments" = the `payments` query failed: same class of cause (table missing / no grants).
- Three different tables failing at the same time points to missing migrations (or the wrong project), not to separate bugs.

## What changed in code
- `src/lib/db/errors.ts`: classifies Supabase errors (`table_missing`, `column_missing`, `function_missing`, `permission_denied`, `auth`, `unreachable`) and logs them to Vercel logs as JSON (`event: db_query_failed`) **without** user data (no emails, ids, tokens, details/hints).
- Dashboard and Account load each section independently. A failure shows which query failed and why (e.g. `trials/table_missing (PGRST205)`), the plan is never guessed, and optional data (payments, username) failing no longer hides the plan.
- Empty states unchanged and verified: no subscription → real **Free** plan; no payments → "No payments yet".
- `/api/health` now probes every table/column the app uses and both RPC functions, and reports which are missing (names only, no data).
- Saving an X username repairs a missing profile row for **the caller only** (`ensure_my_profile()`), for accounts created before the signup trigger existed.
- Trial activation reports a reference code when the database or service key is the problem.
- `src/lib/db/queries.ts` is the single list of columns the app reads; a test checks every one exists in the migrations and is readable by `authenticated`.

## Migrations
Run in the Supabase SQL Editor of the project Vercel is connected to, **in order**. None of them deletes data.

| File | Purpose | Notes |
|---|---|---|
| `20261009000000_init.sql` | tables, RLS, trial function, signup trigger | **Not re-runnable** (creates triggers/policies). Run once. |
| `20261009000100_billing_grace_and_early_adopter.sql` | `past_due_since`, early-adopter slots | Run once, after the first. |
| `20261010000000_production_hardening.sql` | **new**: profile backfill, explicit grants, `ensure_my_profile()` | Idempotent; safe to re-run. |

Then run `supabase/verify.sql` (read-only). Every row must show `ok = true`. If a file errors with "already exists", that migration was applied before: skip it and continue with the next.

## Manual Supabase Dashboard changes
1. **Authentication > URL Configuration**
   - Site URL: `https://www.growxapp.org`
   - Redirect URLs: `https://www.growxapp.org/**`, `https://growxapp.org/**`, `http://localhost:3000/**` (local development). Remove `growxapp.net` and other stale entries.
2. **Authentication > Email Templates** (recommended, works across devices):
   - Confirm signup: link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   - Reset password: link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
   - Or keep the default `{{ .ConfirmationURL }}` templates: they work once step 1 is done, but only in the browser that requested the email.
3. **Authentication > Providers > Email**: Confirm email ON.
4. **Authentication > SMTP**: configure a real sender (the built-in mailer allows only a few emails per hour and may be rejected by inboxes).
5. **SQL Editor**: the migrations above, then `verify.sql`.
6. Confirm this is the **same project** as Vercel's `NEXT_PUBLIC_SUPABASE_URL` (Project Settings > API > Project URL).

## Manual Vercel changes
- `NEXT_PUBLIC_SITE_URL=https://www.growxapp.org` for Production (not localhost, not growxapp.net).
- Supabase variables present for Production: URL, anon/publishable key, `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`).
- Redeploy after changing any `NEXT_PUBLIC_*` variable.

## How to verify after the changes
1. `https://www.growxapp.org/api/health` → `"ok": true`, every entry in `tables` and `functions` is `"ok"`, `warnings` is empty.
2. Sign up with a new address: the email link must start with your Supabase URL and contain `redirect_to=https://www.growxapp.org/...` (default template) or start with `https://www.growxapp.org/auth/confirm` (custom template). Never localhost.
3. Log in: dashboard shows **Free** and no red banner; Account shows "No payments yet".
4. Save X username, start trial: plan becomes "Premium trial", 14 days. Starting again is refused.
5. Forgot password → link → new password → dashboard.
6. If anything fails, the red message shows a reference such as `trials/table_missing (PGRST205)`; Vercel > Logs shows the matching `db_query_failed` line.
