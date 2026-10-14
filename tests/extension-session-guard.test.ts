import { beforeEach, describe, expect, it, vi } from "vitest";
import { REVOKED_MESSAGE, SIGNED_OUT_MESSAGE, createSessionGuard, interpretResponse, type GuardDeps } from "../extension-reference/session-guard.js";

/** A fake service worker: manual clock + timers, scripted server answers, spies for every host hook. */
function harness(over: Partial<GuardDeps> = {}) {
  let t = 1_000_000;
  let id = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const answers: Array<{ status: number; body?: unknown } | "network"> = [];
  const calls: Array<{ method: string; auth: string | null; url: string }> = [];
  const stored = new Map<string, unknown>();
  const log: string[] = [];
  const h = {
    calls,
    answers,
    log,
    timers,
    advance: async (ms: number) => {
      const end = t + ms;
      const flush = () => new Promise<void>((r) => setImmediate(r));
      await flush();
      for (;;) {
        const next = [...timers.entries()].filter(([, v]) => v.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        t = Math.max(t, next[1].at);
        timers.delete(next[0]);
        next[1].fn();
        await flush();
      }
      t = end;
      await flush();
    },
    deps: {
      apiBase: "https://www.growxapp.org",
      getAccessToken: vi.fn(async () => "tok.en.value" as string | null),
      clearAuth: vi.fn(async () => void log.push("clearAuth")),
      stopAllOperations: vi.fn(async (r: string) => void log.push(`stopAll:${r}`)),
      pauseOperations: vi.fn(async (r: string) => void log.push(`pause:${r}`)),
      resumeOperations: vi.fn(async () => void log.push("resume")),
      saveNotice: vi.fn(async (m: string | null) => void log.push(`notice:${m ?? "null"}`)),
      notify: vi.fn(),
      storage: { get: async (k: string) => stored.get(k), set: async (k: string, v: unknown) => void stored.set(k, v) },
      scheduleWake: vi.fn(),
      now: () => t,
      setTimer: (fn: () => void, ms: number) => {
        timers.set(++id, { at: t + ms, fn });
        return id;
      },
      clearTimer: (x: unknown) => void timers.delete(x as number),
      fetchFn: vi.fn(async (url: string, init: RequestInit) => {
        calls.push({ method: init.method ?? "GET", auth: (init.headers as Record<string, string>)?.Authorization ?? null, url });
        const a = answers.shift() ?? { status: 200, body: { active: true } };
        if (a === "network") throw new TypeError("Failed to fetch");
        return { status: a.status, json: async () => a.body ?? {} } as unknown as Response;
      }),
      ...over,
    } as GuardDeps & { stopAllOperations: ReturnType<typeof vi.fn>; clearAuth: ReturnType<typeof vi.fn>; pauseOperations: ReturnType<typeof vi.fn>; resumeOperations: ReturnType<typeof vi.fn>; saveNotice: ReturnType<typeof vi.fn>; notify: ReturnType<typeof vi.fn>; getAccessToken: ReturnType<typeof vi.fn> },
  };
  return h;
}
const REVOKED = { status: 401, body: { error: { code: "session_revoked" } } };
const UNAUTH = { status: 401, body: { error: { code: "unauthenticated" } } };
const DOWN = { status: 503, body: { error: { code: "session_check_unavailable" } } };

let h: ReturnType<typeof harness>;
beforeEach(() => {
  h = harness();
});
const loggedIn = async (g = createSessionGuard(h.deps)) => {
  expect((await g.onLogin()).ok).toBe(true);
  h.calls.length = 0;
  h.log.length = 0;
  return g;
};

describe("verdicts", () => {
  it("only 401 session_revoked is a revocation; everything else is unknown or plain signed-out", () => {
    expect(interpretResponse(200, {})).toBe("active");
    expect(interpretResponse(401, { error: { code: "session_revoked" } })).toBe("revoked");
    expect(interpretResponse(401, { error: { code: "unauthenticated" } })).toBe("unauthenticated");
    for (const s of [0, 403, 404, 429, 500, 502, 503, 504]) expect(interpretResponse(s, { error: { code: "session_revoked" } }), String(s)).toBe("unavailable");
    expect(interpretResponse(503, { error: { code: "session_check_unavailable" } })).toBe("unavailable");
  });
});

describe("login", () => {
  it("registers the new session (POST) and becomes active; clears any old notice", async () => {
    const g = createSessionGuard(h.deps);
    expect(await g.onLogin()).toEqual({ ok: true });
    expect(g.state).toBe("active");
    expect(h.calls).toEqual([{ method: "POST", auth: "Bearer tok.en.value", url: "https://www.growxapp.org/api/session" }]);
    expect(h.deps.saveNotice).toHaveBeenCalledWith(null);
    expect(g.canRun()).toBe(true);
  });
  it("a login that is already replaced (registration says revoked) ends up signed out with the message", async () => {
    h.answers.push(REVOKED);
    const g = createSessionGuard(h.deps);
    expect(await g.onLogin()).toEqual({ ok: false, reason: "revoked" });
    expect(g.state).toBe("revoked");
    expect(h.deps.stopAllOperations).toHaveBeenCalledWith("session_revoked");
    expect(h.deps.saveNotice).toHaveBeenLastCalledWith(REVOKED_MESSAGE);
  });
  it("registration failing from a network problem keeps protected work blocked and retries a bounded number of times", async () => {
    for (let i = 0; i < 20; i++) h.answers.push("network");
    const g = createSessionGuard(h.deps);
    const p = g.onLogin();
    await h.advance(10 * 60_000);
    expect(await p).toEqual({ ok: false, reason: "unavailable" });
    expect(g.state).toBe("pending");
    expect(g.canRun()).toBe(false);
    expect(h.calls.length).toBe(7); // 1 + maxAttempts(6): bounded
    expect(h.deps.clearAuth).not.toHaveBeenCalled(); // not a verdict: nothing is thrown away
  });
});

describe("revocation (signed in on another device)", () => {
  it("stops everything, clears auth + cached Premium, shows the exact message, and cancels its own timers", async () => {
    const g = await loggedIn();
    h.answers.push(REVOKED);
    await g.validate();
    expect(g.state).toBe("revoked");
    expect(h.log).toEqual(["stopAll:session_revoked", "clearAuth", `notice:${REVOKED_MESSAGE}`]);
    expect(h.deps.notify).toHaveBeenCalledWith(REVOKED_MESSAGE);
    expect(REVOKED_MESSAGE).toBe("You've been logged out because your GrowX account was signed in on another device. Please sign in again to continue.");
    expect(h.timers.size).toBe(0);
    expect(g.canRun()).toBe(false);
  });
  it("is idempotent: concurrent revocation signals stop and clear exactly once", async () => {
    const g = await loggedIn();
    await Promise.all([g.reportVerdict("revoked"), g.reportVerdict("revoked"), g.reportVerdict("revoked")]);
    expect(h.deps.stopAllOperations).toHaveBeenCalledTimes(1);
    expect(h.deps.clearAuth).toHaveBeenCalledTimes(1);
  });
  it("clears credentials even if stopping the automation throws", async () => {
    const g = await loggedIn();
    h.deps.stopAllOperations.mockRejectedValueOnce(new Error("boom"));
    await expect(g.reportVerdict("revoked")).rejects.toThrow("boom");
    expect(h.deps.clearAuth).toHaveBeenCalledTimes(1);
    expect(g.state).toBe("revoked");
  });
  it("stale cached credentials cannot resume: no further network calls, validate and assertActive stay revoked", async () => {
    const g = await loggedIn();
    await g.reportVerdict("revoked");
    h.calls.length = 0;
    expect(await g.validate()).toBe("revoked");
    expect(await g.assertActive()).toEqual({ ok: false, state: "revoked" });
    await h.advance(60 * 60_000);
    expect(h.calls).toHaveLength(0);
  });
  it("a revoked refresh token (auth server rejected it) counts as revocation", async () => {
    const g = await loggedIn();
    h.deps.getAccessToken.mockRejectedValueOnce(Object.assign(new Error("refresh_token_not_found"), { definitive: true }));
    await g.validate();
    expect(g.state).toBe("revoked");
    expect(h.deps.saveNotice).toHaveBeenLastCalledWith(REVOKED_MESSAGE);
  });
  it("a service-worker restart does not undo a revocation", async () => {
    const g = await loggedIn();
    await g.reportVerdict("revoked");
    const fresh = createSessionGuard(h.deps); // new worker instance, same storage
    h.calls.length = 0;
    expect(await fresh.start({ signedIn: false })).toBe("revoked");
    expect(fresh.canRun()).toBe(false);
    expect(h.calls).toHaveLength(0);
  });
});

describe("stale callbacks cannot restart automation", () => {
  it("work captured before logout/revocation is blocked by the epoch check", async () => {
    const g = await loggedIn();
    const e = g.epoch();
    const restart = vi.fn();
    expect(g.runIfCurrent(e, restart)).toBeUndefined();
    expect(restart).toHaveBeenCalledTimes(1); // current: runs
    await g.reportVerdict("revoked");
    g.runIfCurrent(e, restart); // e.g. a pending setTimeout/fetch callback from before the revocation
    expect(restart).toHaveBeenCalledTimes(1);
    expect(g.isCurrent(e)).toBe(false);
  });
  it("validate answering 'active' after a logout does not reactivate", async () => {
    let finish!: () => void;
    const gate = new Promise<void>((r) => (finish = r));
    const fetchFn = vi.fn(async (_u: string, init: RequestInit) => {
      if (init.method === "GET") await gate;
      return { status: 200, json: async () => ({ active: true }) } as unknown as Response;
    });
    const g = createSessionGuard({ ...h.deps, fetchFn: fetchFn as never });
    await g.onLogin();
    const v = g.validate();
    await Promise.resolve();
    await g.logout();
    finish();
    expect(await v).toBe("signed_out");
    expect(g.state).toBe("signed_out");
    expect(g.canRun()).toBe(false);
  });
  it("a new login after a revocation starts a new epoch and works again", async () => {
    const g = await loggedIn();
    const old = g.epoch();
    await g.reportVerdict("revoked");
    expect((await g.onLogin()).ok).toBe(true);
    expect(g.canRun()).toBe(true);
    expect(g.isCurrent(old)).toBe(false);
  });
});

describe("network trouble: pause, bounded backoff, never a verdict", () => {
  it("pauses protected work (not stop, not clear), backs off 5s,10s,20s,... capped, then slows down instead of looping", async () => {
    const g = await loggedIn();
    for (let i = 0; i < 30; i++) h.answers.push("network");
    await g.validate();
    expect(g.state).toBe("paused");
    expect(g.canRun()).toBe(false);
    expect(h.deps.pauseOperations).toHaveBeenCalledTimes(1);
    expect(h.deps.stopAllOperations).not.toHaveBeenCalled();
    expect(h.deps.clearAuth).not.toHaveBeenCalled();
    expect(h.deps.saveNotice).not.toHaveBeenCalledWith(REVOKED_MESSAGE);

    await h.advance(2 * 60 * 60_000); // two hours offline
    // initial + 5 backoff retries + slow polls (every 15 min): bounded, never a tight or endless loop
    expect(h.calls.length).toBeLessThanOrEqual(1 + 5 + 8 + 1);
    expect(g.state).toBe("paused");
  });
  it("exact retry schedule: 5s, 10s, 20s, 40s, 80s, 120s(cap)... then the slow interval", async () => {
    const g = await loggedIn();
    for (let i = 0; i < 40; i++) h.answers.push("network");
    await g.validate(); // failure 1
    const waits: number[] = [];
    for (let i = 0; i < 7; i++) {
      const timer = [...h.timers.values()][0];
      const at = timer.at;
      await h.advance(0);
      const now0 = (h.deps.now as () => number)();
      waits.push(at - now0);
      await h.advance(at - now0);
    }
    expect(waits).toEqual([5_000, 10_000, 20_000, 40_000, 80_000, 15 * 60_000, 15 * 60_000]);
  });
  it("503 session_check_unavailable behaves exactly like a network error", async () => {
    const g = await loggedIn();
    h.answers.push(DOWN);
    await g.validate();
    expect(g.state).toBe("paused");
    expect(h.deps.stopAllOperations).not.toHaveBeenCalled();
  });
  it("recovery resumes the paused work once and resets the backoff", async () => {
    const g = await loggedIn();
    h.answers.push("network", "network");
    await g.validate();
    await h.advance(5_000); // second failure
    expect(g.state).toBe("paused");
    await h.advance(10_000); // success
    expect(g.state).toBe("active");
    expect(h.deps.resumeOperations).toHaveBeenCalledTimes(1);
    expect(g.canRun()).toBe(true);
    await h.advance(60_000);
    expect(g.state).toBe("active"); // back to the normal cadence
  });
  it("a revocation discovered after an outage is still handled", async () => {
    const g = await loggedIn();
    h.answers.push("network", REVOKED);
    await g.validate();
    await h.advance(5_000);
    expect(g.state).toBe("revoked");
    expect(h.deps.stopAllOperations).toHaveBeenCalledWith("session_revoked");
  });
  it("a token-refresh network failure is 'unavailable', not a verdict", async () => {
    const g = await loggedIn();
    h.deps.getAccessToken.mockRejectedValueOnce(new Error("fetch failed"));
    await g.validate();
    expect(g.state).toBe("paused");
    expect(h.deps.clearAuth).not.toHaveBeenCalled();
  });
});

describe("plain signed-out (not 'another device')", () => {
  it("401 unauthenticated or no token: stop, clear, generic message", async () => {
    const g = await loggedIn();
    h.answers.push(UNAUTH);
    await g.validate();
    expect(g.state).toBe("signed_out");
    expect(h.log).toEqual(["stopAll:signed_out", "clearAuth", `notice:${SIGNED_OUT_MESSAGE}`]);
    const g2 = await loggedIn(createSessionGuard(h.deps));
    h.deps.getAccessToken.mockResolvedValueOnce(null);
    await g2.validate();
    expect(g2.state).toBe("signed_out");
  });
});

describe("periodic validation and gates", () => {
  it("validates every minute while active", async () => {
    const g = await loggedIn();
    await h.advance(3 * 60_000 + 100);
    expect(h.calls.filter((c) => c.method === "GET")).toHaveLength(3);
    expect(g.state).toBe("active");
  });
  it("the next check is mirrored into an alarm so a killed service worker wakes up", async () => {
    await loggedIn();
    expect(h.deps.scheduleWake).toHaveBeenCalledWith(60_000);
  });
  it("assertActive (before starting protected work) validates with the server, but not more than once per fresh window", async () => {
    const g = await loggedIn();
    expect(await g.assertActive()).toEqual({ ok: true, state: "active" });
    expect(h.calls).toHaveLength(0); // verified moments ago
    await h.advance(20_000);
    h.calls.length = 0;
    expect(await g.assertActive()).toEqual({ ok: true, state: "active" });
    expect(h.calls).toHaveLength(1);
  });
  it("assertActive refuses to start while the server cannot be reached or says revoked", async () => {
    let g = await loggedIn();
    await h.advance(30_000);
    h.answers.push("network");
    expect((await g.assertActive()).ok).toBe(false);
    h = harness();
    g = await loggedIn(createSessionGuard(h.deps));
    await h.advance(30_000);
    h.answers.push(REVOKED);
    expect(await g.assertActive()).toEqual({ ok: false, state: "revoked" });
  });
  it("simultaneous validations share ONE request", async () => {
    const g = await loggedIn();
    await Promise.all([g.validate(), g.validate(), g.validate(), g.assertActive()]);
    expect(h.calls).toHaveLength(1);
  });
  it("an entitlement call that learns of a revocation (401 session_revoked) triggers the same handling", async () => {
    const g = await loggedIn();
    await g.reportVerdict(interpretResponse(401, { error: { code: "session_revoked" } }));
    expect(g.state).toBe("revoked");
  });
  it("only ever talks to the configured API origin, with the bearer token", async () => {
    await loggedIn(createSessionGuard({ ...h.deps }));
    const g = createSessionGuard(h.deps);
    await g.onLogin();
    await g.validate();
    for (const c of h.calls) {
      expect(c.url).toBe("https://www.growxapp.org/api/session");
      expect(c.auth).toBe("Bearer tok.en.value");
    }
  });
});

describe("explicit logout", () => {
  it("stops everything, revokes the session on the server, clears local state, and does not show the 'other device' message", async () => {
    const g = await loggedIn();
    await g.logout();
    expect(g.state).toBe("signed_out");
    expect(h.log).toEqual(["stopAll:logout", "clearAuth", "notice:null"]);
    expect(h.calls.map((c) => c.method)).toEqual(["DELETE"]);
    expect(g.canRun()).toBe(false);
    expect(h.timers.size).toBe(0);
  });
  it("logout still clears everything when the server is unreachable", async () => {
    const g = await loggedIn();
    h.answers.push("network");
    await g.logout();
    expect(h.deps.clearAuth).toHaveBeenCalledTimes(1);
    expect(g.state).toBe("signed_out");
  });
});

describe("start (service-worker restart)", () => {
  it("signed in: protected work stays blocked until the first successful check, then resumes", async () => {
    const g = createSessionGuard(h.deps);
    const p = g.start({ signedIn: true });
    expect(g.canRun()).toBe(false);
    expect(await p).toBe("active");
    expect(h.deps.resumeOperations).toHaveBeenCalledTimes(1);
  });
  it("signed in but the check fails with revocation: nothing resumes", async () => {
    h.answers.push(REVOKED);
    const g = createSessionGuard(h.deps);
    expect(await g.start({ signedIn: true })).toBe("revoked");
    expect(h.deps.resumeOperations).not.toHaveBeenCalled();
  });
  it("signed out: no network calls", async () => {
    const g = createSessionGuard(h.deps);
    expect(await g.start({ signedIn: false })).toBe("signed_out");
    expect(h.calls).toHaveLength(0);
  });
});
