// Minimal Supabase (GoTrue + PostgREST) mock for local end-to-end testing.
import http from "node:http";
const PORT = Number(process.env.PORT || 54321);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const users = new Map(); // email -> user
const tokens = new Map(); // token -> email
const xprofiles = new Map(); // uid -> row
const trials = new Map(); // uid -> row
const trialNames = new Set();
let n = 0;
const log = [];

function mkUser(email, confirmed) {
  const u = { id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`, aud: "authenticated", role: "authenticated", email,
    email_confirmed_at: confirmed ? new Date().toISOString() : null, created_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [{ id: "i", provider: "email" }] };
  users.set(email, u); return u;
}
function session(u) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const t = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: u.id, email: u.email, aud: "authenticated", role: "authenticated", exp, iat: exp - 3600, session_id: "s" + n })}.sig`;
  tokens.set(t, u.email);
  return { access_token: t, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r_" + u.email, user: u };
}
mkUser("demo@example.com", true);
mkUser("unconfirmed@example.com", false);
mkUser("other@example.com", true);

const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json" }); res.end(body === undefined ? "" : JSON.stringify(body)); };
const authUser = (req) => { const m = (req.headers.authorization || "").match(/^Bearer (.+)$/); const e = m && tokens.get(m[1]); return e ? users.get(e) : null; };

http.createServer(async (req, res) => {
  let raw = ""; for await (const c of req) raw += c;
  const body = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  log.push(`${req.method} ${p}${url.search}`);
  if (p === "/__log") return send(res, 200, log);
  if (p === "/auth/v1/health") return send(res, 200, { name: "GoTrue" });
  if (p === "/auth/v1/signup" && req.method === "POST") {
    if (users.has(body.email)) return send(res, 200, { ...users.get(body.email), identities: [] });
    const u = mkUser(body.email, body.email.startsWith("instant"));
    return send(res, 200, u.email_confirmed_at ? session(u) : u);
  }
  if (p === "/auth/v1/token") {
    const gt = url.searchParams.get("grant_type");
    if (gt === "refresh_token") { const e = String(body.refresh_token).slice(2); return users.has(e) ? send(res, 200, session(users.get(e))) : send(res, 400, { error_code: "refresh_token_not_found", msg: "bad" }); }
    const u = users.get(body.email);
    if (!u || body.password !== "correct-horse-1") return send(res, 400, { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" });
    if (!u.email_confirmed_at) return send(res, 400, { code: 400, error_code: "email_not_confirmed", msg: "Email not confirmed" });
    return send(res, 200, session(u));
  }
  if (p === "/auth/v1/user") { const u = authUser(req); if (!u) return send(res, 401, { code: 401, error_code: "bad_jwt", msg: "invalid JWT" }); return send(res, 200, u); }
  if (p === "/auth/v1/logout") return send(res, 204);
  if (p === "/auth/v1/recover") return send(res, 200, {});

  // PostgREST
  const u = authUser(req);
  const isService = (req.headers.authorization || "").includes("service-key");
  if (p === "/rest/v1/rpc/early_adopter_available") return isService ? send(res, 200, true) : send(res, 401, { code: "42501", message: "permission denied" });
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
  if (!u) return send(res, 401, { code: "PGRST301", message: "JWT required" });
  const eqUser = (url.searchParams.get("user_id") || "").replace("eq.", "");
  if (eqUser && eqUser !== u.id) return send(res, 200, []); // RLS
  if (table === "trials") return send(res, 200, trials.has(u.id) ? [trials.get(u.id)] : []);
  if (table === "subscriptions" || table === "payments") return send(res, 200, []);
  if (table === "x_profiles") {
    if (req.method === "GET") return send(res, 200, xprofiles.has(u.id) ? [xprofiles.get(u.id)] : []);
    if (req.method === "POST") { if (body.user_id !== u.id) return send(res, 403, { code: "42501", message: "rls" }); xprofiles.set(u.id, { user_id: u.id, x_username: body.x_username }); return send(res, 201); }
    if (req.method === "PATCH") { xprofiles.set(u.id, { user_id: u.id, x_username: body.x_username }); return send(res, 204); }
  }
  send(res, 404, { message: "not mocked: " + p });
}).listen(PORT, () => console.log("mock supabase on", PORT));
