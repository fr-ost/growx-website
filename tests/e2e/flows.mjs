// End-to-end browser checks against a production build wired to tests/e2e/mock-supabase.mjs.
// Run with: npm run test:e2e
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
const BASE = process.env.E2E_BASE_URL || "http://localhost:3113";
const OUT = new URL("./.output/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const executablePath = process.env.CHROMIUM_PATH || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const results = [];
const ok = (name, cond, extra = "") => { results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -- " + extra : ""}`); };
const b = await chromium.launch({ executablePath });

// ---------- public crawl, desktop + mobile
const pages = ["/", "/features", "/pricing", "/contact", "/privacy", "/terms", "/login", "/signup", "/forgot-password", "/does-not-exist"];
const links = new Set();
for (const [label, vp] of [["desktop", { width: 1366, height: 900 }], ["mobile", { width: 375, height: 780 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", (e) => errs.push(String(e)));
  for (const path of pages) {
    const r = await p.goto(BASE + path, { waitUntil: "networkidle" });
    const status = r.status();
    ok(`${label} ${path} status`, path === "/does-not-exist" ? status === 404 : status === 200, String(status));
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(`${label} ${path} no horizontal overflow`, overflow <= 0, `${overflow}px`);
    const h1 = await p.locator("h1").count();
    ok(`${label} ${path} has exactly one h1`, h1 === 1, String(h1));
    for (const href of await p.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")))) links.add(href.split("#")[0]);
    await p.screenshot({ path: OUT + `shot-${label}${path.replaceAll("/", "_") || "_home"}.png`, fullPage: true });
  }
  ok(`${label} no console errors on public pages`, errs.filter((e) => !e.includes("404")).length === 0, errs.join(" | ").slice(0, 300));
  await ctx.close();
}
// broken internal links
for (const l of links) {
  const r = await fetch(BASE + l, { redirect: "manual" });
  ok(`link ${l}`, [200, 307, 308].includes(r.status), String(r.status));
}

// ---------- mobile menu
{
  const p = await b.newPage({ viewport: { width: 375, height: 780 } });
  await p.goto(BASE + "/");
  await p.click("button[aria-controls]");
  ok("mobile menu opens", await p.locator('nav[aria-label="Mobile"]').isVisible());
  await p.click('nav[aria-label="Mobile"] >> text=Pricing');
  await p.waitForURL("**/pricing");
  ok("mobile menu navigates and closes", !(await p.locator('nav[aria-label="Mobile"]').isVisible()));
  await p.close();
}

// ---------- auth flows
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));

await p.goto(BASE + "/dashboard");
ok("dashboard redirects signed-out users to login", p.url().includes("/login?next=%2Fdashboard"), p.url());

await p.goto(BASE + "/signup");
await p.fill("#email", "not-an-email"); await p.fill("#password", "short");
await p.click("button[type=submit]");
await p.waitForSelector("#email-error");
ok("signup validation shows field errors", (await p.textContent("#email-error")).includes("valid email") && !!(await p.textContent("#password-error")));
ok("signup keeps typed email after error", (await p.inputValue("#email")) === "not-an-email");
await p.fill("#email", "newuser@example.com"); await p.fill("#password", "correct-horse-1");
await p.click("button[type=submit]");
await p.waitForSelector("text=Check your inbox");
ok("signup shows check-your-inbox", true);

await p.goto(BASE + "/login");
await p.fill("#email", "unconfirmed@example.com"); await p.fill("#password", "correct-horse-1");
await p.click("button[type=submit]"); await p.waitForSelector("[role=alert]");
ok("login: unconfirmed email message", (await p.textContent("[role=alert]")).includes("confirm your email"));

await p.fill("#email", "demo@example.com"); await p.fill("#password", "wrong-password-1");
await p.click("button[type=submit]"); await p.waitForTimeout(600);
ok("login: wrong password message", (await p.textContent("[role=alert]")).includes("Invalid email or password"));

await p.goto(BASE + "/login?next=//evil.com");
await p.fill("#email", "demo@example.com"); await p.fill("#password", "correct-horse-1");
await p.click("button[type=submit]");
await p.waitForURL("**/dashboard", { timeout: 15000 });
ok("login success -> dashboard (open redirect blocked)", new URL(p.url()).host === "localhost:3113" && p.url().endsWith("/dashboard"), p.url());
await p.locator("h1", { hasText: "Welcome" }).waitFor();
ok("dashboard welcome", true);
ok("header shows Dashboard when signed in", await p.locator("header >> text=Dashboard").first().isVisible());
ok("trial button disabled without username", await p.locator("button", { hasText: "Start my 14-day" }).isDisabled());
ok("new user without subscription sees the real Free plan", /current plan\s*free/i.test(await p.locator("main").innerText()));
ok("no data-error banner for a healthy account", !(await p.locator("text=could not be loaded").count()));

await p.fill("#x_username", "bad name!");
await p.click("button:has-text('Save username')");
await p.waitForSelector("text=Enter a valid X username");
ok("invalid X username rejected", true);
await p.fill("#x_username", "https://x.com/Demo_User");
await p.click("button:has-text('Save username')");
await p.waitForSelector("text=Saved.");
ok("X username saved from profile URL", true);
await p.reload();
ok("username persisted (normalised from URL)", (await p.inputValue("#x_username")) === "Demo_User", await p.inputValue("#x_username"));

const btn = p.locator("button", { hasText: "Start my 14-day" });
ok("trial button enabled after username", await btn.isEnabled());
await btn.click();
await p.waitForSelector("text=Your trial is active", { timeout: 15000 });
ok("trial started", true);
ok("plan shows Premium trial", await p.locator("text=Premium trial").first().isVisible());
ok("days-left ring shows 14", (await p.locator('[role=img][aria-label*="days of Premium left"]').getAttribute("aria-label")).startsWith("14"));

const ent = await p.evaluate(async () => (await fetch("/api/entitlement")).json());
ok("/api/entitlement returns TRIAL via cookie", ent.plan === "TRIAL" && ent.isPremium === true, JSON.stringify(ent).slice(0, 120));

await p.goto(BASE + "/account");
const seen = async (sel) => p.locator(sel).first().waitFor({ timeout: 10000 }).then(() => true, () => false);
ok("account page shows username", await seen("text=@Demo_User"));
ok("account page empty payments state", await seen("text=No payments yet"));

await p.click("button:has-text('Sign out')");
await p.waitForURL(BASE + "/");
await p.goto(BASE + "/account");
ok("signed out -> account redirects to login", p.url().includes("/login"), p.url());
const ent2 = await p.evaluate(async () => (await fetch("/api/entitlement")).status);
ok("/api/entitlement 401 after sign out", ent2 === 401, String(ent2));

// second account, same username -> trial refused
await p.goto(BASE + "/login");
await p.fill("#email", "other@example.com"); await p.fill("#password", "correct-horse-1");
await p.click("button[type=submit]"); await p.waitForURL("**/dashboard");
await p.fill("#x_username", "demo_user"); await p.click("button:has-text('Save username')"); await p.waitForSelector("text=Saved.");
await p.reload();
await p.locator("button", { hasText: "Start my 14-day" }).click();
await p.waitForSelector("text=already been used with this X username");
ok("second account with same username refused", true);

// broken database: sections fail independently with diagnostics, page still works
{
  const bctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const bp = await bctx.newPage();
  const berrs = []; bp.on("pageerror", (e) => berrs.push(String(e)));
  await bp.goto(BASE + "/login");
  await bp.fill("#email", "brokendb@example.com"); await bp.fill("#password", "correct-horse-1");
  await bp.click("button[type=submit]"); await bp.waitForURL("**/dashboard");
  await bp.locator("h1", { hasText: "Welcome" }).waitFor();
  const body = await bp.locator("main").innerText();
  if (process.env.E2E_DEBUG) console.log("DASH:", body.slice(0, 1500));
  ok("broken DB: dashboard shows actionable banner", body.includes("Some of your account data could not be loaded") && body.includes("migrations have not been applied"));
  ok("broken DB: banner names query + code", body.includes("trials/table_missing (PGRST205)") && body.includes("x_profiles/table_missing"));
  ok("broken DB: no fake plan shown", !/current plan/i.test(body) && body.includes("Your plan could not be loaded"));
  await bp.goto(BASE + "/account");
  await bp.locator("h1", { hasText: "Account" }).waitFor();
  const acc = await bp.locator("main").innerText();
  ok("broken DB: account shows plan + payments diagnostics", acc.includes("Could not load your plan") && acc.includes("Could not load payments") && acc.includes("payments/table_missing"));
  ok("broken DB: no runtime errors", berrs.length === 0, berrs.join(" | "));
  await bctx.close();

  const nctx = await b.newContext();
  const np = await nctx.newPage();
  await np.goto(BASE + "/login");
  await np.fill("#email", "nopay@example.com"); await np.fill("#password", "correct-horse-1");
  await np.click("button[type=submit]"); await np.waitForURL("**/dashboard");
  await np.goto(BASE + "/account");
  await np.locator("h1", { hasText: "Account" }).waitFor();
  const na = await np.locator("main").innerText();
  if (process.env.E2E_DEBUG) console.log("ACC:", na.slice(0, 1500));
  ok("optional failure (payments) does not hide the plan", na.includes("Could not load payments") && /current plan/i.test(na) && /free/i.test(na) && !na.includes("Could not load your plan"), na.slice(0, 200));
  await nctx.close();
}

// health check reports every object
const health = await (await fetch(BASE + "/api/health")).json();
ok("health reports all tables and functions ok", health.ok === true && Object.values(health.tables).every((s) => s === "ok") && health.functions.start_trial === "ok", JSON.stringify(health).slice(0, 200));

// signed-in visiting /login goes to dashboard
await p.goto(BASE + "/login");
ok("signed-in /login -> dashboard", p.url().endsWith("/dashboard"), p.url());

// forgot password
const p2 = await (await b.newContext()).newPage();
await p2.goto(BASE + "/forgot-password");
await p2.fill("#email", "demo@example.com"); await p2.click("button[type=submit]");
await p2.waitForSelector("text=reset link is on its way");
ok("forgot password success", true);
await p2.goto(BASE + "/reset-password");
ok("reset-password requires a session", p2.url().includes("/login"), p2.url());

// confirm-disabled signup path
await p2.goto(BASE + "/signup");
await p2.fill("#email", "instant@example.com"); await p2.fill("#password", "correct-horse-1");
await p2.click("button[type=submit]"); await p2.waitForURL("**/dashboard", { timeout: 15000 });
ok("signup without email confirmation -> dashboard", true);

// callback errors (fresh, signed-out browser)
const p3 = await (await b.newContext()).newPage();
await p3.goto(BASE + "/auth/callback?error=access_denied&error_code=otp_expired");
ok("expired email link -> friendly message", (await p3.locator("main").innerText()).includes("expired"), p3.url());
const r404 = await fetch(BASE + "/reset-password", { redirect: "manual" });
ok("reset-password signed-out is an HTTP redirect", r404.status === 307, String(r404.status));
await p2.goto(BASE + "/auth/callback?error=access_denied&error_code=otp_expired");
ok("signed-in user hitting an old link lands on dashboard", p2.url().endsWith("/dashboard"), p2.url());

// signout CSRF
const cs = await fetch(BASE + "/auth/signout", { method: "POST", headers: { origin: "https://evil.example" }, redirect: "manual" });
ok("cross-site signout blocked", cs.status === 403, String(cs.status));

ok("no runtime page errors in auth flows", errs.length === 0, errs.join(" | ").slice(0, 300));
await b.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
