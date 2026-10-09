# GrowX website

Marketing site, accounts and Premium-readiness backend for the **GrowX** Chrome extension (auto-follow and cleanup tools for X/Twitter).

**Status: foundation phase** (product decisions in [`docs/PRODUCT_REQUIREMENTS.md`](docs/PRODUCT_REQUIREMENTS.md)). Public pages, email/Google auth, protected dashboard/account, database schema with RLS, a 14-day trial action and an entitlement API are implemented. **Payments are not integrated** (no checkout, no webhooks), the extension is **not** connected to this site yet, and nothing has been deployed or configured on Supabase/Vercel by this repo's authors.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth, `@supabase/ssr`) · Vercel.

## Quick start (local)
```bash
npm install
cp .env.example .env.local   # fill in values (see checklist below)
npm run dev                  # http://localhost:3000
```
Without Supabase variables the public pages still work; auth pages show a "not configured" notice and protected routes redirect to `/login`.

Scripts: `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run test:e2e` (builds the app against a local mock Supabase and runs ~100 browser checks with Playwright; needs a Chromium, set `CHROMIUM_PATH` if it is not auto-detected).

## Supabase setup
1. Create a project at supabase.com.
2. **Database:** apply every file in `supabase/migrations/` in order (already applied to production), then run `supabase/verify.sql` (SQL Editor, or `supabase db push` with the Supabase CLI linked to your project).
3. **Auth > Providers > Email:** enable, and turn **Confirm email** ON.
4. **Auth > URL Configuration:** Site URL `https://www.growxapp.org`; Redirect URLs `https://www.growxapp.org/**`, `https://growxapp.org/**`, `http://localhost:3000/**`. For cross-device email links, use the email templates in `docs/GO_LIVE.md`.
5. **Google (optional):** create an OAuth client in Google Cloud, set its redirect URI to the callback URL shown in Supabase > Auth > Providers > Google, enable the provider, then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.
6. Copy **Project URL**, **publishable (anon) key** and **service_role key** (Settings > API) into your env. The service role key is a server secret: never prefix it with `NEXT_PUBLIC_`, never commit it.
7. Review `docs/SECURITY.md` (SMTP, CAPTCHA, password rules) before inviting real users.

## Deploy to Vercel
See [`docs/GO_LIVE.md`](docs/GO_LIVE.md) for the full go-live and verification checklist; `GET /api/health` reports whether Supabase Auth, the service key and the migrations are working.

1. Import the repo into Vercel (framework: Next.js; defaults are fine).
2. Add the environment variables below for Production (and Preview if wanted). Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive.
3. Set `NEXT_PUBLIC_SITE_URL` to the final https URL, update Supabase Site/Redirect URLs, redeploy.
4. Smoke test: sign up, confirm email, log in, save an X username, start a trial, call `/api/entitlement`.

## Configuration checklist
| Variable | Required | Scope | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | public | `https://www.growxapp.org` in production |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | public | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | yes | public | anon/publishable key; the Vercel Supabase integration names work |
| `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) | for trials | **server secret** | trial activation and `/api/health` |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | no | public | `true` only after enabling Google in Supabase |
| `NEXT_PUBLIC_CHROME_STORE_URL` | no | public | defaults to the official listing |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | no | public | shown on /contact |
| `BILLING_GRACE_DAYS_CARD` / `BILLING_GRACE_DAYS_CRYPTO` | no | server | grace after failed recurring payment; defaults 3 / 0 |
| `ALLOWED_EXTENSION_ORIGINS` | later | server | comma-separated `chrome-extension://ofiancichfcakbdgekhcahflpoglfgbh` |
| Paddle / NOWPayments keys | later | server secret | reserved, unused |

## Documentation
- [`docs/SUPABASE_PRODUCTION.md`](docs/SUPABASE_PRODUCTION.md): production errors, root causes, required Supabase/Vercel settings
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): structure and design decisions
- [`docs/API.md`](docs/API.md): API contract (`/api/entitlement`)
- [`docs/PRODUCT_REQUIREMENTS.md`](docs/PRODUCT_REQUIREMENTS.md): owner-approved product decisions
- [`docs/FEATURE_SPLIT.md`](docs/FEATURE_SPLIT.md): extension feature inventory and proposed Free/Premium split
- [`docs/EXTENSION_INTEGRATION.md`](docs/EXTENSION_INTEGRATION.md): how the extension will authenticate and what must change in it
- [`docs/PAYMENTS.md`](docs/PAYMENTS.md): Paddle/NOWPayments design (not implemented)
- [`docs/SECURITY.md`](docs/SECURITY.md): what is in place and what must be reviewed before launch
- [`docs/DECISIONS_NEEDED.md`](docs/DECISIONS_NEEDED.md): business details I need from you

## Known limitations
- Legal pages are unreviewed drafts (owner name and city are filled in; governing law, retention and refund terms are still placeholders).
- Account deletion is manual (deliberate: deleting would also delete trial records and allow repeat trials, and payment records must be retained). No app-level rate limiting yet: use Vercel Firewall (see GO_LIVE.md). A production CSP is set but allows inline scripts (Next.js hydration) (listed in `docs/SECURITY.md`).
- Trial abuse is mitigated, not eliminated (self-reported usernames cannot prove ownership).
- RLS/migration tests run on PGlite, not a real Supabase instance.
- The Free/Premium split is a proposal and is not enforced anywhere.
