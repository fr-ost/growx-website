// GrowX Chrome extension: single-active-login guard (reference implementation).
//
// Plain ES module, no chrome.* globals: everything environment-specific is injected, so the same file is
// unit-tested in the website repository and dropped into the extension (e.g. shared/session-guard.js).
// See extension-reference/INTEGRATION.md for where each hook plugs into background.js.
//
// Server contract (website, /api/session, Authorization: Bearer <Supabase access token>):
//   POST   register this session as the active one (call right after a successful sign-in)
//   GET    200 {active:true} | 401 {error:{code:"session_revoked"}} DEFINITIVE | 401 unauthenticated | 503 unknown
//   DELETE explicit logout
// Only `401 session_revoked` proves the session was replaced. Network errors, timeouts and 5xx never do.

export const REVOKED_MESSAGE =
  "You've been logged out because your GrowX account was signed in on another device. Please sign in again to continue.";
export const SIGNED_OUT_MESSAGE = "You've been signed out of GrowX. Please sign in again to continue.";

/** @typedef {'signed_out'|'pending'|'active'|'paused'|'revoked'} GuardState */

/**
 * Maps an API answer to a verdict.
 * @returns {'active'|'revoked'|'unauthenticated'|'unavailable'}
 */
export function interpretResponse(status, body) {
  if (status >= 200 && status < 300) return "active";
  const code = body && body.error && body.error.code;
  if (status === 401 && code === "session_revoked") return "revoked";
  if (status === 401) return "unauthenticated";
  return "unavailable"; // 403/404/429/5xx/anything else: unknown, never a verdict
}

/**
 * @param {object} deps
 * @param {string} deps.apiBase                       e.g. "https://www.growxapp.org"
 * @param {() => Promise<string|null>} deps.getAccessToken  current access token (refreshing if needed); null = signed out.
 *        May throw; set `err.definitive = true` when the auth server REJECTED the refresh token (it no longer exists).
 * @param {() => Promise<void>} deps.clearAuth        remove tokens AND cached entitlement / Premium state
 * @param {(reason: string) => Promise<void>} deps.stopAllOperations   cancel timers, queues, retries, running automation
 * @param {(reason: string) => Promise<void>} [deps.pauseOperations]   pause protected work (kept resumable), e.g. network trouble
 * @param {() => Promise<void>} [deps.resumeOperations]
 * @param {(message: string|null) => Promise<void>} [deps.saveNotice]  persist the message shown to the user (null clears it)
 * @param {(message: string) => void} [deps.notify]                    e.g. chrome.notifications
 * @param {{get:(k:string)=>Promise<any>, set:(k:string,v:any)=>Promise<void>}} [deps.storage]  survives service-worker restarts
 * @param {(ms:number) => void} [deps.scheduleWake]   mirror the next check into chrome.alarms (service workers are killed)
 */
export function createSessionGuard(deps) {
  const {
    apiBase,
    getAccessToken,
    clearAuth,
    stopAllOperations,
    pauseOperations = async () => {},
    resumeOperations = async () => {},
    saveNotice = async () => {},
    notify = () => {},
    storage = null,
    scheduleWake = () => {},
    fetchFn = (...a) => fetch(...a),
    setTimer = (fn, ms) => setTimeout(fn, ms),
    clearTimer = (t) => clearTimeout(t),
    now = () => Date.now(),
    checkEveryMs = 60_000,
    freshMs = 15_000,
    requestTimeoutMs = 10_000,
    retry = { baseMs: 5_000, maxMs: 120_000, maxAttempts: 6 },
    slowEveryMs = 15 * 60_000,
  } = deps;

  /** @type {GuardState} */
  let state = "signed_out";
  let epoch = 0; // bumped on every login / logout / revocation: callbacks captured earlier become stale
  let timer = null;
  let inflight = null;
  let failures = 0;
  let lastOkAt = 0;
  const PERSIST_KEY = "gx.sessionGuard";

  const persist = async () => {
    if (storage) await storage.set(PERSIST_KEY, { state: state === "revoked" ? "revoked" : "ok" }).catch(() => {});
  };

  function cancelTimer() {
    if (timer !== null) clearTimer(timer);
    timer = null;
  }

  function schedule(ms) {
    cancelTimer();
    if (state === "signed_out" || state === "revoked") return;
    const e = epoch;
    timer = setTimer(() => {
      timer = null;
      if (e === epoch) void validate({ reason: "timer" });
    }, ms);
    scheduleWake(ms);
  }

  /** Bounded exponential backoff, then a slow poll: never a tight or endless retry loop. */
  function nextDelay() {
    if (failures <= 0) return checkEveryMs;
    if (failures >= retry.maxAttempts) return slowEveryMs;
    return Math.min(retry.maxMs, retry.baseMs * 2 ** (failures - 1));
  }

  async function request(method) {
    let token;
    try {
      token = await getAccessToken();
    } catch (e) {
      if (e && e.definitive) return "revoked"; // refresh token rejected: this session no longer exists on the server
      return "unavailable";
    }
    if (!token) return "unauthenticated";
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = ctl ? setTimer(() => ctl.abort(), requestTimeoutMs) : null;
    try {
      const res = await fetchFn(`${apiBase}/api/session`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: ctl ? ctl.signal : undefined,
      });
      let body = null;
      try {
        body = await res.json();
      } catch {
        /* non-JSON error pages are "unavailable", handled by interpretResponse */
      }
      return interpretResponse(res.status, body);
    } catch {
      return "unavailable"; // offline, DNS, timeout, abort
    } finally {
      if (t !== null) clearTimer(t);
    }
  }

  async function handleRevoked() {
    if (state === "revoked") return;
    epoch++; // everything started before this moment is stale
    state = "revoked";
    cancelTimer();
    try {
      await stopAllOperations("session_revoked");
    } finally {
      try {
        await clearAuth();
      } finally {
        await persist();
        await saveNotice(REVOKED_MESSAGE);
        notify(REVOKED_MESSAGE);
      }
    }
  }

  async function handleSignedOut(message = SIGNED_OUT_MESSAGE) {
    if (state === "signed_out") return;
    epoch++;
    state = "signed_out";
    cancelTimer();
    try {
      await stopAllOperations("signed_out");
    } finally {
      await clearAuth();
      await saveNotice(message);
    }
  }

  async function onUnavailable() {
    failures++;
    if (state === "active") {
      state = "paused"; // protected work pauses; it is NOT stopped, and NOT treated as valid or revoked
      await pauseOperations("session_unverified");
    }
    schedule(nextDelay());
  }

  /** Validates (or, while pending, registers) the session. Concurrent calls share one request. */
  function validate({ force = true } = {}) {
    if (state === "signed_out" || state === "revoked") return Promise.resolve(state); // stale credentials never resume
    if (!force && state === "active" && now() - lastOkAt < freshMs) return Promise.resolve(state);
    if (inflight) return inflight;
    const e = epoch;
    inflight = (async () => {
      try {
        const verdict = await request(state === "pending" ? "POST" : "GET");
        if (e !== epoch) return state; // logout / revocation / new login happened meanwhile: this answer is stale
        if (verdict === "active") {
          const wasPaused = state === "paused";
          failures = 0;
          lastOkAt = now();
          state = "active";
          if (wasPaused) await resumeOperations();
          schedule(checkEveryMs);
        } else if (verdict === "revoked") await handleRevoked();
        else if (verdict === "unauthenticated") await handleSignedOut();
        else await onUnavailable();
        return state;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  return {
    get state() {
      return state;
    },
    /** Current epoch: capture it when starting async work and check isCurrent() when the work calls back. */
    epoch: () => epoch,
    isCurrent: (e) => e === epoch && state === "active",
    /** Runs fn only if the captured epoch is still the current, active one (blocks restarts after logout). */
    runIfCurrent: (e, fn) => (e === epoch && state === "active" ? fn() : undefined),
    /** Cheap, synchronous gate for every automation entry point (tick, start, resume, queue step). */
    canRun: () => state === "active",
    validate,

    /**
     * Gate for starting protected operations: validates with the server first (skipped if verified within `freshMs`).
     * @returns {Promise<{ok: boolean, state: GuardState}>}
     */
    async assertActive() {
      const s = await validate({ reason: "before_start", force: false });
      return { ok: s === "active", state: s };
    },

    /** Call right after the extension authenticated (new login). Registers this session; the old one is revoked. */
    async onLogin() {
      epoch++;
      state = "pending";
      failures = 0;
      cancelTimer();
      await saveNotice(null);
      for (let attempt = 0; attempt <= retry.maxAttempts; attempt++) {
        const verdict = await request("POST");
        if (verdict === "active") {
          state = "active";
          lastOkAt = now();
          await persist();
          schedule(checkEveryMs);
          return { ok: true };
        }
        if (verdict === "revoked") {
          await handleRevoked(); // another login registered first: this one is already replaced
          return { ok: false, reason: "revoked" };
        }
        if (verdict === "unauthenticated") {
          await handleSignedOut();
          return { ok: false, reason: "unauthenticated" };
        }
        if (attempt === retry.maxAttempts) break;
        await new Promise((r) => setTimer(r, Math.min(retry.maxMs, retry.baseMs * 2 ** attempt)));
      }
      // Could not register (network): stay 'pending', i.e. protected operations blocked. validate() retries registration.
      schedule(slowEveryMs);
      return { ok: false, reason: "unavailable" };
    },

    /** Explicit logout: stop everything, revoke this session on the server (best effort), clear local state. */
    async logout() {
      const wasLive = state === "active" || state === "paused" || state === "pending";
      epoch++;
      const had = state;
      state = "signed_out";
      cancelTimer();
      try {
        await stopAllOperations("logout");
      } finally {
        if (wasLive && had !== "pending") await request("DELETE");
        await clearAuth();
        await persist();
        await saveNotice(null);
      }
    },

    /** Feed server verdicts seen by OTHER calls (e.g. /api/entitlement answered 401 session_revoked). */
    async reportVerdict(verdict) {
      if (verdict === "revoked") await handleRevoked();
      else if (verdict === "unauthenticated") await handleSignedOut();
      else if (verdict === "unavailable" && state === "active") await onUnavailable();
    },

    /**
     * Call on every service-worker start. A persisted revocation is never undone by a restart; otherwise
     * the guard resumes validating a signed-in session.
     */
    async start({ signedIn }) {
      const saved = storage ? await storage.get(PERSIST_KEY).catch(() => null) : null;
      if (saved && saved.state === "revoked" && !signedIn) {
        state = "revoked";
        return state;
      }
      if (!signedIn) {
        state = "signed_out";
        return state;
      }
      state = "paused"; // unverified after a restart: protected work waits for the first successful check
      return validate({ reason: "startup" });
    },
    stop: () => cancelTimer(),
  };
}
