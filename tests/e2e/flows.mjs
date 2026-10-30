// End-to-end browser checks against a production build wired to tests/e2e/mock-supabase.mjs.
// Run with: npm run test:e2e
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
const BASE = process.env.E2E_BASE_URL || "http://localhost:3113";
const OUT = new URL("./.output/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const executablePath = process.env.CHROMIUM_PATH || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const results = [];
const ok = (name, cond, extra = "") => { results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -- " + extra : ""}`); };
const b = await chromium.launch({ executablePath });

// ---------- public crawl, desktop + mobile
const pages = ["/", "/features", "/features/twitter-auto-follow", "/features/twitter-post-scheduler", "/features/ai-tweet-writer", "/features/twitter-analytics", "/features/twitter-unfollower-tracker", "/features/twitter-unfollow-tool", "/features/twitter-reply-targets", "/tools", "/tools/tweet-character-counter", "/tools/twitter-thread-maker", "/tools/twitter-engagement-rate-calculator", "/tools/twitter-follower-ratio-calculator", "/tools/twitter-bold-text-generator", "/tools/tweet-templates", "/tools/twitter-bio-generator", "/press", "/how-it-works", "/pricing", "/about", "/blog", "/blog/how-growx-auto-follow-works", "/blog/growx-features-guide-scoring-filters-cleanup", "/blog/growx-potential-best-practices-roadmap", "/blog/how-to-schedule-tweets", "/blog/who-unfollowed-me-on-twitter", "/blog/twitter-algorithm-explained", "/blog/twitter-bio-ideas", "/contact", "/privacy", "/terms", "/refund-policy", "/login", "/signup", "/forgot-password", "/does-not-exist"];
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


// ---------- SEO audit (rendered HTML, as a crawler sees it)
{
  const SEO_PAGES = ["/", "/features", "/features/twitter-auto-follow", "/features/twitter-post-scheduler", "/features/ai-tweet-writer", "/features/twitter-analytics", "/features/twitter-unfollower-tracker", "/features/twitter-unfollow-tool", "/features/twitter-reply-targets", "/tools", "/tools/tweet-character-counter", "/tools/twitter-thread-maker", "/tools/twitter-engagement-rate-calculator", "/tools/twitter-follower-ratio-calculator", "/tools/twitter-bold-text-generator", "/tools/tweet-templates", "/tools/twitter-bio-generator", "/press", "/how-it-works", "/pricing", "/about", "/blog", "/blog/how-growx-auto-follow-works", "/blog/growx-features-guide-scoring-filters-cleanup", "/blog/growx-potential-best-practices-roadmap", "/blog/how-to-schedule-tweets", "/blog/best-time-to-post-on-twitter", "/blog/how-to-write-a-twitter-thread", "/blog/ai-tweet-writer-growx-ai", "/blog/who-unfollowed-me-on-twitter", "/blog/twitter-analytics-guide", "/blog/twitter-reply-strategy", "/blog/how-to-increase-twitter-engagement", "/blog/twitter-algorithm-explained", "/blog/how-to-go-viral-on-twitter", "/blog/how-often-to-post-on-twitter", "/blog/tweet-ideas", "/blog/twitter-hashtags-guide", "/blog/twitter-bio-ideas", "/blog/twitter-shadowban", "/blog/follow-for-follow-twitter", "/blog/twitter-follower-ratio", "/blog/twitter-lists-guide", "/contact"];
  const titles = new Set(), descs = new Set();
  const sp = await b.newPage();
  for (const path of SEO_PAGES) {
    await sp.goto(BASE + path, { waitUntil: "networkidle" });
    const m = await sp.evaluate(() => {
      const q = (s, a) => document.querySelector(s)?.getAttribute(a) ?? null;
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((n) => { try { return JSON.parse(n.textContent); } catch { return null; } });
      return {
        title: document.title, desc: q('meta[name="description"]', "content"), canonical: q('link[rel="canonical"]', "href"),
        ogTitle: q('meta[property="og:title"]', "content"), ogDesc: q('meta[property="og:description"]', "content"), ogImage: q('meta[property="og:image"]', "content"),
        ogUrl: q('meta[property="og:url"]', "content"), twCard: q('meta[name="twitter:card"]', "content"), robots: q('meta[name="robots"]', "content"),
        lang: document.documentElement.lang, h1: document.querySelectorAll("h1").length, h2: document.querySelectorAll("h2").length,
        imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        ld: ld.flat().map((x) => x && x["@type"]),
        ldBad: ld.some((x) => x === null),
        words: (document.querySelector("main")?.innerText ?? "").split(/\s+/).length,
      };
    });
    const t = `SEO ${path}`;
    ok(`${t}: title 20-65 chars`, m.title.length >= 20 && m.title.length <= 65, `${m.title.length}: ${m.title}`);
    ok(`${t}: description 110-165 chars`, m.desc && m.desc.length >= 110 && m.desc.length <= 165, String(m.desc?.length));
    ok(`${t}: canonical is absolute https www.growxapp.org`, m.canonical?.startsWith("https://www.growxapp.org"), String(m.canonical));
    ok(`${t}: canonical matches path`, new URL(m.canonical).pathname === path, m.canonical);
    ok(`${t}: Open Graph title/description/url/image`, !!(m.ogTitle && m.ogDesc && m.ogUrl && m.ogImage), JSON.stringify([!!m.ogTitle, !!m.ogDesc, !!m.ogUrl, !!m.ogImage]));
    ok(`${t}: twitter large card`, m.twCard === "summary_large_image", String(m.twCard));
    ok(`${t}: indexable`, !/noindex/.test(m.robots ?? ""), String(m.robots));
    ok(`${t}: html lang=en, one h1, h2s present`, m.lang === "en" && m.h1 === 1 && m.h2 >= 1, JSON.stringify([m.lang, m.h1, m.h2]));
    ok(`${t}: images have alt`, m.imgsNoAlt === 0, String(m.imgsNoAlt));
    ok(`${t}: JSON-LD parses and includes Organization`, !m.ldBad && m.ld.includes("Organization"), JSON.stringify(m.ld));
    ok(`${t}: unique title and description`, !titles.has(m.title) && !descs.has(m.desc), m.title);
    titles.add(m.title); descs.add(m.desc);
    if (path.startsWith("/blog/") ) ok(`${t}: article has BlogPosting + breadcrumb + 900+ words`, m.ld.includes("BlogPosting") && m.ld.includes("BreadcrumbList") && m.words > 900, `${m.words} words`);
    if (path === "/") ok(`${t}: SoftwareApplication + FAQPage`, m.ld.includes("SoftwareApplication") && m.ld.includes("FAQPage"));
    if (path === "/how-it-works") ok(`${t}: HowTo + FAQPage`, m.ld.includes("HowTo") && m.ld.includes("FAQPage"));
    if (path.startsWith("/features/")) ok(`${t}: feature page has WebPage + FAQPage + breadcrumb + 700+ words`, m.ld.includes("WebPage") && m.ld.includes("FAQPage") && m.ld.includes("BreadcrumbList") && m.words > 700, `${m.words} words`);
    if (path.startsWith("/tools/")) ok(`${t}: tool page has WebApplication + FAQPage`, m.ld.includes("WebApplication") && m.ld.includes("FAQPage"));
  }
  const noidx = await b.newPage();
  for (const path of ["/login", "/signup", "/forgot-password"]) {
    await noidx.goto(BASE + path, { waitUntil: "networkidle" });
    ok(`SEO ${path}: noindex`, /noindex/.test(await noidx.locator('meta[name="robots"]').getAttribute("content")));
  }
  const txt = async (p) => (await fetch(BASE + p)).text();
  const robots = await txt("/robots.txt");
  ok("robots.txt allows crawling and lists sitemap", /Allow: \//.test(robots) && /Sitemap: https:\/\/www\.growxapp\.org\/sitemap\.xml/.test(robots) && /Disallow: \/dashboard/.test(robots), robots.slice(0, 160));
  const sm = await txt("/sitemap.xml");
  ok("sitemap.xml lists pages and all posts", ["/how-it-works", "/about", "/press", "/features/twitter-post-scheduler", "/tools/tweet-character-counter", "/tools/twitter-bold-text-generator", "/tools/tweet-templates", "/blog/twitter-shadowban", "/blog/how-growx-auto-follow-works", "/blog/how-to-schedule-tweets", "/blog/who-unfollowed-me-on-twitter"].every((u) => sm.includes("https://www.growxapp.org" + u)) && !sm.includes("/dashboard") && !sm.includes("/login"));
  const llms = await fetch(BASE + "/llms.txt");
  const llmsText = await llms.text();
  ok("llms.txt served as text with features and guides", llms.status === 200 && (llms.headers.get("content-type") ?? "").includes("text/plain") && llmsText.includes("/features/twitter-post-scheduler") && llmsText.includes("/blog/how-to-schedule-tweets"));
  const feed = await fetch(BASE + "/blog/feed.xml");
  ok("RSS feed served as XML", feed.status === 200 && (feed.headers.get("content-type") ?? "").includes("xml"));
  const og = await fetch(BASE + "/blog/how-growx-auto-follow-works/opengraph-image");
  ok("per-post Open Graph image renders (png)", og.status === 200 && (og.headers.get("content-type") ?? "").includes("image/png"), og.status + " " + og.headers.get("content-type"));
  const mf = await fetch(BASE + "/manifest.webmanifest");
  ok("web manifest served", mf.status === 200);
  // Mahfuz removed from every rendered page
  let leftovers = [];
  for (const path of ["/", "/contact", "/about", "/privacy", "/terms", "/blog"]) { if (/mahfuz|allum/i.test(await txt(path))) leftovers.push(path); }
  ok("no mention of removed contributor on any page", leftovers.length === 0, leftovers.join(","));
  await sp.close(); await noidx.close();
}

// ---------- mobile menu
{
  const p = await b.newPage({ viewport: { width: 375, height: 780 } });
  await p.goto(BASE + "/");
  await p.click("button[data-menu-toggle]");
  ok("mobile menu opens", await p.locator('nav[aria-label="Mobile"]').isVisible());
  await p.click('nav[aria-label="Mobile"] >> text=Pricing');
  await p.waitForURL("**/pricing");
  ok("mobile menu navigates and closes", !(await p.locator('nav[aria-label="Mobile"]').isVisible()));
  await p.close();
}

// ---------- features menu + free tools
{
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  await p.goto(BASE + "/");
  await p.hover('nav[aria-label="Main"] button');
  ok("features menu opens on hover", await p.locator('nav[aria-label="Main"] a[href="/features/twitter-post-scheduler"]').isVisible());
  await p.click('nav[aria-label="Main"] a[href="/features/twitter-post-scheduler"]');
  await p.waitForURL("**/features/twitter-post-scheduler");
  ok("features menu navigates to a feature page", (await p.locator("h1").innerText()).toLowerCase().includes("scheduler"));

  await p.goto(BASE + "/tools/tweet-character-counter", { waitUntil: "networkidle" });
  await p.fill("#cc-text", "Hello 😀 https://www.growxapp.org/a/very/long/link/that/counts/as/twenty-three");
  const cc = await p.locator("main").innerText();
  ok("character counter counts like X (9 + 23 for the link = 32)", /\b32\s*\/\s*280/.test(cc) && cc.includes("248 characters left"), cc.slice(0, 400));

  await p.goto(BASE + "/tools/twitter-thread-maker", { waitUntil: "networkidle" });
  await p.fill("#tm-text", "First part\n---\nSecond part");
  const tm = await p.locator("main").innerText();
  await p.goto(BASE + "/tools/twitter-engagement-rate-calculator", { waitUntil: "networkidle" });
  for (const [id, v] of [["er-views", "2,000"], ["er-likes", "40"], ["er-reposts", "5"], ["er-replies", "3"], ["er-bookmarks", "2"]]) await p.fill(`#${id}`, v);
  const er = await p.locator("main").innerText();
  ok("engagement rate calculator: 50 interactions / 2,000 views = 2.50%", er.includes("2.50%") && er.includes("50 interactions per 2,000 views"), er.slice(0, 300));

  await p.goto(BASE + "/tools/twitter-follower-ratio-calculator", { waitUntil: "networkidle" });
  await p.fill("#fr-followers", "1,000");
  await p.fill("#fr-following", "1500");
  const fr = (await p.locator("main").innerText()).replace(/\s+/g, " ");
  ok("follower ratio calculator: cap 5,000 and 3,500 room left", /Estimated following cap 5,000/i.test(fr) && /Room left to follow 3,500/i.test(fr), fr.slice(0, 400));

  await p.goto(BASE + "/tools/twitter-bold-text-generator", { waitUntil: "networkidle" });
  await p.fill("#bt-text", "Hi 1");
  ok("bold text generator shows bold letters and digits", (await p.locator('[data-style="bold"]').innerText()).includes("𝐇𝐢 𝟏"));

  await p.goto(BASE + "/tools/tweet-templates", { waitUntil: "networkidle" });
  ok("tweet templates: all 52 listed", (await p.locator('[data-testid="template-list"] > li').count()) === 52);
  await p.click('button[aria-pressed]:has-text("Questions")');
  ok("tweet templates: category filter", (await p.locator('[data-testid="template-list"] > li').count()) === 5);
  await p.locator('[data-testid="template-list"] > li', { hasText: "Your best advice" }).locator("button", { hasText: "Fill in" }).click();
  await p.locator('[data-testid="template-list"] input').first().fill("cold email");
  ok("tweet templates: fill-in shows the finished post", (await p.locator('[data-testid="template-list"]').innerText()).includes("What's the best advice you've ever gotten about cold email?"));

  await p.goto(BASE + "/tools/twitter-bio-generator", { waitUntil: "networkidle" });
  await p.fill("#bio-role", "Founder of Acme");
  await p.fill("#bio-audience", "indie hackers");
  await p.fill("#bio-benefit", "ship faster");
  ok("bio generator: builds bios with a 160 limit", (await p.locator('[data-testid="bio-list"]').innerText()).includes("Founder of Acme, helping indie hackers ship faster.") && (await p.locator('[data-testid="bio-list"]').innerText()).includes("/ 160"));

  ok("thread maker splits at --- and numbers posts", tm.includes("First part 1/2") && tm.includes("Second part 2/2") && tm.includes("(2 posts)"), tm.slice(0, 300));
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
ok("trial button disabled until an X account is linked", await p.locator("button", { hasText: "Start my 30-day" }).isDisabled() && (await p.locator("main").innerText()).includes("Link your X account below first"));
ok("new user without subscription sees the real Free plan", /current plan\s*free/i.test(await p.locator("main").innerText()));
ok("no data-error banner for a healthy account", !(await p.locator("text=could not be loaded").count()));
ok("one page: no Account tab or link, no editable username form", (await p.locator('a[href="/account"]').count()) === 0 && (await p.locator("#x_username").count()) === 0 && !(await p.locator("button:has-text('Save username')").count()));
{
  const h2 = await p.locator("main h2").allInnerTexts();
  ok("one page: plan, X accounts, payments and account sections", ["Your plan", "X accounts", "Payments & invoices", "Account"].every((t) => h2.some((h) => h.trim() === t)), JSON.stringify(h2));
}
ok("empty payments state", (await p.locator("main").innerText()).includes("No payments yet"));
ok("old /account link lands on the dashboard", (await p.goto(BASE + "/account"), p.url().endsWith("/dashboard")), p.url());

// ---------- X Accounts: permanent bindings with explicit confirmation
const xa = () => p.locator("#x-accounts");
ok("X Accounts: 2 free slots, none used", /Slots used\s*0 of 2/i.test(await xa().innerText()) && /Included free\s*2/i.test(await xa().innerText()));
ok("X Accounts: permanence explained", /cannot be changed or removed from this page/.test(await xa().innerText()) && /contact support/i.test(await xa().innerText()));
ok("X Accounts: nothing linked yet", /No X usernames linked yet/.test(await xa().innerText()));
await p.fill("#x_account_username", "bad name!");
await p.click("button:has-text('Review and link')");
await p.waitForSelector("text=Enter a valid X username");
ok("invalid X username rejected", true);
await p.fill("#x_account_username", "@Demo_User");
await p.click("button:has-text('Review and link')");
await p.waitForSelector("text=Permanently link @Demo_User?");
ok("X Accounts: confirmation step before linking", await p.locator("button:has-text('Link @Demo_User permanently')").isDisabled());
ok("X Accounts: nothing linked before confirmation", (await p.evaluate(async () => (await fetch("/api/x-accounts")).json())).usedAccountSlots === 0);
await p.locator("#x-accounts input[type=checkbox]").check();
await p.click("button:has-text('Link @Demo_User permanently')");
await p.waitForSelector("text=is now permanently linked");
await p.locator("#x-accounts li", { hasText: "@Demo_User" }).waitFor({ timeout: 10000 });
ok("X Accounts: linked and listed as permanent", /Linked permanently/.test(await xa().innerText()) && /Slots used\s*1 of 2/i.test(await xa().innerText()));

const btn = p.locator("button", { hasText: "Start my 30-day" });
await p.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("Start my 30-day") && !b.disabled), null, { timeout: 10000 }).catch(() => {});
ok("trial button enabled after linking an X account", await btn.isEnabled());
await btn.click();
await p.waitForSelector("text=Your trial is active", { timeout: 15000 });
ok("trial started", true);
await p.reload();
{ await p.locator("main", { hasText: "Premium trial" }).waitFor({ timeout: 10000 }).catch(() => {}); const mt = await p.locator("main").innerText(); ok("plan shows Premium trial", /Premium trial/.test(mt) && (await p.locator("button", { hasText: "Start my 30-day" }).count()) === 0, mt.slice(0, 400).replace(/\s+/g, " ")); }
ok("days-left ring shows 30", (await p.locator('[role=img][aria-label*="days of Premium left"]').getAttribute("aria-label")).startsWith("30"));
const ent = await p.evaluate(async () => (await fetch("/api/entitlement")).json());
ok("/api/entitlement returns TRIAL via cookie", ent.plan === "TRIAL" && ent.isPremium === true, JSON.stringify(ent).slice(0, 120));
await p.fill("#x_account_username", "@Second_Acct");
await p.click("button:has-text('Review and link')");
await p.locator("#x-accounts input[type=checkbox]").check();
await p.click("button:has-text('Link @Second_Acct permanently')");
await p.locator("#x-accounts li", { hasText: "@Second_Acct" }).waitFor({ timeout: 10000 });
await p.locator("text=All your X account slots are in use").waitFor({ timeout: 10000 });
ok("X Accounts: at capacity the add form is replaced by the slot purchase option", (await p.locator("#x_account_username").count()) === 0 && /\$0\.99/.test(await xa().innerText()));
const xApi = await p.evaluate(async () => {
  const j = (m, b) => fetch("/api/x-accounts", { method: m, headers: { "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined }).then(async (r) => [r.status, await r.json()]);
  return { third: await j("POST", { username: "third_acct", confirm: true }), noConfirm: await j("POST", { username: "third_acct" }), patch: await j("PATCH", { username: "x" }), del: await j("DELETE"), slots: await j("POST", { username: "x", confirm: true, allowedAccountSlots: 9 }), ent: await (await fetch("/api/entitlement")).json() };
});
ok("X Accounts API: third username refused without a slot", xApi.third[0] === 409 && xApi.third[1].error.code === "no_slot_available", JSON.stringify(xApi.third));
ok("X Accounts API: confirmation required", xApi.noConfirm[0] === 400 && xApi.noConfirm[1].error.code === "confirmation_required");
ok("X Accounts API: change/remove refused (405)", xApi.patch[0] === 405 && xApi.del[0] === 405);
ok("X Accounts API: client slot counts rejected", xApi.slots[0] === 400);
ok("entitlement lists linked X accounts and slots", JSON.stringify(xApi.ent.linkedXAccounts) === JSON.stringify([{ username: "Demo_User", normalizedUsername: "demo_user" }, { username: "Second_Acct", normalizedUsername: "second_acct" }]) && xApi.ent.allowedAccountSlots === 2 && xApi.ent.availableAccountSlots === 0 && xApi.ent.plan === "TRIAL", JSON.stringify(xApi.ent).slice(0, 300));
await p.reload(); await p.screenshot({ path: OUT + "shot-dashboard.png", fullPage: true });

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
await p.fill("#x_account_username", "@DEMO_USER");
await p.click("button:has-text('Review and link')");
await p.locator("#x-accounts input[type=checkbox]").check();
await p.click("button:has-text('Link @DEMO_USER permanently')");
await p.waitForSelector("text=This X username is already linked to another GrowX account.");
ok("X Accounts: a username linked to another account is refused (any case/@), nothing revealed", !/demo@example\.com/.test(await p.locator("main").innerText()) && /No X usernames linked yet/.test(await p.locator("#x-accounts").innerText()));

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
  ok("broken DB: banner names query + code", body.includes("trials/table_missing (PGRST205)") && body.includes("payments/table_missing"));
  ok("broken DB: no fake plan shown", !/current plan/i.test(body) && body.includes("Your plan could not be loaded") && body.includes("Payments could not be loaded"));
  ok("broken DB: no runtime errors", berrs.length === 0, berrs.join(" | "));
  await bctx.close();

  const nctx = await b.newContext();
  const np = await nctx.newPage();
  await np.goto(BASE + "/login");
  await np.fill("#email", "nopay@example.com"); await np.fill("#password", "correct-horse-1");
  await np.click("button[type=submit]"); await np.waitForURL("**/dashboard");
  await np.locator("h1", { hasText: "Welcome" }).waitFor();
  const na = await np.locator("main").innerText();
  if (process.env.E2E_DEBUG) console.log("DASH:", na.slice(0, 1500));
  ok("optional failure (payments) does not hide the plan", na.includes("Payments could not be loaded") && /current plan/i.test(na) && /free/i.test(na) && !na.includes("Your plan could not be loaded"), na.slice(0, 200));
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

// ---------- single active login per account
{
  const MOCK = "http://localhost:54321";
  const state = async () => (await fetch(MOCK + "/__state")).json();
  const login = async (page, email) => {
    await page.goto(BASE + "/login");
    await page.fill("#email", email); await page.fill("#password", "correct-horse-1");
    await page.click("button[type=submit]"); await page.waitForURL("**/dashboard", { timeout: 15000 });
  };
  const bearerLogin = async (email) => { // what the extension does: sign in against Supabase directly, then register
    const r = await (await fetch(MOCK + "/auth/v1/token?grant_type=password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: "correct-horse-1" }) })).json();
    return { token: r.access_token, refresh: r.refresh_token };
  };
  const api = (token, path, method = "GET") => fetch(BASE + path, { method, headers: { authorization: `Bearer ${token}` } });
  const code = async (r) => (await r.json()).error?.code;

  // website: device A, then device B, same account
  const devA = await (await b.newContext()).newPage(), devB = await (await b.newContext()).newPage(), other = await (await b.newContext()).newPage();
  await login(devA, "other@example.com");
  await login(other, "instant@example.com");
  ok("device A is signed in and can use protected pages", (await devA.goto(BASE + "/dashboard")).status() === 200 && devA.url().endsWith("/dashboard"));
  await login(devB, "other@example.com");
  ok("device B (same account) becomes the active session", devB.url().endsWith("/dashboard"));
  await devA.goto(BASE + "/dashboard");
  await devA.waitForURL("**/login**", { timeout: 15000 }).catch(() => {});
  ok("device A is signed out and told why", devA.url().includes("/login") && devA.url().includes("error=session_replaced"), devA.url());
  ok("device A sees the 'signed in on another device' message", (await devA.locator("main").innerText()).includes("signed in on another device"));
  await devA.goto(BASE + "/account");
  await devA.waitForURL("**/login**", { timeout: 15000 }).catch(() => {});
  ok("device A cannot get back in with its old cookies", devA.url().includes("/login"), devA.url());
  await devB.goto(BASE + "/dashboard");
  ok("device B stays signed in", devB.url().endsWith("/dashboard"));
  await other.goto(BASE + "/dashboard");
  ok("an unrelated user's session is unaffected", other.url().endsWith("/dashboard"));
  const st = await state();
  ok("exactly one live web session remains for the replaced account (the new one)", st.sessions.filter(([, u]) => u === "00000000-0000-4000-8000-000000000003").length === 1 && st.active.some(([k]) => k === "00000000-0000-4000-8000-000000000003:web"), JSON.stringify(st.active));
  // device A signs in again on purpose: it becomes active and B is the one replaced
  await login(devA, "other@example.com");
  await devB.goto(BASE + "/dashboard");
  await devB.waitForURL("**/login**", { timeout: 15000 }).catch(() => {});
  ok("logging in again on A replaces B (last login wins)", devB.url().includes("error=session_replaced"), devB.url());
  // explicit logout leaves no way back
  await devA.click("button:has-text('Sign out')"); await devA.waitForURL(BASE + "/");
  await devA.goto(BASE + "/account");
  ok("explicit logout ends the session", devA.url().includes("/login"));

  // extension-style API clients (Bearer tokens)
  const x1 = await bearerLogin("demo@example.com");
  ok("unregistered pre-existing token: first check claims the slot (rollout rule) and passes", (await api(x1.token, "/api/session")).status === 200);
  const reg1 = await api(x1.token, "/api/session", "POST");
  ok("extension registers its session after login", reg1.status === 200 && (await reg1.json()).client === "extension");
  const ent1 = await api(x1.token, "/api/entitlement");
  ok("active extension session gets its entitlement", ent1.status === 200 && ["FREE", "TRIAL"].includes((await ent1.json()).plan));
  const x2 = await bearerLogin("demo@example.com");
  ok("second extension login registers and revokes the first", (await api(x2.token, "/api/session", "POST")).status === 200);
  const old = await api(x1.token, "/api/session");
  ok("old extension session gets a definitive 401 session_revoked", old.status === 401 && (await code(old)) === "session_revoked");
  const oldEnt = await api(x1.token, "/api/entitlement");
  ok("old extension session cannot read entitlement with its still-valid token", oldEnt.status === 401 && (await code(oldEnt)) === "session_revoked");
  ok("old extension session cannot re-register itself", (await code(await api(x1.token, "/api/session", "POST"))) === "session_revoked");
  const refreshOld = await fetch(MOCK + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ refresh_token: x1.refresh }) });
  ok("the revoked session's refresh token no longer works", refreshOld.status === 400);
  ok("new extension session remains valid", (await api(x2.token, "/api/session")).status === 200 && (await api(x2.token, "/api/entitlement")).status === 200);
  ok("website logins do not log the extension out (separate slots)", await (async () => { const w = await (await b.newContext()).newPage(); await login(w, "demo@example.com"); return (await api(x2.token, "/api/session")).status === 200; })());
  ok("extension logout revokes its session", (await api(x2.token, "/api/session", "DELETE")).status === 200 && (await code(await api(x2.token, "/api/session"))) === "session_revoked");
  ok("bad / missing tokens are plain 401 unauthenticated, not 'revoked'", (await code(await api("x.y.z", "/api/session"))) === "unauthenticated" && (await code(await fetch(BASE + "/api/session"))) === "unauthenticated");
  ok("cross-site cookie POST to /api/session is refused", (await fetch(BASE + "/api/session", { method: "POST", headers: { origin: "https://evil.example" } })).status !== 200);
  for (const pg of [devA, devB, other]) await pg.context().close();
}

// ---------- billing: nothing is configured in this environment, so checkout must be unavailable
{
  const opt = await (await fetch(BASE + "/api/billing/options")).json();
  ok("billing options: no provider available when unconfigured", opt.crypto.available === false && opt.earlyBird.state === "off", JSON.stringify(opt).slice(0, 200));
  ok("billing options expose no keys, price ids or counts", !/pri_|apikey|secret|email|user_id/i.test(JSON.stringify(opt)));
  for (const path of ["/api/billing/crypto/checkout"]) {
    const r = await fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ product: "PRO_LIFETIME", price: 1 }) });
    ok(`${path} refuses signed-out requests`, r.status === 401 || r.status === 403, String(r.status));
  }
  const ro = await fetch(BASE + "/api/billing/orders/00000000-0000-4000-8000-000000000001");
  ok("order status requires a session", ro.status === 401, String(ro.status));
  for (const [path, header] of [["/api/webhooks/nowpayments", "x-nowpayments-sig"]]) {
    const none = await fetch(BASE + path, { method: "POST", body: JSON.stringify({ event_type: "transaction.completed" }) });
    const bad = await fetch(BASE + path, { method: "POST", headers: { [header]: "ts=1;h1=deadbeef" }, body: JSON.stringify({ event_type: "transaction.completed" }) });
    ok(`${path} rejects unsigned and badly signed requests`, [400, 401, 503].includes(none.status) && [400, 401, 503].includes(bad.status), `${none.status}/${bad.status}`);
  }

  // signed-out visitor: pricing buttons are disabled, no payment UI, no remaining-slot numbers
  const bp = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await bp.goto(BASE + "/pricing", { waitUntil: "networkidle" });
  const soon = await bp.locator("button:has-text('Currently unavailable')").count();
  ok("pricing: paid plans show disabled 'Currently unavailable' while unconfigured", soon >= 3 && (await bp.locator("a:has-text('Pay with crypto')").count()) === 0, String(soon));
  ok("pricing: 'Currently unavailable' buttons are disabled", await bp.locator("button:has-text('Currently unavailable')").evaluateAll((els) => els.every((e) => e.disabled)));
  const priceText = await bp.locator("main").innerText();
  ok("pricing shows fixed prices", ["$1.99", "$14.99", "$59.99"].every((x) => priceText.includes(x)) && !priceText.includes("$0.99"));
  ok("pricing never shows a remaining-slots number", !/\b\d+\s*(slots?|spots?|left|remaining)\b/i.test(priceText));
  await bp.close();

  // Checkout flow with mocked billing endpoints: pricing -> /checkout invoice page -> NOWPayments invoice -> /checkout/{id} status
  const mctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const mp = await mctx.newPage();
  const merrs = []; mp.on("pageerror", (e) => merrs.push(String(e)));
  const ORDER = "00000000-0000-4000-8000-0000000000aa";
  const options = { crypto: { available: true, environment: "sandbox", products: ["PRO_MONTHLY", "PRO_LIFETIME"], prepaid: true }, earlyBird: { state: "off", total: 100, remaining: null } };
  let orderState = { product: "PRO_MONTHLY", status: "pending", paymentStatus: null, providerStatus: null };
  let checkoutBody = null;
  let checkoutReply = { status: 200, json: { orderId: ORDER, invoiceUrl: "https://nowpayments.io/payment/?iid=4522625843" } };
  await mctx.route("**/api/billing/options", (r) => r.fulfill({ json: options }));
  await mctx.route("**/api/billing/crypto/checkout", async (r) => { checkoutBody = r.request().postDataJSON(); await r.fulfill(checkoutReply); });
  await mctx.route("**/api/billing/orders/*", (r) => r.fulfill({ json: orderState }));
  await mctx.route("https://nowpayments.io/**", (r) => r.fulfill({ contentType: "text/html", body: "<title>NOWPayments invoice</title><h1>NOWPayments invoice</h1>" }));

  await mp.goto(BASE + "/pricing", { waitUntil: "networkidle" });
  ok("mocked: crypto config shows 'Pay with crypto' and test-mode notice", (await mp.locator("a:has-text('Pay with crypto')").count()) >= 1 && (await mp.locator("text=Test mode: no real charges").count()) >= 1);
  ok("no card payment option exists; Paddle routes are gone", (await mp.locator("text=Pay by card").count()) === 0 && (await fetch(BASE + "/api/webhooks/paddle", { method: "POST" })).status === 404 && !(await mp.locator("body").innerText()).includes("Paddle"));
  ok("mocked: yearly (not offered) stays 'Currently unavailable'", (await mp.locator("button:has-text('Currently unavailable')").count()) >= 1);
  ok("pricing names the accepted coins, not USDT TRC20", /ETH/.test(await mp.locator("main").innerText()) && !/TRC20/i.test(await mp.locator("main").innerText()));

  // signed out -> login -> back to the invoice page
  await mp.locator("a:has-text('Pay with crypto')").first().click();
  await mp.waitForURL("**/login?next=*");
  ok("checkout requires login and remembers the plan", decodeURIComponent(mp.url()).includes("next=/checkout?plan=PRO_MONTHLY"), mp.url());
  await mp.fill("#email", "demo@example.com"); await mp.fill("#password", "correct-horse-1");
  await mp.click("button[type=submit]");
  await mp.waitForURL("**/checkout?plan=PRO_MONTHLY", { timeout: 15000 });
  const inv = await mp.locator("main").innerText();
  ok("invoice page shows plan, server price and prepaid term", /monthly/i.test(inv) && inv.includes("$1.99") && /30 days of Premium, prepaid/.test(inv), inv.slice(0, 300));
  ok("invoice page explains the customer picks the coin on the next page", /choose the cryptocurrency/i.test(inv) && /do not renew automatically/i.test(inv));
  await mp.click("button:has-text('Continue to payment')");
  await mp.waitForURL("https://nowpayments.io/**", { timeout: 15000 });
  ok("continue -> browser goes to the NOWPayments hosted invoice", mp.url().startsWith("https://nowpayments.io/payment/?iid="), mp.url());
  ok("client sent only the product (no coin, price or amount)", JSON.stringify(checkoutBody) === JSON.stringify({ product: "PRO_MONTHLY" }), JSON.stringify(checkoutBody));

  // provider error on the invoice page
  checkoutReply = { status: 502, json: { error: { code: "provider_error", message: "Could not start crypto checkout. Please try again. (ref: 400)" } } };
  await mp.goto(BASE + "/checkout?plan=PRO_LIFETIME", { waitUntil: "networkidle" });
  { const t = await mp.locator("main").innerText(); ok("lifetime invoice applies the server's early-bird price: $59.99 struck, $29.99 charged", (await mp.locator("main s", { hasText: "$59.99" }).count()) === 1 && /\$29\.99\s*USD/.test(t) && /Early-bird price applied/.test(t) && /one-time payment/i.test(t), t.slice(0, 300)); }
  await mp.click("button:has-text('Continue to payment')");
  ok("provider error is shown with its reference and the button is usable again", await mp.locator("text=(ref: 400)").waitFor({ timeout: 10000 }).then(() => true, () => false) && (await mp.locator("button:has-text('Continue to payment')").isEnabled()));
  await mp.goto(BASE + "/checkout?plan=NOT_A_PLAN");
  ok("unknown plan -> pricing", mp.url().endsWith("/pricing"), mp.url());

  // status page (NOWPayments success_url): only the server's 'fulfilled' shows success
  const statusAt = async (state, path = `/checkout/${ORDER}`) => { orderState = { product: "PRO_MONTHLY", paymentStatus: null, ...state }; await mp.goto(BASE + path, { waitUntil: "networkidle" }); return mp.locator("main"); };
  const seen = async (text) => mp.locator(`text=${text}`).first().waitFor({ timeout: 15000 }).then(() => true, () => false);
  await statusAt({ status: "pending", providerStatus: null });
  ok("status: waiting for payment, no success claim", (await seen("Waiting for your payment")) && !(await mp.locator("text=Payment confirmed").count()));
  await statusAt({ status: "pending", providerStatus: "partially_paid" });
  ok("status: partial payment is NOT active", (await seen("Partial payment received")) && /not active until the full amount/i.test(await mp.locator("main").innerText()));
  await statusAt({ status: "pending", providerStatus: "confirming" });
  ok("status: confirming shown without granting", (await seen("Payment detected")) && !(await mp.locator("text=Payment confirmed").count()));
  orderState = { ...orderState, status: "fulfilled", providerStatus: "finished" };
  ok("status: page updates by itself to 'Payment confirmed' once the server says fulfilled", await seen("Payment confirmed"));
  await statusAt({ status: "expired", providerStatus: "expired" });
  ok("status: expired order explained, with a new-payment link", (await seen("Payment window expired")) && (await mp.locator("a:has-text('Start a new payment')").count()) === 1);
  await statusAt({ status: "pending", providerStatus: null }, `/checkout/${ORDER}?canceled=1`);
  ok("status: canceled invoice explained", await seen("Payment not finished"));
  await statusAt({ status: "refund_required", providerStatus: "finished" });
  ok("status: refund-required explained", await seen("Payment received but not activated"));
  ok("no runtime errors in billing UI", merrs.length === 0, merrs.join(" | ").slice(0, 300));

  // lifetime card: early-bird price + progress bar (server-reported numbers)
  const card = (st) => ({ json: { ...options, crypto: { ...options.crypto, products: ["PRO_MONTHLY", "PRO_YEARLY", "PRO_LIFETIME"] }, earlyBird: st } });
  const life = () => mp.locator("li:has(h3:has-text('Premium Lifetime'))");
  const setBird = async (st) => { await mctx.unroute("**/api/billing/options"); await mctx.route("**/api/billing/options", (r) => r.fulfill(card(st))); await mp.goto(BASE + "/pricing", { waitUntil: "networkidle" }); await mp.waitForTimeout(400); };

  await setBird({ state: "available", total: 100, remaining: 63 });
  let lt = await life().innerText();
  ok("lifetime card: regular $59.99 is struck through and $29.99 is the price", (await life().locator("s", { hasText: "$59.99" }).count()) === 1 && lt.includes("$29.99"), lt.slice(0, 200));
  ok("lifetime card: names the first-100 early bird and the real spots left", /first 100 buyers/i.test(lt) && /63 of 100 spots left/.test(lt) && /then \$59\.99/.test(lt));
  const bar = life().locator('[role=progressbar]');
  ok("lifetime card: progress bar shows 37 of 100 claimed", (await bar.getAttribute("aria-valuenow")) === "37" && (await bar.getAttribute("aria-valuemax")) === "100" && /37%/.test(await bar.locator("div").getAttribute("style")));
  ok("no separate early-adopter section or $0.99 price anywhere", (await mp.locator("h3:has-text('Early Adopter')").count()) === 0 && !(await mp.locator("main").innerText()).includes("$0.99"));

  await setBird({ state: "available", total: 100, remaining: 1 });
  ok("last spot: '1 of 100 spots left'", /1 of 100 spots left/.test(await life().innerText()));
  await setBird({ state: "available", total: 100, remaining: null });
  lt = await life().innerText();
  ok("counter unreadable: price still shown, no invented number or bar", lt.includes("$29.99") && (await life().locator("[role=progressbar]").count()) === 0 && !/spots left/.test(lt));
  await setBird({ state: "temporarily_unavailable", total: 100, remaining: 10 });
  lt = await life().innerText();
  ok("all spots reserved: regular price with an explanation, no strike-through", /\$59\.99/.test(lt) && (await life().locator("s").count()) === 0 && /reserved by people checking out/.test(lt));
  for (const st of [{ state: "sold_out", total: 100, remaining: 0 }, { state: "off", total: 100, remaining: null }]) {
    await setBird(st);
    lt = await life().innerText();
    ok(`early bird '${st.state}': only the regular $59.99 is shown`, lt.includes("$59.99") && !lt.includes("$29.99") && (await life().locator("[role=progressbar]").count()) === 0);
  }
  await mctx.close();
}

// ---------- admin dashboard: access control, Premium gifts, early-bird editor
{
  const signIn = async (ctx, email) => { const pg = await ctx.newPage(); await pg.goto(BASE + "/login"); await pg.fill("#email", email); await pg.fill("#password", "correct-horse-1"); await pg.click("button[type=submit]"); await pg.waitForURL("**/dashboard", { timeout: 15000 }); return pg; };
  const uctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const up = await signIn(uctx, "demo@example.com");
  ok("non-admin: no Admin link on the dashboard", (await up.locator('a[href="/admin"]').count()) === 0);
  const r404 = await up.goto(BASE + "/admin");
  ok("non-admin: /admin is a 404", r404.status() === 404, String(r404.status()));
  const apiNo = await up.evaluate(async () => [(await fetch("/api/admin/users?email=demo@example.com")).status, (await fetch("/api/admin/gifts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "00000000-0000-4000-8000-000000000001", duration: "lifetime" }) })).status, (await fetch("/api/admin/early-bird", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ remaining: 100, enabled: true }) })).status]);
  ok("non-admin: every admin API answers 404 (incl. self-granting)", apiNo.every((x) => x === 404), JSON.stringify(apiNo));

  const actx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const ap = await signIn(actx, "admin@example.com");
  const aerrs = []; ap.on("pageerror", (e) => aerrs.push(String(e)));
  ok("admin: Admin link on the dashboard", await ap.locator('a[href="/admin"]').first().waitFor({ timeout: 10000 }).then(() => true, () => false), (await ap.locator("nav").first().innerText()).replace(/\s+/g, " "));
  await ap.goto(BASE + "/admin");
  const at = await ap.locator("main").innerText();
  ok("admin page: both sections", at.includes("Premium Gifts") && at.includes("Lifetime Early Bird"));
  const stats = await ap.locator("[data-testid=early-bird-stats]").innerText();
  ok("early bird stats: $59.99 / $29.99 / allocation 100 / 37 sold / 63 remaining / enabled", ["$59.99", "$29.99"].every((x) => stats.includes(x)) && /allocation\s*100/i.test(stats) && /purchases\s*37/i.test(stats) && /remaining\s*63/i.test(stats) && /enabled/i.test(stats), stats.replace(/\s+/g, " "));

  await ap.fill("#gift_email", "demo@example.com");
  await ap.click("button:has-text('Find user')");
  await ap.locator("text=Recipient: demo@example.com").waitFor({ timeout: 10000 });
  await ap.locator("[data-testid=gift-grant] label", { hasText: "Lifetime" }).click();
  await ap.fill("#gift_reason", "Beta tester thank-you");
  await ap.click("button:has-text('Grant Premium')");
  await ap.click("button:has-text('Confirm grant')");
  await ap.locator("text=Premium gifted to demo@example.com").waitFor({ timeout: 10000 });
  await ap.locator("[data-testid=gift-row]", { hasText: "demo@example.com" }).waitFor({ timeout: 10000 });
  const row = await ap.locator("[data-testid=gift-row]").first().innerText();
  ok("gift granted: recipient, lifetime, admin, reason, active", /demo@example\.com/.test(row) && /Lifetime/.test(row) && /admin@example\.com/.test(row) && /Beta tester/.test(row) && /Active/.test(row), row.replace(/\s+/g, " "));
  ok("gift audit log records the grant", /grant\s+Lifetime for demo@example\.com by admin@example\.com/.test(await ap.locator("[aria-label='Gift audit log']").innerText()));
  const entGift = await up.evaluate(async () => (await fetch("/api/entitlement")).json());
  ok("recipient's entitlement API recognises the gift", entGift.plan === "PRO_LIFETIME" && entGift.source === "subscription" && entGift.isPremium === true && entGift.gift?.lifetime === true && entGift.gift?.effective === true, JSON.stringify(entGift).slice(0, 160));

  await ap.locator("[data-testid=gift-row]").first().locator("button:has-text('Revoke')").click();
  await ap.click("button:has-text('Confirm revoke')");
  await ap.locator("[data-testid=gift-row]", { hasText: "Revoked" }).waitFor({ timeout: 10000 });
  const entAfter = await up.evaluate(async () => (await fetch("/api/entitlement")).json());
  ok("revoking the gift returns the user to their own plan (trial kept)", entAfter.plan === "TRIAL" && entAfter.gift === null, entAfter.plan);

  // X Accounts: change a user's linked username
  await ap.fill("#xadmin_email", "demo@example.com");
  await ap.click("form:has(#xadmin_email) button:has-text('Find user')");
  await ap.locator("[data-testid=admin-binding]", { hasText: "@Demo_User" }).waitFor({ timeout: 10000 });
  await ap.locator("[data-testid=admin-binding]", { hasText: "@Demo_User" }).locator("button:has-text('Change username')").click();
  await ap.fill("[aria-label='New X username']", "@Demo_Fixed");
  ok("x accounts admin: a reason is required before saving", await ap.locator("button:has-text('Confirm: change to @Demo_Fixed')").isDisabled());
  await ap.fill("[data-testid=admin-binding] [aria-label='Reason']", "Ticket 42: spelling fix");
  await ap.click("button:has-text('Confirm: change to @Demo_Fixed')");
  await ap.locator("text=@Demo_User was changed to @Demo_Fixed").waitFor({ timeout: 10000 });
  const xh = await ap.locator("[aria-label='X account history']").innerText();
  ok("x accounts admin: change saved and audited with the admin and reason", /linked @Demo_Fixed by support:admin@example\.com/.test(xh) && /released @Demo_User by support:admin@example\.com/.test(xh) && /Ticket 42/.test(xh), xh.slice(0, 200));
  const entX = await up.evaluate(async () => (await fetch("/api/entitlement")).json());
  ok("x accounts admin: the user's entitlement shows the corrected username", JSON.stringify(entX.linkedXAccounts).includes("demo_fixed") && !JSON.stringify(entX.linkedXAccounts).includes("\"demo_user\""), JSON.stringify(entX.linkedXAccounts));
  await ap.locator("[data-testid=admin-binding]", { hasText: "@Second_Acct" }).locator("button:has-text('Change username')").click();
  await ap.fill("[aria-label='New X username']", "demo_fixed");
  await ap.fill("[data-testid=admin-binding] [aria-label='Reason']", "Ticket 43: try a taken name");
  await ap.click("button:has-text('Confirm: change to @demo_fixed')");
  await ap.locator("text=This X username is already linked to another GrowX account.").waitFor({ timeout: 10000 });
  ok("x accounts admin: a name already linked is refused", true);

  await ap.fill("#eb_remaining", "-1");
  ok("early bird: invalid remaining cannot be submitted", await ap.locator("button:has-text('Review change')").isDisabled());
  await ap.fill("#eb_remaining", "10");
  await ap.fill("#eb_reason", "Slow down the promo");
  await ap.click("button:has-text('Review change')");
  ok("early bird: confirmation shows old and new values", /Remaining 63 → 10/.test(await ap.locator("[data-testid=early-bird-editor]").innerText()));
  await ap.click("button:has-text('Confirm and save')");
  await ap.locator("[aria-label='Inventory history']").waitFor({ timeout: 10000 });
  const hist = await ap.locator("[aria-label='Inventory history']").innerText();
  ok("early bird: saved, audited with admin, previous/new value and reason", /admin@example\.com/.test(hist) && /remaining 63 → 10/.test(hist) && /Slow down the promo/.test(hist), hist.slice(0, 200));
  ok("early bird: stats show the new remaining count", /remaining\s*10/i.test(await ap.locator("[data-testid=early-bird-stats]").innerText()));
  // invoices: listed for the admin, linked from the buyer's dashboard, printable, private to the buyer (and admins)
  ok("admin: invoice history lists confirmed payments", /GX-20261018-EEEEEEEE/.test(await ap.locator("[aria-label='Invoices']").innerText()));
  await ap.goto(BASE + "/dashboard");
  await ap.locator("[data-testid=invoice-link]").first().waitFor({ timeout: 10000 });
  ok("dashboard: paid payment links its invoice", /Invoice GX-20261018-EEEEEEEE/.test(await ap.locator("[data-testid=invoice-link]").first().innerText()));
  await ap.locator("[data-testid=invoice-link]").first().click();
  await ap.locator("[data-testid=invoice]").waitFor({ timeout: 10000 });
  const inv = await ap.locator("[data-testid=invoice]").innerText();
  await ap.locator("[data-testid=invoice]").screenshot({ path: OUT + "shot-invoice.png" });
  ok("invoice: number, PAID, seller, bill-to, product, amount, dates, method, refund info, terms, logo",
    /GX-20261018-EEEEEEEE/.test(inv) && /PAID/.test(inv) && /Shahriar Ahmed Tushar/.test(inv) && /Founder, GrowX/i.test(inv) && /Unique Labs/.test(inv) && !/Co-founder/i.test(inv) && /GrowX, a Product of Unique Labs\./.test(inv) && /Rajshahi, Bangladesh 6205/i.test(inv) &&
    /admin@example\.com/.test(inv) && /Premium Lifetime \(Early Bird\)/.test(inv) && /29\.99 USD/.test(inv) && /Paid in full/.test(inv) && /Never \(lifetime\)/.test(inv) &&
    /NOWPayments · USD/.test(inv) && !/crypto/i.test(inv) && /support@growxapp\.org/.test(inv) && /Refunds can be requested within 14 days/.test(inv) && /Terms and conditions/i.test(inv) &&
    (await ap.locator("[data-testid=invoice] img[alt='GrowX logo']").count()) === 1, inv.slice(0, 300).replace(/\s+/g, " "));
  const pdf = await ap.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  writeFileSync(OUT + "invoice.pdf", pdf);
  const pdfPages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok("invoice: Save as PDF gives exactly one A4 page", pdfPages === 1, `${pdfPages} pages`);
  const other404 = await up.goto(BASE + "/invoices/eeeeeeee-0000-4000-8000-000000000001");
  ok("invoice: another (non-admin) user gets 404", other404.status() === 404, String(other404.status()));
  ok("admin pages: no runtime errors", aerrs.length === 0, aerrs.join(" | "));
  await uctx.close(); await actx.close();
}

await b.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
