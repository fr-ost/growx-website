# GrowX website

Marketing site, accounts and Premium-readiness backend for the **GrowX** Chrome extension (auto-follow and cleanup tools for X/Twitter).

**Status: foundation phase.** Public pages, email/Google auth, protected dashboard/account, database schema with RLS, a 14-day trial action and an entitlement API are implemented. **Payments are not integrated** (no checkout, no webhooks), the extension is **not** connected to this site yet, and nothing has been deployed or configured on Supabase/Vercel by this repo's authors.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth, `@supabase/ssr`) · Vercel.

## Quick start (local)
```bash
npm install
cp .env.example .env.local   # fill in values (see checklist below)
npm run dev                  # http://localhost:3000
```
Without Supabase variables the public pages still work; auth pages show a "not configured" notice and protected routes redirect to `/login`.

Scripts: `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`.

## Supabase setup
1. Create a project at supabase.com.
2. **Database:** apply `supabase/migrations/20261009000000_init.sql` (SQL Editor, or `supabase db push` with the Supabase CLI linked to your project).
3. **Auth > Providers > Email:** enable, and turn **Confirm email** ON.
4. **Auth > URL Configuration:** Site URL = your site URL; add Redirect URLs `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`.
5. **Google (optional):** create an OAuth client in Google Cloud, set its redirect URI to the callback URL shown in Supabase > Auth > Providers > Google, enable the provider, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.
6. Copy **Project URL**, **publishable (anon) key** and **service_role key** (Settings > API) into your env. The service role key is a server secret: never prefix it with `NEXT_PUBLIC_`, never commit it.
7. Review `docs/SECURITY.md` (SMTP, CAPTCHA, password rules) before inviting real users.

## Deploy to Vercel
1. Import the repo into Vercel (framework: Next.js; defaults are fine).
2. Add the environment variables below for Production (and Preview if wanted). Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive.
3. Set `NEXT_PUBLIC_SITE_URL` to the final https URL, update Supabase Site/Redirect URLs, redeploy.
4. Smoke test: sign up, confirm email, log in, save an X username, start a trial, call `/api/entitlement`.

## Configuration checklist
| Variable | Required | Scope | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | public | canonical URL, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | public | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | public | anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | for trials | **server secret** | only used by trial activation |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | no | public | `true` only after enabling Google in Supabase |
| `NEXT_PUBLIC_CHROME_STORE_URL` | no | public | enables the "Add to Chrome" button |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | no | public | shown on /contact |
| `ALLOWED_EXTENSION_ORIGINS` | later | server | comma-separated `chrome-extension://<id>` |
| Paddle / NOWPayments keys | later | server secret | reserved, unused |

## Documentation
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): structure and design decisions
- [`docs/API.md`](docs/API.md): API contract (`/api/entitlement`)
- [`docs/FEATURE_SPLIT.md`](docs/FEATURE_SPLIT.md): extension feature inventory and proposed Free/Premium split
- [`docs/EXTENSION_INTEGRATION.md`](docs/EXTENSION_INTEGRATION.md): how the extension will authenticate and what must change in it
- [`docs/PAYMENTS.md`](docs/PAYMENTS.md): Paddle/NOWPayments design (not implemented)
- [`docs/SECURITY.md`](docs/SECURITY.md): what is in place and what must be reviewed before launch
- [`docs/DECISIONS_NEEDED.md`](docs/DECISIONS_NEEDED.md): business details I need from you

## Known limitations
- Legal pages are unreviewed drafts with placeholders.
- No password reset, account deletion, rate limiting or CSP yet (listed in `docs/SECURITY.md`).
- Trial abuse is mitigated, not eliminated (self-reported usernames cannot prove ownership).
- RLS/migration tests run on PGlite, not a real Supabase instance.
- The Free/Premium split is a proposal and is not enforced anywhere.
- The OG image is the 128px logo; a dedicated 1200x630 image is not made yet.
