# Architecture

```
Browser ──> Next.js 16 (Vercel)
              ├─ Public pages (static): /, /features, /pricing, /contact, /privacy, /terms
              ├─ Auth pages: /login, /signup  (Server Actions -> Supabase Auth)
              ├─ Protected pages (dynamic): /dashboard, /account
              ├─ src/proxy.ts  (refreshes Supabase session cookies; redirects signed-out users)
              └─ Route handlers: /api/entitlement, /api/health, /auth/callback (OAuth/PKCE), /auth/confirm (email token links), /auth/signout
Extension (later) ──Bearer token──> /api/entitlement
Next.js server ──> Supabase (Postgres + Auth). Service role key only on the server.
```

## Key decisions
- **Supabase `@supabase/ssr` cookie sessions** for the website. Server code authorises with `auth.getUser()` (validated by the Auth server), not `getSession()`. The proxy uses `getClaims()` only for redirects/refresh; each protected page re-checks with `requireUser()`.
- **No browser Supabase client.** All auth mutations are Server Actions, so the browser never needs the key beyond cookies, and fewer secrets/paths are exposed.
- **RLS is the primary data defence.** Users can `select` their own rows, and write only their own `x_profiles` row (column-restricted; `x_username_normalized` is a generated column). Trials, subscriptions, payments and webhook events are written only by the service role. `anon` has no table privileges.
- **Service role is used in exactly one place:** `startTrialAction` -> `public.start_trial()` (executable only by `service_role`). Entitlement reads use the *user's* token under RLS, so no service role is needed.
- **Trial integrity in the database:** `unique(user_id)` and `unique(x_username_normalized)` on `trials`; time from the DB clock; username snapshot kept on the trial row and in `x_profile_history`, so renames never erase history. `x_profiles` is not unique across users so nobody can squat another person's handle and block their profile; the trial uniqueness is best-effort abuse reduction, not identity proof.
- **Entitlement is a pure function** (`src/lib/entitlement/resolve.ts`) over trial and subscription rows: provider-neutral, fully unit-tested, fails closed.
- **Pricing and features are data** in `src/config/`, used by UI, docs and tests.
- **Public pages are static.** The header has no per-request auth lookup.

## Layout
```
src/app            routes (App Router)
src/components     UI primitives + feature components
src/config         site, pricing, features
src/lib            env, supabase clients, entitlement, trial, validation, api helpers
supabase/migrations  SQL schema + RLS
tests              vitest (unit, API, and real-Postgres migration/RLS tests via PGlite)
docs               this documentation
```

## Testing approach
- Entitlement/trial/validation/API route: vitest with mocks.
- Migration and RLS: the real SQL runs in PGlite with stand-ins for Supabase's `auth` schema and roles. This verifies grants, policies and constraints but is **not** a replacement for testing against a real Supabase project (see SECURITY.md).
