# Extension integration contract (planning document)

The extension repository is independent and **was not modified**. This document records what exists today and what a later extension release must do.

## What exists today (GrowX v2.3.0, Manifest V3)
- Service worker `background.js` owns all runs; UI pages (popup, dashboard, options) talk to it with `chrome.runtime.sendMessage({type: ...})` (`start`, `saveSettings`, `unfStart`, ...).
- **Storage:** everything is in `chrome.storage.local` under `gx.*` keys (`gx.settings`, `gx.account` (the *X* account scraped from x.com), `gx.sources`, `gx.pool`, `gx.follows`, `gx.meta`, ...). `unlimitedStorage` granted. No `storage.sync`, no website account.
- **Settings validation:** `GX.normalizeSettings` in `shared/config.js` clamps values; the engine and UI share it. Presets live in `GX.PRESETS`.
- **Network:** only `x.com`, `twitter.com`, `abs.twimg.com` (host_permissions) plus anonymous telemetry to a Cloudflare Worker. `chrome.identity` and `externally_connectable` are **not** present.
- CSP: `script-src 'self'`.

## Required extension changes (future phase)
1. **Manifest:** add `identity` permission (for `launchWebAuthFlow`) and a `host_permissions` entry for the API origin (e.g. `https://<your-domain>/*`). A background `fetch` with host permission does not need CORS; content scripts and extension pages do, which is why `ALLOWED_EXTENSION_ORIGINS` exists.
2. **New module `shared/entitlement.js`:** fetch, cache and expose `{plan, isPremium, expiresAt, checkedAt}`; never persist a claim the user typed.
3. **Gate points** (all in the service worker, not only in the UI):
   - `normalizeSettings` / `saveSettings`: clamp Turbo/X-Premium presets and caps to Balanced limits when not premium.
   - `rejectReason` / harvest: ignore Premium-only filters when not premium.
   - `startUnfollow`: refuse when not premium.
   - UI: show locked state with a link to `/pricing`; never silently discard a user's saved values (preserve + warn).
4. **Never brick Free:** if the API is unreachable, use the last cached entitlement until `expiresAt` (plus a short grace), then fall back to Free behaviour. Free features must work offline from this site.
5. Update the extension's privacy policy and store disclosure (it currently says nothing is sent except anonymous counts).

## Authentication: the website cookie will NOT work in the extension
The website session lives in HttpOnly cookies scoped to the website origin; extension contexts do not share them, and relying on them would also create CSRF-like exposure. `/api/entitlement` therefore accepts `Authorization: Bearer <Supabase access token>`.

Recommended flow (not implemented yet):
1. In the service worker, run `chrome.identity.launchWebAuthFlow` against Supabase Auth (PKCE) using the extension redirect URL `https://<extension-id>.chromiumapp.org/`. Add that URL to Supabase **Auth > URL Configuration > Redirect URLs**. This supports email and Google users uniformly.
2. Store `access_token` + `refresh_token` in `chrome.storage.local` (never in content-script-reachable page storage). Refresh via the Supabase token endpoint when `exp` nears.
3. Call `GET /api/entitlement` with the bearer token from the service worker. Treat 401 as "signed out" (Free), 503 as "unknown" (use cache).
4. Add the extension origin `chrome-extension://<32-char-id>` to `ALLOWED_EXTENSION_ORIGINS` (exact match; no wildcards).

Alternative considered: `externally_connectable` so the website hands a token to the extension. Rejected for now: it widens the extension's attack surface and needs the website origin pinned in the manifest.

## Enforcement honesty
A locally running extension can be patched, so client-side gating is a convenience barrier, not security. What is trustworthy: the server's entitlement decision and anything that needs the server. If stronger protection is needed later, options are short-lived signed entitlement tokens verified in the extension, or moving a Premium capability behind a server call. Neither is built; do not describe the restrictions as tamper-proof.

## Trial linkage
Trials are tied to the website account (verified email + self-reported X username). The extension's `gx.account.handle` is scraped from x.com and could be compared to the self-reported username as a *soft signal only*. It is not proof of ownership; do not use it to grant or block access.
