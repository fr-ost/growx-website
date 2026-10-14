import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findPostgresBin, startRealPg, type RealPg } from "./helpers/realpg";

/** TRUE concurrency on a real PostgreSQL server (many connections). Skipped if no PostgreSQL binaries are installed. */
const available = !!findPostgresBin();
let pg: RealPg;
beforeAll(async () => {
  if (available) pg = await startRealPg();
}, 120_000);
afterAll(async () => {
  if (pg) await pg.stop();
}, 60_000);

let n = 5000;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;
const q = (text: string, values: unknown[] = []) => pg.pool.query(text, values);

async function user() {
  const id = uuid();
  await q("insert into auth.users (id, email) values ($1::uuid, $1::text || '@c.com')", [id]);
  return id;
}
async function session(u: string) {
  const id = uuid();
  await q("insert into auth.sessions (id, user_id) values ($1,$2)", [id, u]);
  await q("insert into auth.refresh_tokens (session_id) values ($1)", [id]);
  return id;
}
const register = (u: string, s: string, client = "extension", strict = false) =>
  q("select public.register_active_session($1,$2,$3,$4) as r", [u, s, client, strict]).then((r) => r.rows[0].r as { status: string });
const check = (u: string, s: string, client = "extension") => q("select public.check_active_session($1,$2,$3,false) as r", [u, s, client]).then((r) => r.rows[0].r as string);
const live = async (u: string) => (await q("select id from auth.sessions where user_id = $1", [u])).rows.map((r) => r.id as string);

describe.skipIf(!available)("single active session under real concurrency (PostgreSQL)", () => {
  it("20 logins at the same instant leave exactly ONE active session, consistent with auth.sessions", async () => {
    const u = await user();
    const sessions = await Promise.all(Array.from({ length: 20 }, () => session(u)));
    const results = await Promise.all(sessions.map((s) => register(u, s)));

    const actives = (await q("select session_id from public.active_sessions where user_id = $1", [u])).rows.map((r) => r.session_id as string);
    expect(actives).toHaveLength(1);
    const winner = actives[0];
    expect(sessions).toContain(winner);
    expect(await live(u)).toEqual([winner]); // every other session was revoked, the winner survives
    expect((await q("select count(*)::int n from auth.refresh_tokens where session_id <> $1 and session_id = any($2)", [winner, sessions])).rows[0].n).toBe(0);
    // those that lost either were revoked before registering or after: none of them ended up active
    const okCount = results.filter((r) => r.status === "active").length;
    expect(okCount).toBeGreaterThanOrEqual(1);
    for (const s of sessions) expect(await check(u, s)).toBe(s === winner ? "active" : "revoked");
  });

  it("two devices logging in simultaneously, many rounds: never zero and never two active sessions", async () => {
    for (let round = 0; round < 15; round++) {
      const u = await user();
      const [a, b] = await Promise.all([session(u), session(u)]);
      await Promise.all([register(u, a), register(u, b)]);
      const active = (await q("select session_id from public.active_sessions where user_id = $1", [u])).rows;
      expect(active).toHaveLength(1);
      expect(await live(u)).toEqual([active[0].session_id]);
    }
  });

  it("simultaneous checks, registrations and a logout never resurrect a revoked session", async () => {
    const u = await user();
    const a = await session(u);
    await register(u, a);
    const b = await session(u);
    // B logs in while A hammers the check endpoint and tries to re-register itself
    const [, ...rest] = await Promise.all([
      register(u, b),
      ...Array.from({ length: 10 }, () => check(u, a)),
      ...Array.from({ length: 5 }, () => register(u, a)),
    ]);
    expect(rest).toBeTruthy();
    expect(await check(u, a)).toBe("revoked");
    expect(await check(u, b)).toBe("active");
    expect((await q("select session_id from public.active_sessions where user_id = $1", [u])).rows.map((r) => r.session_id)).toEqual([b]);
  });

  it("concurrent first-time claims by unregistered (pre-existing) sessions pick exactly one", async () => {
    const u = await user();
    const sessions = await Promise.all(Array.from({ length: 10 }, () => session(u)));
    const verdicts = await Promise.all(sessions.map((s) => check(u, s)));
    expect(verdicts.filter((v) => v === "active")).toHaveLength(1);
    expect((await q("select count(*)::int n from public.active_sessions where user_id = $1", [u])).rows[0].n).toBe(1);
  });

  it("other users are untouched by a burst of logins", async () => {
    const bystander = await user();
    const keep = await session(bystander);
    await register(bystander, keep);
    const u = await user();
    const sessions = await Promise.all(Array.from({ length: 8 }, () => session(u)));
    await Promise.all(sessions.map((s) => register(u, s)));
    expect(await check(bystander, keep)).toBe("active");
    expect(await live(bystander)).toEqual([keep]);
  });
});
