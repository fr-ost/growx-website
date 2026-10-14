# Wiring `session-guard.js` into the GrowX extension

**Status: reference code, tested in the website repo only.** The extension repository was not available to the
session that wrote this (only the pre-connection v2.3.0 zip, which has no website sign-in at all), so none of this has
been applied to or tested in the real extension. Apply it to the current extension source and re-run its checks.

Copy `session-guard.js` to `shared/session-guard.js` (it is a plain ES module; the service worker must be
`"type": "module"` in the manifest, or import it with `importScripts` after wrapping it in an IIFE).

## 1. Create the guard once per service-worker start (`background.js`)

```js
import { createSessionGuard } from "./shared/session-guard.js";

const guard = createSessionGuard({
  apiBase: "https://www.growxapp.org",
  getAccessToken,            // your auth manager: returns a fresh access token, refreshing if needed, or null when signed out.
                             // When the Supabase token endpoint answers 400 refresh_token_not_found / invalid_grant, throw
                             // Object.assign(new Error("refresh rejected"), { definitive: true }).
                             // On network errors throw a plain Error (that is "unavailable", never a verdict).
  clearAuth,                 // remove tokens AND the cached entitlement / Premium state (see section 3)
  stopAllOperations,         // section 2
  pauseOperations,           // section 4
  resumeOperations: async () => { sessionPaused = false; scheduleTick(200); },
  saveNotice: (m) => (m ? chrome.storage.local.set({ "gx.sessionNotice": m }) : chrome.storage.local.remove("gx.sessionNotice")),
  notify: (m) => chrome.notifications.create("gx.session", { type: "basic", iconUrl: "icon128.png", title: "GrowX", message: m }),
  storage: { get: async (k) => (await chrome.storage.local.get(k))[k], set: (k, v) => chrome.storage.local.set({ [k]: v }) },
  scheduleWake: (ms) => chrome.alarms.create("gx.session", { when: Date.now() + Math.max(ms, 30_000) }), // alarms need >= 30 s
});
chrome.alarms.onAlarm.addListener((a) => { if (a.name === "gx.session") guard.validate({ reason: "alarm" }); });
guard.start({ signedIn: !!(await getAccessToken().catch(() => null)) });   // on every worker start
```

* **After a successful sign-in** (the `chrome.identity.launchWebAuthFlow` PKCE flow in `docs/EXTENSION_INTEGRATION.md`),
  store the tokens, then `await guard.onLogin()`. That POSTs `/api/session`, which makes this session the active one and
  revokes the previous extension session. Treat `{ ok: false }` as "not signed in".
* **Sign-out button:** `await guard.logout()`.
* The popup/dashboard read `gx.sessionNotice` and show it (the exact required text is `REVOKED_MESSAGE`) with a "Sign in" button.

## 2. One centralized stop-all (`stopAllOperations`)

The v2.3.0 worker already has `emergencyStop()` (ends the harvest/scan task, stops the unfollow run, stops the autopilot). Build on it:

```js
let sessionPaused = false;
async function stopAllOperations(reason) {
  sessionPaused = true;                       // gate for tick() so nothing restarts while we tear down
  clearTimeout(tickTimer); tickTimer = null;  // pending setTimeout ticks
  chrome.alarms.clear("gx.tick");             // alarm-backed waits
  keepAlive(false);                           // 20 s keep-alive interval
  clearTimeout(badgeTimer);
  try { await emergencyStop(); }              // task + unfollow + autopilot -> stopped, tabs closed, run summaries saved
  finally {
    syncPower(false);                         // release the power lock
    mem.sources = mem.blacklist = mem.follows = mem.fidx = null;  // drop in-memory caches
    refreshBadge();
    sessionPaused = reason === "logout" ? sessionPaused : false;  // revoked/signed out: Free use may be started manually again
  }
}
```

## 3. Clear cached access and Premium state (`clearAuth`)

Remove the access/refresh tokens, the cached `{plan, isPremium, expiresAt, checkedAt}` entitlement, and any
"Premium unlocked" flags kept in memory (`mem.*`) or `chrome.storage`. After this the extension behaves as **Free**;
never keep a Premium grant "until it expires" once the session is revoked. User data (sources, queue, history, settings)
is left untouched.

## 4. Gates (the guard is the only authority)

| Place in v2.3.0 `background.js` | Change |
|---|---|
| `tick()` first line | `if (sessionPaused \|\| guard.state === "paused" \|\| guard.state === "pending") { keepAlive(false); return; }` (unverified: wait, do not stop) |
| `startJob`, `startTask`, `startScan`, `startUnfollow`, `controlJob("resume")`, `unfControl("resume")` | for Premium-gated options: `const g = await guard.assertActive(); if (!g.ok) return { ok:false, error: "Could not verify your GrowX session. Try again in a moment." }`. Free-only runs are not blocked |
| every job/task record created | store `ownerEpoch: guard.epoch()`; in `jobStep/taskStep/unfStep` start: `if (job.ownerEpoch !== guard.epoch() && job.usesPremium) return stopAllOperations("stale_epoch")` |
| async callbacks that can start work (timers, `onMessage` handlers awaiting the network, tab listeners) | capture `const e = guard.epoch()` before the `await`, then `guard.runIfCurrent(e, () => scheduleTick(...))` so a callback that outlives a logout/revocation does nothing |
| `pauseOperations` | `sessionPaused = true` (the gate above), leave job state untouched so `resumeOperations` continues exactly where it stopped |
| entitlement fetch (`shared/entitlement.js`) | after `fetch("/api/entitlement")`: `await guard.reportVerdict(interpretResponse(res.status, body))` |
| popup/dashboard on open | `chrome.runtime.sendMessage({type:"sessionValidate"})` -> `guard.validate()` |

Behaviour to preserve: **a temporary network error never logs the user out and never grants Premium**; it pauses
Premium-gated work, retries with a bounded backoff (5 s, 10 s, 20 s, 40 s, 80 s, then every 15 minutes) and resumes
automatically. Only `401 session_revoked` (or a refresh token the auth server rejected) is a revocation.

## 5. Manifest

Add `"identity"` to `permissions` and `"https://www.growxapp.org/*"` to `host_permissions` (a background `fetch` with a
host permission needs no CORS). If extension pages (not the worker) call `/api/session`, add the extension origin to
`ALLOWED_EXTENSION_ORIGINS` in Vercel.
