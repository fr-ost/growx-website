# One active login per account

Each GrowX account has **one active website session and one active extension session**. A newer login of the
same kind revokes the older one. `SINGLE_SESSION_SCOPE=account` makes it strictly one session across everything.

> **Product decision to confirm.** The request was "one active session at a time". Taken literally (strict mode) a
> login on the website would also log the extension out, so buying Premium on the site would force a re-login in the
> extension every time. The default therefore keeps one session **per kind** (web / extension), which still prevents
> sharing Premium across extension installs. Set `SINGLE_SESSION_SCOPE=account` in Vercel for the literal behaviour.

## What was verified about Supabase (production project, read-only)
* Supabase stores each login as a row in `auth.sessions` (id = the `session_id` claim of the access token). Deleting that
  row cascades to `auth.refresh_tokens` (`ON DELETE CASCADE`), so a revoked session can never refresh itself.
* An already-issued **access token stays a valid JWT until it expires (about 1 hour)**. Deleting the session does not
  make it unverifiable by signature, so we do **not** rely on it: every protected request also compares the token's
  `session_id` with the recorded active session and checks that the session still exists.
* Several accounts already had several live sessions (Supabase's own "single session per user" setting is off, and is a
  paid-plan feature), so the rule is enforced in our database.
* `service_role` cannot read `auth.sessions`; the `postgres` role can. Hence `SECURITY DEFINER` functions.

## How it works
Table `public.active_sessions (user_id, slot, session_id, activated_at)` (RLS on, no policies: API roles cannot touch it).
Three service-role-only functions (`supabase/migrations/*_active_sessions.sql`):

| Function | Purpose |
|---|---|
| `register_active_session(user, session, client, strict)` | under a per-user advisory lock: the session must exist in `auth.sessions`; it becomes the slot's active session; the previous session of that slot is **deleted from `auth.sessions`** (strict: all other sessions of that user). Returns `session_not_found` for a session that no longer exists, so a revoked session can never register again |
| `check_active_session(user, session, client, strict)` | `active` / `revoked`. A user with no recorded session yet (logged in before the rollout) lets the first live session that checks claim the slot; after that only a login replaces it |
| `release_active_session(user, session)` | explicit logout: forgets the row and deletes that session (and its refresh tokens) |

Registration happens exactly when a login succeeds:
* website: password login, sign-up without email confirmation, email-link (`/auth/confirm`), PKCE/OAuth (`/auth/callback`). If registration fails the login is rolled back (signed out).
* extension: `POST /api/session` right after its own sign-in.

Enforcement on every protected operation (cookie **and** bearer): `getAuthState()` (pages, server actions, billing APIs) and
`/api/entitlement`, `/api/session`. Answers: **401 `session_revoked`** (definitive), **503 `session_check_unavailable`** (could not
verify: never treated as valid or revoked), 401 `unauthenticated` (no/invalid token).

Other behaviour: explicit website logout is now `scope: local` (it used to be global and would have killed the extension session).
Concurrent logins are serialised by the lock: exactly one session survives (tested with 20 simultaneous logins on a real PostgreSQL).
Subscriptions, payments, trials and gifts are never read or written by any of this.

## Deployment order
**Do not merge to `main` (deploy) before step 1: the new login code calls the new database functions and logins would fail without them.**
1. **Apply the migration** (done 2026-10-16, via the SQL Editor; verified) (additive; nothing changes for users until the code ships). Verify with `supabase/verify.sql` and `/api/health` (`active_sessions`, `check_active_session` = ok).
2. **Deploy the website.** Existing logins keep working (first live session per account claims its slot).
3. **Release the extension** that registers after login, validates periodically, and stops everything on revocation (`extension-reference/INTEGRATION.md`).
   Until then, an old extension build that already calls `/api/entitlement` is still checked server-side (a revoked session gets `401 session_revoked`, and the first live session claims the slot), but it cannot stop itself cleanly and does not register its own logins.
4. (Optional) Set `SINGLE_SESSION_SCOPE=account`.

## Manual verification after deployment (do not call this secure before these pass)
1. Log in to the website in browser A; log in with the same account in browser B. Reload A: it must land on the login page with the "signed in on another device" message, and B must keep working.
2. With the extension build: sign in on machine 1, sign in on machine 2. Machine 1's extension must stop its run within about a minute (or at its next Premium action), show the message, and drop to Free. Machine 2 keeps working.
3. Copy machine 1's old access token before the second login; after it, `curl -H "Authorization: Bearer <old>" https://www.growxapp.org/api/entitlement` must answer `401 session_revoked`.
4. Turn off the network on the extension: Premium-gated work pauses, nothing is cleared, it resumes when the network returns.
5. Supabase SQL editor: `select count(*) from auth.sessions where user_id = '<id>'` is 2 at most (one web + one extension).
