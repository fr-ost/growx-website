// Minimal Supabase (GoTrue + PostgREST) mock for local end-to-end testing.
import http from "node:http";
const PORT = Number(process.env.PORT || 54321);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const users = new Map(); // email -> user
const tokens = new Map(); // token -> email
const xprofiles = new Map(); // uid -> row
const trials = new Map(); // uid -> row
const trialNames = new Set();
// Permanent X account bindings (public.x_account_bindings), keyed by normalized username: global uniqueness.
const xbindings = new Map();
const xDisplay = (v) => { const t = String(v ?? "").replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "").replace(/^@/, ""); return /^[A-Za-z0-9_]{1,15}$/.test(t) ? t : null; };
function registerX({ p_user, p_username }) {
  const d = xDisplay(p_username); if (!d) return { status: "invalid_username" };
  const norm = d.toLowerCase(); const cur = xbindings.get(norm);
  if (cur) return cur.user_id === p_user ? { status: "already_linked", normalized_username: norm } : { status: "taken" };
  const used = [...xbindings.values()].filter((b) => b.user_id === p_user).length;
  if (used >= 2) return { status: "no_slot", used, allowed: 2 };
  const now = new Date().toISOString();
  xbindings.set(norm, { user_id: p_user, username: d, normalized_username: norm, status: "active", confirmed_at: now, created_at: now });
  return { status: "linked", binding_id: "b-" + norm, username: d, normalized_username: norm, used: used + 1, allowed: 2 };
}
let n = 0;
let sn = 0;
const log = [];
// Sessions as GoTrue keeps them (auth.sessions), and the server-side active-session slots (public.active_sessions).
const sessions = new Map(); // session id -> user id
const active = new Map(); // `${userId}:${slot}` -> session id
const sid = () => `aaaaaaaa-0000-4000-8000-${String(++sn).padStart(12, "0")}`;

function mkUser(email, confirmed) {
  const u = { id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`, aud: "authenticated", role: "authenticated", email,
    email_confirmed_at: confirmed ? new Date().toISOString() : null, created_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [{ id: "i", provider: "email" }] };
  users.set(email, u); return u;
}
/** A login creates a NEW session; a refresh keeps the session id (like GoTrue). */
function session(u, existing) {
  const id = existing ?? sid();
  if (!existing) sessions.set(id, u.id);
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const t = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: u.id, email: u.email, aud: "authenticated", role: "authenticated", exp, iat: exp - 3600, session_id: id })}.sig`;
  tokens.set(t, u.email);
  return { access_token: t, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: `r_${id}`, user: u };
}
const revokeSession = (id) => sessions.delete(id);
const slotKey = (user, client, strict) => `${user}:${strict ? "account" : client}`;
const rpcSessions = {
  register({ p_user, p_session, p_client, p_strict }) {
    if (sessions.get(p_session) !== p_user) return { status: "session_not_found" };
    const key = slotKey(p_user, p_client, p_strict);
    const old = active.get(key);
    for (const [k, v] of active) if (v === p_session && k !== key) active.delete(k);
    active.set(key, p_session);
    let revoked = 0;
    if (p_strict) { for (const [id, u] of [...sessions]) if (u === p_user && id !== p_session) { revokeSession(id); revoked++; } }
    else if (old && old !== p_session && revokeSession(old)) revoked = 1;
    return { status: "active", revoked };
  },
  check({ p_user, p_session, p_client, p_strict }) {
    const exists = sessions.get(p_session) === p_user;
    if ([...active].some(([k, v]) => v === p_session && k.startsWith(p_user))) return exists ? "active" : "revoked";
    if (active.has(slotKey(p_user, p_client, p_strict))) return "revoked";
    if (!exists) return "revoked";
    active.set(slotKey(p_user, p_client, p_strict), p_session);
    return "active";
  },
  release({ p_user, p_session }) {
    let had = false;
    for (const [k, v] of [...active]) if (v === p_session && k.startsWith(p_user)) { active.delete(k); had = true; }
    if (sessions.get(p_session) === p_user) revokeSession(p_session);
    return had;
  },
};
mkUser("demo@example.com", true);
mkUser("unconfirmed@example.com", false);
mkUser("other@example.com", true);
mkUser("brokendb@example.com", true); // simulates a project without migrations
mkUser("nopay@example.com", true); // only the payments table is missing
const ADMIN_USER = mkUser("admin@example.com", true); // listed in public.admins
// ---- admin state (public.admins, premium_gifts + events, early_bird_settings + events)
const adminIds = new Set([ADMIN_USER.id]);
const gifts = []; const giftEvents = []; const ebEvents = [];
const eb = { enabled: true, cap: 100, alloc: 100, sold: 37, updated_at: new Date().toISOString() };
const ebStatus = () => ({ state: !eb.enabled ? "off" : eb.sold >= eb.cap ? "sold_out" : "available", enabled: eb.enabled, sold: eb.sold, open_reservations: 0, sales_cap: eb.cap, campaign_allocation: eb.alloc, remaining: Math.max(0, eb.cap - eb.sold), updated_at: eb.updated_at });
const emailOf = (id) => [...users.values()].find((u) => u.id === id)?.email ?? null;
const DUR = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
const adminRpc = {
  admin_find_user: ({ p_email }) => { const u = users.get(String(p_email).trim().toLowerCase()); return u ? { status: "ok", user_id: u.id, email: u.email, created_at: u.created_at } : { status: "not_found" }; },
  admin_grant_gift: ({ p_admin, p_user, p_duration, p_reason }) => {
    if (gifts.some((g) => g.user_id === p_user && g.status === "active" && (!g.expires_at || Date.parse(g.expires_at) > Date.now()))) return { status: "active_gift_exists" };
    const now = new Date(); const g = { id: `9${String(gifts.length + 1).padStart(7, "0")}-0000-4000-8000-000000000000`, user_id: p_user, granted_by: p_admin, duration: p_duration, starts_at: now.toISOString(), expires_at: p_duration === "lifetime" ? null : new Date(now.getTime() + DUR[p_duration] * 864e5).toISOString(), status: "active", reason: p_reason, revoked_at: null, revoked_by: null, revoke_reason: null, created_at: now.toISOString() };
    gifts.unshift(g); giftEvents.unshift({ id: giftEvents.length + 1, user_id: p_user, admin_id: p_admin, action: "grant", duration: p_duration, prev_expires_at: null, new_expires_at: g.expires_at, reason: p_reason, created_at: g.created_at });
    return { status: "granted", gift_id: g.id, expires_at: g.expires_at };
  },
  admin_revoke_gift: ({ p_admin, p_gift, p_reason }) => { const g = gifts.find((x) => x.id === p_gift); if (!g) return { status: "not_found" }; if (g.status === "revoked") return { status: "already_revoked" }; Object.assign(g, { status: "revoked", revoked_at: new Date().toISOString(), revoked_by: p_admin, revoke_reason: p_reason }); giftEvents.unshift({ id: giftEvents.length + 1, user_id: g.user_id, admin_id: p_admin, action: "revoke", duration: g.duration, prev_expires_at: g.expires_at, new_expires_at: g.expires_at, reason: p_reason, created_at: g.revoked_at }); return { status: "revoked" }; },
  admin_extend_gift: () => ({ status: "extended", expires_at: null }),
  admin_set_early_bird: ({ p_admin, p_remaining, p_enabled, p_reason, p_expected_updated_at }) => {
    if (p_expected_updated_at && p_expected_updated_at !== eb.updated_at) return { status: "stale" };
    if (eb.sold + p_remaining > eb.alloc) return { status: "exceeds_allocation", max_remaining: eb.alloc - eb.sold };
    ebEvents.unshift({ id: ebEvents.length + 1, admin_id: p_admin, action: "set_inventory", sold_at_change: eb.sold, prev_enabled: eb.enabled, new_enabled: p_enabled, prev_remaining: Math.max(0, eb.cap - eb.sold), new_remaining: p_remaining, prev_allocation: eb.alloc, new_allocation: eb.alloc, reason: p_reason, created_at: new Date().toISOString() });
    Object.assign(eb, { cap: eb.sold + p_remaining, enabled: p_enabled, updated_at: new Date().toISOString() });
    return { status: "saved" };
  },
  admin_increase_early_bird_allocation: () => ({ status: "saved" }),
};

const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json" }); res.end(body === undefined ? "" : JSON.stringify(body)); };
// NOTE: like a worst-case GoTrue, an already-issued access token is still accepted here after its session was revoked:
// the application's own active-session check is what must reject it.
const authUser = (req) => { const m = (req.headers.authorization || "").match(/^Bearer (.+)$/); const e = m && tokens.get(m[1]); return e ? users.get(e) : null; };
const sessionOfToken = (req) => { const m = (req.headers.authorization || "").match(/^Bearer (.+)$/); try { return m ? JSON.parse(Buffer.from(m[1].split(".")[1], "base64url").toString()).session_id : null; } catch { return null; } };

http.createServer(async (req, res) => {
  let raw = ""; for await (const c of req) raw += c;
  const body = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  log.push(`${req.method} ${p}${url.search}${p.includes("_active_session") ? " " + raw : ""}`);
  if (p === "/__log") return send(res, 200, log);
  if (p === "/__state") return send(res, 200, { sessions: [...sessions], active: [...active] });
  if (p === "/auth/v1/health") return send(res, 200, { name: "GoTrue" });
  if (p === "/auth/v1/signup" && req.method === "POST") {
    if (users.has(body.email)) return send(res, 200, { ...users.get(body.email), identities: [] });
    const u = mkUser(body.email, body.email.startsWith("instant"));
    return send(res, 200, u.email_confirmed_at ? session(u) : u);
  }
  if (p === "/auth/v1/token") {
    const gt = url.searchParams.get("grant_type");
    if (gt === "refresh_token") {
      const id = String(body.refresh_token).slice(2); // a revoked session's refresh tokens are gone (ON DELETE CASCADE)
      const uid = sessions.get(id); const u = uid && [...users.values()].find((x) => x.id === uid);
      return u ? send(res, 200, session(u, id)) : send(res, 400, { error_code: "refresh_token_not_found", msg: "bad" });
    }
    const u = users.get(body.email);
    if (!u || body.password !== "correct-horse-1") return send(res, 400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
    if (!u.email_confirmed_at) return send(res, 400, { code: 400, error_code: "email_not_confirmed", msg: "Email not confirmed" });
    return send(res, 200, session(u));
  }
  if (p === "/auth/v1/user") { const u = authUser(req); if (!u) return send(res, 401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" }); return send(res, 200, u); }
  if (p === "/auth/v1/logout") { const id = sessionOfToken(req); if (id && url.searchParams.get("scope") === "global") { const u = authUser(req); for (const [k, v] of [...sessions]) if (u && v === u.id) revokeSession(k); } else if (id) revokeSession(id); return send(res, 204); }
  if (p === "/auth/v1/recover") return send(res, 200, {});

  // PostgREST
  const u = authUser(req);
  const isService = (req.headers.authorization || "").includes("service-key");
  if (p === "/rest/v1/rpc/early_adopter_available") return isService ? send(res, 200, true) : send(res, 401, { code: "42501", message: "permission denied" });
  if (p === "/rest/v1/rpc/early_adopter_state") return isService ? send(res, 200, "available") : send(res, 401, { code: "42501", message: "permission denied" });
  const rpcName = p.startsWith("/rest/v1/rpc/") ? p.slice("/rest/v1/rpc/".length) : null;
  if (rpcName === "early_bird_status") return isService ? send(res, 200, ebStatus()) : send(res, 401, { code: "42501", message: "permission denied" });
  if (rpcName && adminRpc[rpcName]) {
    if (!isService) return send(res, 401, { code: "42501", message: "permission denied" });
    if (!adminIds.has(body.p_admin)) return send(res, 403, { code: "42501", message: "not_admin" });
    return send(res, 200, adminRpc[rpcName](body));
  }
  if (rpcName === "register_active_session" || rpcName === "check_active_session" || rpcName === "release_active_session") {
    if (!isService) return send(res, 401, { code: "42501", message: "permission denied" });
    return send(res, 200, rpcName === "register_active_session" ? rpcSessions.register(body) : rpcName === "check_active_session" ? rpcSessions.check(body) : rpcSessions.release(body));
  }
  if (rpcName === "x_account_base_slots") return isService ? send(res, 200, 2) : send(res, 401, { code: "42501", message: "permission denied" });
  if (rpcName === "register_x_account") return isService ? send(res, 200, registerX(body)) : send(res, 401, { code: "42501", message: "permission denied for function register_x_account" });
  if (p === "/rest/v1/rpc/start_trial") {
    if (!isService) return send(res, 401, { code: "42501", message: "permission denied for function start_trial" });
    const uid = body.p_user_id;
    const xp = xprofiles.get(uid);
    if (!xp) return send(res, 400, { code: "P0001", message: "x_username_required" });
    if (trials.has(uid)) return send(res, 409, { code: "23505", message: 'duplicate key value violates unique constraint "trials_user_id_key"' });
    const norm = xp.x_username.toLowerCase();
    if (trialNames.has(norm)) return send(res, 409, { code: "23505", message: 'duplicate key value violates unique constraint "trials_x_username_key"' });
    const started = new Date(); const row = { id: "t" + uid, user_id: uid, x_username_normalized: norm, started_at: started.toISOString(), expires_at: new Date(started.getTime() + body.p_days * 864e5).toISOString(), status: "active" };
    trials.set(uid, row); trialNames.add(norm); return send(res, 200, row);
  }
  const table = p.replace("/rest/v1/", "");
  // trial: the server copies the first linked X account into x_profiles (service role upsert)
  if (isService && table === "x_profiles" && req.method === "POST") { for (const r of Array.isArray(body) ? body : [body]) xprofiles.set(r.user_id, { user_id: r.user_id, x_username: r.x_username }); return send(res, 201); }
  if (isService && req.method === "GET") {
    const eqId = (url.searchParams.get("user_id") || "").replace("eq.", "");
    if (table === "admins") return send(res, 200, adminIds.has(eqId) ? [{ user_id: eqId }] : []);
    if (table === "premium_gifts") return send(res, 200, gifts);
    if (table === "premium_gift_events") return send(res, 200, giftEvents);
    if (table === "early_bird_events") return send(res, 200, ebEvents);
    if (table === "profiles") { const ids = (url.searchParams.get("id") || "").replace(/^in\.\(|\)$/g, "").split(",").filter(Boolean); return send(res, 200, ids.map((id) => ({ id, email: emailOf(id) }))); }
    return send(res, 200, []); // health-check probes and empty tables
  }
  if (!u) return send(res, 401, { code: "PGRST301", message: "JWT required" });
  const missing = (t) => send(res, 404, { code: "PGRST205", message: `Could not find the table 'public.${t}' in the schema cache` });
  if (u.email.startsWith("brokendb")) return missing(table);
  if (u.email.startsWith("nopay") && table === "payments") return missing(table);
  const eqUser = (url.searchParams.get("user_id") || "").replace("eq.", "");
  if (eqUser && eqUser !== u.id) return send(res, 200, []); // RLS
  if (table === "trials") return send(res, 200, trials.has(u.id) ? [trials.get(u.id)] : []);
  if (["subscriptions", "payments", "checkout_orders", "subscription_details", "account_slot_grants"].includes(table)) return send(res, 200, []);
  if (table === "premium_gifts") return send(res, 200, gifts.filter((g) => g.user_id === u.id).map(({ status, starts_at, expires_at }) => ({ status, starts_at, expires_at })));
  if (table === "x_account_bindings") {
    if (req.method !== "GET") return send(res, 403, { code: "42501", message: "permission denied for table x_account_bindings" });
    const mine = [...xbindings.values()].filter((b) => b.user_id === u.id);
    const lim = Number(url.searchParams.get("limit") || 0);
    return send(res, 200, lim ? mine.slice(0, lim) : mine);
  }
  if (table === "x_profiles") {
    if (req.method === "GET") return send(res, 200, xprofiles.has(u.id) ? [xprofiles.get(u.id)] : []);
    if (req.method === "POST") { if (body.user_id !== u.id) return send(res, 403, { code: "42501", message: "rls" }); xprofiles.set(u.id, { user_id: u.id, x_username: body.x_username }); return send(res, 201); }
    if (req.method === "PATCH") { xprofiles.set(u.id, { user_id: u.id, x_username: body.x_username }); return send(res, 204); }
  }
  send(res, 404, { message: "not mocked: " + p });
}).listen(PORT, () => console.log("mock supabase on", PORT));
