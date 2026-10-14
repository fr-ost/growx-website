import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addSession, addUser, asRole, freshDb } from "./helpers/pg";

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
});
afterAll(async () => db.close());

type Reg = { status: "active" | "session_not_found"; revoked?: number };
const register = async (u: string, s: string, client: "web" | "extension" = "extension", strict = false) =>
  (await db.query<{ r: Reg }>("select public.register_active_session($1,$2,$3,$4) as r", [u, s, client, strict])).rows[0].r;
const check = async (u: string, s: string, client: "web" | "extension" = "extension", strict = false) =>
  (await db.query<{ r: string }>("select public.check_active_session($1,$2,$3,$4) as r", [u, s, client, strict])).rows[0].r;
const release = async (u: string, s: string) => (await db.query<{ r: boolean }>("select public.release_active_session($1,$2) as r", [u, s])).rows[0].r;
const sessionsOf = async (u: string) => (await db.query<{ id: string }>("select id from auth.sessions where user_id = $1", [u])).rows.map((r) => r.id);
const refreshOf = async (s: string) => Number((await db.query<{ n: string }>("select count(*)::int n from auth.refresh_tokens where session_id = $1", [s])).rows[0].n);
const activeOf = async (u: string) => (await db.query<{ slot: string; session_id: string }>("select slot, session_id from public.active_sessions where user_id = $1 order by slot", [u])).rows;

describe("login on device A, then device B", () => {
  it("B becomes active, A is revoked (session AND refresh token deleted), A cannot come back", async () => {
    const u = await addUser(db);
    const A = await addSession(db, u);
    expect(await register(u, A)).toEqual({ status: "active", revoked: 0 });
    expect(await check(u, A)).toBe("active");

    const B = await addSession(db, u); // user logs in on a second device: GoTrue creates the session first...
    expect(await register(u, B)).toEqual({ status: "active", revoked: 1 }); // ...then the server activates it
    expect(await check(u, B)).toBe("active");
    expect(await check(u, A)).toBe("revoked");
    expect(await sessionsOf(u)).toEqual([B]);
    expect(await refreshOf(A)).toBe(0); // A can no longer refresh
    expect(await refreshOf(B)).toBe(1);

    // stale client state: A (or a copy of its tokens) tries to register itself again
    expect(await register(u, A)).toEqual({ status: "session_not_found" });
    expect(await check(u, A)).toBe("revoked");
    expect((await activeOf(u)).map((r) => r.session_id)).toEqual([B]);
  });

  it("a stale access token (JWT still valid) is rejected by the check even if the session row was removed elsewhere", async () => {
    const u = await addUser(db);
    const A = await addSession(db, u);
    await register(u, A);
    await db.exec(`delete from auth.sessions where id = '${A}'`); // e.g. revoked by another mechanism
    expect(await check(u, A)).toBe("revoked");
  });

  it("an expired session (not_after in the past) is not active and cannot register", async () => {
    const u = await addUser(db);
    const A = await addSession(db, u);
    await db.exec(`update auth.sessions set not_after = now() - interval '1 minute' where id = '${A}'`);
    expect(await register(u, A)).toEqual({ status: "session_not_found" });
    expect(await check(u, A)).toBe("revoked");
  });

  it("checking is idempotent and refresh keeps the same session id (stays active)", async () => {
    const u = await addUser(db);
    const A = await addSession(db, u);
    await register(u, A);
    for (let i = 0; i < 3; i++) expect(await check(u, A)).toBe("active");
    await db.exec("insert into auth.refresh_tokens (session_id) values ('" + A + "')"); // a refresh rotates tokens, not the session
    expect(await check(u, A)).toBe("active");
    expect(await register(u, A)).toEqual({ status: "active", revoked: 0 }); // re-registering the active session revokes nothing
  });
});

describe("other users are never affected", () => {
  it("a login by one user leaves every other user's sessions and active rows alone", async () => {
    const u1 = await addUser(db), u2 = await addUser(db);
    const a1 = await addSession(db, u1), a2 = await addSession(db, u2), extra2 = await addSession(db, u2);
    await register(u1, a1);
    await register(u2, a2);
    const b1 = await addSession(db, u1);
    await register(u1, b1);
    expect(await check(u1, a1)).toBe("revoked");
    expect(await check(u2, a2)).toBe("active");
    expect((await sessionsOf(u2)).sort()).toEqual([a2, extra2].sort()); // u2's other (unregistered) session untouched
    expect(await refreshOf(a2)).toBe(1);
    // cross-user misuse: u1 cannot register or check u2's session
    expect(await register(u1, a2)).toEqual({ status: "session_not_found" });
    expect(await check(u1, a2)).toBe("revoked");
    expect(await release(u1, a2)).toBe(false);
    expect(await sessionsOf(u2)).toContain(a2);
  });
});

describe("web and extension slots", () => {
  it("default: one web + one extension session; website logins never log out the extension", async () => {
    const u = await addUser(db);
    const ext1 = await addSession(db, u), web1 = await addSession(db, u);
    await register(u, ext1, "extension");
    await register(u, web1, "web");
    expect(await check(u, ext1, "extension")).toBe("active");
    expect(await check(u, web1, "web")).toBe("active");

    const web2 = await addSession(db, u);
    expect(await register(u, web2, "web")).toEqual({ status: "active", revoked: 1 });
    expect(await check(u, web1, "web")).toBe("revoked");
    expect(await check(u, ext1, "extension")).toBe("active");

    const ext2 = await addSession(db, u);
    await register(u, ext2, "extension");
    expect(await check(u, ext1, "extension")).toBe("revoked");
    expect(await check(u, web2, "web")).toBe("active");
    expect((await sessionsOf(u)).sort()).toEqual([ext2, web2].sort());
  });

  it("a session active in one slot is not silently valid in the other (it keeps its own slot)", async () => {
    const u = await addUser(db);
    const w = await addSession(db, u), e = await addSession(db, u);
    await register(u, w, "web");
    await register(u, e, "extension");
    // the web session presented as an extension client: it IS an active session, so it validates, but registering it as extension
    // moves it (and revokes the previous extension session): it cannot hold two slots.
    expect(await check(u, w, "extension")).toBe("active");
    expect(await register(u, w, "extension")).toEqual({ status: "active", revoked: 1 });
    expect((await activeOf(u)).map((r) => r.slot)).toEqual(["extension"]);
    expect(await check(u, e, "extension")).toBe("revoked");
  });

  it("strict mode: a single slot for the whole account; any new login revokes every other session", async () => {
    const u = await addUser(db);
    const a = await addSession(db, u);
    await register(u, a, "web", true);
    expect(await check(u, a, "web", true)).toBe("active");
    const b = await addSession(db, u), c = await addSession(db, u); // c never registers
    expect(await register(u, b, "extension", true)).toEqual({ status: "active", revoked: 2 }); // a and the never-registered c
    expect(await check(u, a, "web", true)).toBe("revoked");
    expect(await check(u, c, "extension", true)).toBe("revoked");
    expect(await sessionsOf(u)).toEqual([b]);
    expect((await activeOf(u)).map((r) => r.slot)).toEqual(["account"]);
  });
});

describe("rollout of existing logins (no active session recorded yet)", () => {
  it("the first live session to check claims the slot; others are then revoked, and a revoked session cannot reclaim", async () => {
    const u = await addUser(db);
    const a = await addSession(db, u), b = await addSession(db, u);
    expect(await check(u, a)).toBe("active"); // claimed
    expect(await check(u, b)).toBe("revoked");
    expect(await check(u, a)).toBe("active");
    expect((await activeOf(u)).map((r) => r.session_id)).toEqual([a]);
  });
  it("a session that does not exist can never claim", async () => {
    const u = await addUser(db);
    expect(await check(u, "99999999-9999-4999-8999-999999999999")).toBe("revoked");
    expect(await activeOf(u)).toEqual([]);
  });
});

describe("explicit logout", () => {
  it("release deletes the active row and the session (refresh tokens too); it cannot be reclaimed", async () => {
    const u = await addUser(db);
    const a = await addSession(db, u);
    await register(u, a);
    expect(await release(u, a)).toBe(true);
    expect(await sessionsOf(u)).toEqual([]);
    expect(await refreshOf(a)).toBe(0);
    expect(await check(u, a)).toBe("revoked"); // not 'claimed': the session is gone
    expect(await register(u, a)).toEqual({ status: "session_not_found" });
    expect(await release(u, a)).toBe(false); // idempotent
  });
  it("releasing a session that is not the active one does not revoke the active one", async () => {
    const u = await addUser(db);
    const a = await addSession(db, u), b = await addSession(db, u);
    await register(u, a);
    await release(u, b);
    expect(await check(u, a)).toBe("active");
  });
});

describe("billing data is untouched and access control holds", () => {
  it("login/logout never alter subscriptions, payments or trials", async () => {
    const u = await addUser(db);
    await db.exec(`insert into public.profiles (id, email) values ('${u}', 'x@y.z') on conflict do nothing`);
    await db.exec(`insert into public.subscriptions (user_id, provider, plan, status) values ('${u}', 'nowpayments', 'PRO_LIFETIME', 'active')`);
    const before = JSON.stringify((await db.query("select * from public.subscriptions where user_id = $1", [u])).rows);
    const a = await addSession(db, u), b = await addSession(db, u);
    await register(u, a);
    await register(u, b);
    await release(u, b);
    expect(JSON.stringify((await db.query("select * from public.subscriptions where user_id = $1", [u])).rows)).toBe(before);
  });

  it("API roles cannot read, write or call anything about sessions", async () => {
    const u = await addUser(db);
    const a = await addSession(db, u);
    await register(u, a);
    for (const role of ["anon", "authenticated"] as const) {
      await asRole(db, role, u, async () => {
        await expect(db.query("select * from public.active_sessions")).rejects.toThrow(/permission denied/);
        await expect(db.query("insert into public.active_sessions (user_id, slot, session_id) values ($1,'web',$2)", [u, a])).rejects.toThrow(/permission denied/);
        for (const call of [
          ["select public.register_active_session($1,$2,'web',false)", [u, a]],
          ["select public.check_active_session($1,$2,'web',false)", [u, a]],
          ["select public.release_active_session($1,$2)", [u, a]],
        ] as const)
          await expect(db.query(call[0], [...call[1]])).rejects.toThrow(/permission denied/);
      });
    }
    await asRole(db, "service_role", null, async () => {
      expect((await db.query<{ r: string }>("select public.check_active_session($1,$2,'extension',false) as r", [u, a])).rows[0].r).toBe("active");
    });
  });

  it("rejects an unknown client kind", async () => {
    const u = await addUser(db);
    const a = await addSession(db, u);
    await expect(db.query("select public.register_active_session($1,$2,'tv',false)", [u, a])).rejects.toThrow(/invalid_client/);
  });
});
