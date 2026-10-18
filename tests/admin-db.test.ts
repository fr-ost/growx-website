import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resolveEntitlement } from "@/lib/entitlement/resolve";
import type { GiftRecord, SubscriptionRecord } from "@/lib/entitlement/types";
import { addUser, asRole, freshDb } from "./helpers/pg";

/** Admin gifts + early-bird editor on the REAL migrations (PGlite). */
let db: PGlite;
let ADMIN: string;
beforeAll(async () => {
  db = await freshDb();
  ADMIN = await addUser(db);
  await db.query("insert into public.admins (user_id, note) values ($1, 'test admin')", [ADMIN]);
});
afterAll(async () => db.close());

type R = { status: string; [k: string]: unknown };
const j = (o: unknown) => JSON.stringify(o);
const rows = async <T = Record<string, unknown>>(sql: string, p: unknown[] = []) => (await db.query<T>(sql, p)).rows;
const rpc = async (sql: string, p: unknown[]) => (await db.query<{ r: R }>(`select ${sql} as r`, p)).rows[0].r;
const grant = (admin: string, user: string, d: string, reason: string | null = null) => rpc("public.admin_grant_gift($1, $2, $3, $4)", [admin, user, d, reason]);
const extend = (admin: string, gift: string, d: string) => rpc("public.admin_extend_gift($1, $2, $3, null)", [admin, gift, d]);
const revoke = (admin: string, gift: string, reason: string | null = null) => rpc("public.admin_revoke_gift($1, $2, $3)", [admin, gift, reason]);
const giftsOf = (u: string) => rows<GiftRecord & { id: string }>("select id, status, duration, starts_at, expires_at from public.premium_gifts where user_id = $1", [u]);
const subsOf = (u: string) => rows<SubscriptionRecord>("select plan, status, current_period_end, provider, past_due_since, access_revoked_at from public.subscriptions where user_id = $1", [u]);
const entitlementOf = async (u: string, at = new Date()) => resolveEntitlement({ trials: [], subscriptions: await subsOf(u), gifts: (await giftsOf(u)).map((g) => ({ ...g, starts_at: new Date(g.starts_at).toISOString(), expires_at: g.expires_at ? new Date(g.expires_at).toISOString() : null })) }, at);
const DAY = 86_400_000;

describe("admin authorization", () => {
  it("only users in public.admins can act; browser roles cannot call any admin function", async () => {
    const user = await addUser(db);
    const target = await addUser(db);
    await expect(grant(user, target, "30d")).rejects.toThrow(/not_admin/);
    await expect(grant(user, user, "lifetime")).rejects.toThrow(/not_admin/); // no self-granting
    await expect(rpc("public.admin_set_early_bird($1, 5, true, null, null)", [user])).rejects.toThrow(/not_admin/);
    await expect(rpc("public.admin_increase_early_bird_allocation($1, 200, 'some long reason')", [user])).rejects.toThrow(/not_admin/);
    await expect(rpc("public.admin_find_user($1, 'x@example.com')", [user])).rejects.toThrow(/not_admin/);
    for (const [role, sub] of [["authenticated", user], ["anon", null]] as const) {
      await asRole(db, role, sub, async () => {
        await expect(db.query("select public.admin_grant_gift($1, $1, '30d', null)", [user])).rejects.toThrow(/permission denied/);
        await expect(db.query("select public.admin_set_early_bird($1, 5, true, null, null)", [user])).rejects.toThrow(/permission denied/);
        await expect(db.query("insert into public.admins (user_id) values ($1)", [user])).rejects.toThrow(/permission denied/);
        await expect(db.query("insert into public.premium_gifts (user_id, granted_by, duration, expires_at) values ($1, $1, 'lifetime', null)", [user])).rejects.toThrow(/permission denied/);
        await expect(db.query("update public.early_bird_settings set sales_cap = 1000")).rejects.toThrow(/permission denied/);
      });
    }
    expect(await giftsOf(target)).toHaveLength(0);
    expect(await giftsOf(user)).toHaveLength(0);
  });
});

describe("Premium gifts", () => {
  it.each([["7d", 7], ["30d", 30], ["90d", 90], ["1y", 365], ["lifetime", null]] as const)("grants %s with a server-computed expiry", async (d, days) => {
    const u = await addUser(db);
    const before = Date.now();
    const r = await grant(ADMIN, u, d, "Influencer partnership");
    expect(r.status).toBe("granted");
    const [g] = await rows<{ expires_at: string | null; granted_by: string; reason: string; duration: string }>("select expires_at, granted_by, reason, duration from public.premium_gifts where user_id = $1", [u]);
    expect([g.granted_by, g.reason, g.duration]).toEqual([ADMIN, "Influencer partnership", d]);
    if (days === null) expect(g.expires_at).toBeNull();
    else {
      const exp = new Date(g.expires_at!).getTime();
      const want = days === 365 ? new Date(new Date(before).setFullYear(new Date(before).getFullYear() + 1)).getTime() : before + days * DAY;
      expect(Math.abs(exp - want)).toBeLessThan(5 * 60_000 + DAY); // calendar year may differ by a leap day
    }
    const e = await entitlementOf(u);
    expect(e).toMatchObject({ plan: days === null ? "PRO_LIFETIME" : days >= 90 ? "PRO_YEARLY" : "PRO_MONTHLY", isPremium: true, source: "subscription", gift: { effective: true } });
    expect(e.gift).toMatchObject({ lifetime: days === null });
  });

  it("a timed gift stops granting Premium when it expires", async () => {
    const u = await addUser(db);
    await grant(ADMIN, u, "7d");
    expect((await entitlementOf(u)).isPremium).toBe(true);
    expect((await entitlementOf(u, new Date(Date.now() + 8 * DAY))).plan).toBe("FREE");
  });

  it("one running gift per user; extend adds time from the current expiry; extend to lifetime; revoke ends it", async () => {
    const u = await addUser(db);
    const g = (await grant(ADMIN, u, "30d")).gift_id as string;
    expect((await grant(ADMIN, u, "7d")).status).toBe("active_gift_exists");
    const [{ expires_at: e1 }] = await rows<{ expires_at: string }>("select expires_at from public.premium_gifts where id = $1", [g]);
    expect((await extend(ADMIN, g, "7d")).status).toBe("extended");
    const [{ expires_at: e2 }] = await rows<{ expires_at: string }>("select expires_at from public.premium_gifts where id = $1", [g]);
    expect(new Date(e2).getTime() - new Date(e1).getTime()).toBe(7 * DAY);
    expect((await extend(ADMIN, g, "lifetime")).status).toBe("extended");
    expect((await entitlementOf(u)).gift).toEqual({ lifetime: true, expiresAt: null, effective: true });
    expect((await extend(ADMIN, g, "30d")).status).toBe("already_lifetime");
    expect((await revoke(ADMIN, g, "Partnership ended")).status).toBe("revoked");
    expect((await revoke(ADMIN, g)).status).toBe("already_revoked");
    expect((await extend(ADMIN, g, "30d")).status).toBe("revoked");
    expect((await entitlementOf(u)).plan).toBe("FREE");
    // a new gift can be granted after a revoke
    expect((await grant(ADMIN, u, "7d")).status).toBe("granted");
  });

  it("an expired gift can be extended (restarts from now)", async () => {
    const u = await addUser(db);
    const g = (await grant(ADMIN, u, "7d")).gift_id as string;
    await db.query("update public.premium_gifts set starts_at = now() - interval '20 days', expires_at = now() - interval '13 days' where id = $1", [g]);
    expect((await entitlementOf(u)).plan).toBe("FREE");
    await extend(ADMIN, g, "7d");
    const [{ expires_at }] = await rows<{ expires_at: string }>("select expires_at from public.premium_gifts where id = $1", [g]);
    expect(Math.abs(new Date(expires_at).getTime() - (Date.now() + 7 * DAY))).toBeLessThan(60_000);
  });

  it("revoking a gift never removes separately purchased Premium", async () => {
    const u = await addUser(db);
    await db.query("insert into public.subscriptions (user_id, provider, plan, status, current_period_end) values ($1, 'nowpayments', 'PRO_YEARLY', 'active', now() + interval '200 days')", [u]);
    const subsBefore = await subsOf(u);
    const g = (await grant(ADMIN, u, "lifetime")).gift_id as string;
    expect(await entitlementOf(u)).toMatchObject({ plan: "PRO_LIFETIME", gift: { effective: true } }); // lifetime gift covers longer than the yearly plan
    await revoke(ADMIN, g);
    expect(await subsOf(u)).toEqual(subsBefore);
    expect(await entitlementOf(u)).toMatchObject({ plan: "PRO_YEARLY", source: "subscription", isPremium: true, gift: null });
    expect(await rows("select 1 from public.payments where user_id = $1", [u])).toHaveLength(0); // no fake payment
    expect(await rows("select 1 from public.checkout_orders where user_id = $1", [u])).toHaveLength(0);
  });

  it("paid lifetime always stays the effective plan; a gift never shortens access", async () => {
    const u = await addUser(db);
    await db.query("insert into public.subscriptions (user_id, provider, plan, status) values ($1, 'nowpayments', 'PRO_LIFETIME', 'active')", [u]);
    await grant(ADMIN, u, "lifetime");
    expect(await entitlementOf(u)).toMatchObject({ plan: "PRO_LIFETIME", source: "subscription" });
  });

  it("every grant, extension and revocation is audited; the audit log is append-only", async () => {
    const u = await addUser(db);
    const g = (await grant(ADMIN, u, "30d", "promo")).gift_id as string;
    await extend(ADMIN, g, "90d");
    await revoke(ADMIN, g, "mistake");
    const ev = await rows<{ action: string; admin_id: string; reason: string | null }>("select action, admin_id, reason from public.premium_gift_events where gift_id = $1 order by id", [g]);
    expect(ev).toEqual([
      { action: "grant", admin_id: ADMIN, reason: "promo" },
      { action: "extend", admin_id: ADMIN, reason: null },
      { action: "revoke", admin_id: ADMIN, reason: "mistake" },
    ]);
    await expect(db.query("delete from public.premium_gift_events where gift_id = $1", [g])).rejects.toThrow(/append_only/);
    await expect(db.query("update public.premium_gift_events set reason = 'x' where gift_id = $1", [g])).rejects.toThrow(/append_only/);
  });

  it("recipients can read their own gift (not the reason or the admin); others see nothing", async () => {
    const u = await addUser(db);
    const other = await addUser(db);
    await grant(ADMIN, u, "30d", "secret internal note");
    await asRole(db, "authenticated", u, async () => {
      expect((await db.query("select status, duration, starts_at, expires_at from public.premium_gifts")).rows).toHaveLength(1);
      await expect(db.query("select reason from public.premium_gifts")).rejects.toThrow(/permission denied/);
      await expect(db.query("select granted_by from public.premium_gifts")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from public.premium_gift_events")).rejects.toThrow(/permission denied/);
    });
    await asRole(db, "authenticated", other, async () => {
      expect((await db.query("select status from public.premium_gifts")).rows).toHaveLength(0);
    });
  });

  it("finds users by exact email (case-insensitive) for admins", async () => {
    const u = await addUser(db);
    const [{ email }] = await rows<{ email: string }>("select email from public.profiles where id = $1", [u]);
    expect(await rpc("public.admin_find_user($1, $2)", [ADMIN, `  ${email.toUpperCase()} `])).toMatchObject({ status: "ok", user_id: u, email });
    expect(await rpc("public.admin_find_user($1, 'nobody@example.com')", [ADMIN])).toEqual({ status: "not_found" });
  });
});

// ------------------------------------------------------------------ early bird
const status = async () => (await rows<{ s: { state: string; enabled: boolean; sold: number; open_reservations: number; sales_cap: number; campaign_allocation: number; remaining: number; updated_at: string } }>("select public.early_bird_status() as s"))[0].s;
const setEB = (remaining: number, enabled: boolean, expected: string | null = null, reason: string | null = null) => rpc("public.admin_set_early_bird($1, $2, $3, $4, $5::timestamptz)", [ADMIN, remaining, enabled, reason, expected]);
async function earlyOrder(user: string, ttl = 3600) {
  return (await db.query<{ r: { status: string; order_id?: string; code?: string } }>("select public.create_checkout_order($1,'nowpayments','PRO_LIFETIME_EARLY','PRO_LIFETIME',2999,'USD',null,null,$2) as r", [user, ttl])).rows[0].r;
}
let evt = 0;
async function pay(orderId: string, status: string, fulfill: boolean, extra: Record<string, unknown> = {}, id = `eb_evt_${++evt}`) {
  await db.query("update public.checkout_orders set provider_ref = coalesce(provider_ref, $2), asset = 'bnbbsc', status = case when status = 'created' then 'pending' else status end where id = $1", [orderId, `np_${orderId}`]);
  const effect = { kind: "payment", provider_payment_id: `np_${orderId}`, order_id: orderId, status, fulfill, product: "PRO_LIFETIME_EARLY", amount_minor: 2999, currency: "USD", asset: "bnbbsc", provider_status: status, ...extra };
  return (await db.query<{ r: { result: string } }>("select public.billing_apply('nowpayments',$1,'t',now(),$2::jsonb) as r", [id, j(effect)])).rows[0].r.result;
}
const sold = async () => Number((await rows<{ n: number }>("select count(*)::int as n from public.early_adopter_slots"))[0].n);

describe("Lifetime Early Bird editor", () => {
  beforeEach(async () => {
    // a clean campaign for each test: no sales, no orders for early bird, default settings
    await db.exec("delete from public.early_adopter_slots; update public.checkout_orders set status = 'canceled' where product = 'PRO_LIFETIME_EARLY' and status in ('created','pending');");
    await db.exec("update public.early_bird_settings set enabled = true, sales_cap = 100, campaign_allocation = 100");
  });

  it("starts as today's offer: enabled, 100 spots, nothing sold", async () => {
    expect(await status()).toMatchObject({ state: "available", enabled: true, sold: 0, remaining: 100, sales_cap: 100, campaign_allocation: 100 });
  });

  it("admin sets the remaining count (sales are never reset) and every edit is audited with prev/new values", async () => {
    const u = await addUser(db);
    const o = await earlyOrder(u);
    expect(await pay(o.order_id!, "succeeded", true)).toBe("applied");
    expect(await sold()).toBe(1);
    expect((await setEB(10, true, null, "Slow start, reduce")).status).toBe("saved");
    expect(await status()).toMatchObject({ sold: 1, remaining: 10, sales_cap: 11 });
    expect((await setEB(-1, true)).status).toBe("invalid_remaining");
    expect(await setEB(100, true)).toEqual({ status: "exceeds_allocation", max_remaining: 99 });
    const [ev] = await rows("select admin_id, action, sold_at_change, prev_remaining, new_remaining, prev_enabled, new_enabled, reason from public.early_bird_events order by id desc limit 1");
    expect(ev).toEqual({ admin_id: ADMIN, action: "set_inventory", sold_at_change: 1, prev_remaining: 99, new_remaining: 10, prev_enabled: true, new_enabled: true, reason: "Slow start, reduce" });
    await expect(db.query("delete from public.early_bird_events")).rejects.toThrow(/append_only/);
  });

  it("rejects an edit made against a stale view", async () => {
    const before = (await status()).updated_at;
    await setEB(50, true);
    expect((await setEB(40, true, before)).status).toBe("stale");
    expect((await status()).remaining).toBe(50);
  });

  it("zero remaining or a disabled offer blocks NEW discounted orders (checkout falls back to $59.99)", async () => {
    const u = await addUser(db);
    await setEB(0, true);
    expect(await status()).toMatchObject({ state: "sold_out", remaining: 0 });
    expect(await earlyOrder(u)).toEqual({ status: "error", code: "early_sold_out" });
    await setEB(5, false);
    expect((await status()).state).toBe("off");
    expect(await earlyOrder(u)).toEqual({ status: "error", code: "early_disabled" });
    await setEB(5, true);
    expect((await earlyOrder(u)).status).toBe("ok");
  });

  it("an unexpired reservation keeps its $29.99 price and spot even if the admin then sets 0 or disables the offer", async () => {
    const u = await addUser(db);
    const o = await earlyOrder(u);
    await setEB(0, false);
    expect(await pay(o.order_id!, "succeeded", true)).toBe("applied");
    expect(await sold()).toBe(1);
    expect(await rows("select plan, status from public.subscriptions where user_id = $1", [u])).toEqual([{ plan: "PRO_LIFETIME", status: "active" }]);
  });

  it("a LATE payment (reservation expired) is honoured only while enabled with spots left; otherwise refund_required", async () => {
    const a = await addUser(db);
    const o = await earlyOrder(a);
    await db.query("update public.checkout_orders set reservation_expires_at = now() - interval '1 minute' where id = $1", [o.order_id]);
    await setEB(5, false);
    expect(await pay(o.order_id!, "succeeded", true)).toBe("refund_required:early_adopter_unavailable");
    expect(await sold()).toBe(0);
    const b = await addUser(db);
    await setEB(5, true);
    const o2 = await earlyOrder(b);
    await db.query("update public.checkout_orders set reservation_expires_at = now() - interval '1 minute' where id = $1", [o2.order_id]);
    expect(await pay(o2.order_id!, "succeeded", true)).toBe("applied");
    expect(await sold()).toBe(1);
  });

  it("a sale counts exactly once: pending/failed/expired never count, duplicate callbacks do not double-count", async () => {
    const u = await addUser(db);
    const o = await earlyOrder(u);
    expect(await pay(o.order_id!, "pending", false)).toBe("applied");
    expect(await pay(o.order_id!, "confirming", false)).toBe("applied");
    expect(await sold()).toBe(0);
    const id = `dup_${o.order_id}`;
    expect(await pay(o.order_id!, "succeeded", true, {}, id)).toBe("applied");
    expect(await pay(o.order_id!, "succeeded", true, {}, id)).toBe("duplicate");
    expect(await pay(o.order_id!, "succeeded", true)).toBe("duplicate_fulfillment");
    expect(await sold()).toBe(1);
    for (const st of ["failed", "expired"]) {
      const v = await addUser(db);
      const ov = await earlyOrder(v);
      expect(await pay(ov.order_id!, st, false, { order_status: st })).toBe("applied");
      expect((await rows<{ status: string }>("select status from public.checkout_orders where id = $1", [ov.order_id]))[0].status).toBe(st);
    }
    expect(await sold()).toBe(1);
    expect((await status()).open_reservations).toBe(0); // failed/expired orders release their reservation
  });

  it("a refunded early-bird sale revokes that lifetime access but keeps counting as a sale (spots are not recycled)", async () => {
    const u = await addUser(db);
    const o = await earlyOrder(u);
    await pay(o.order_id!, "succeeded", true);
    const adj = { kind: "adjustment", provider_payment_id: `np_${o.order_id}`, adjustment_id: `refund:${o.order_id}`, action: "refund", adj_type: "full", status: "approved", amount_minor: 2999 };
    expect((await db.query<{ r: { result: string } }>("select public.billing_apply('nowpayments',$1,'t',now(),$2::jsonb) as r", [`ref_${o.order_id}`, j(adj)])).rows[0].r.result).toBe("applied");
    expect(await sold()).toBe(1);
    expect((await rows<{ access_revoked_at: string | null }>("select access_revoked_at from public.subscriptions where user_id = $1", [u]))[0].access_revoked_at).not.toBeNull();
  });

  it("existing lifetime purchasers keep their entitlement after any inventory change", async () => {
    const u = await addUser(db);
    const o = await earlyOrder(u);
    await pay(o.order_id!, "succeeded", true);
    const before = await subsOf(u);
    await setEB(0, false);
    await setEB(3, true);
    await rpc("public.admin_increase_early_bird_allocation($1, 150, 'Second wave approved by owner')", [ADMIN]);
    expect(await subsOf(u)).toEqual(before);
    expect((await entitlementOf(u)).plan).toBe("PRO_LIFETIME");
  });

  it("raising the campaign allocation is separate, explicit and audited; it adds no spots by itself", async () => {
    expect(await rpc("public.admin_increase_early_bird_allocation($1, 150, 'short')", [ADMIN])).toEqual({ status: "reason_required" });
    expect((await rpc("public.admin_increase_early_bird_allocation($1, 100, 'Second wave approved by owner')", [ADMIN])).status).toBe("invalid_allocation");
    expect((await rpc("public.admin_increase_early_bird_allocation($1, 1001, 'Second wave approved by owner')", [ADMIN])).status).toBe("invalid_allocation");
    expect((await rpc("public.admin_increase_early_bird_allocation($1, 102, 'Second wave approved by owner')", [ADMIN])).status).toBe("saved");
    expect(await status()).toMatchObject({ campaign_allocation: 102, sales_cap: 100, remaining: 100 });
    expect((await setEB(102, true)).status).toBe("saved");
    // slot numbers beyond 100 work once the allocation allows them
    await db.exec("insert into public.early_adopter_slots (slot, payment_id) select s, (select id from public.payments limit 1) from generate_series(1, 1) s");
    const [ev] = await rows("select action, prev_allocation, new_allocation, reason from public.early_bird_events where action = 'increase_allocation' order by id desc limit 1");
    expect(ev).toEqual({ action: "increase_allocation", prev_allocation: 100, new_allocation: 102, reason: "Second wave approved by owner" });
  });
});

describe("admin: change or unlink a user's linked X username", () => {
  const change = (admin: string, binding: string, action: string, reason: string, name: string | null = null) =>
    rpc("public.admin_change_x_account($1, $2, $3, $4, $5)", [admin, binding, action, reason, name]);
  const link = (u: string, name: string) => rpc("public.register_x_account($1, $2)", [u, name]);
  const bindingOf = async (u: string, norm: string) => (await rows<{ id: string }>("select id from public.x_account_bindings where user_id = $1 and normalized_username = $2 and status = 'active'", [u, norm]))[0]?.id;

  it("only admins; browser roles cannot call it", async () => {
    const u = await addUser(db);
    await link(u, "AdminTarget1");
    const id = await bindingOf(u, "admintarget1");
    await expect(change(u, id, "release", "trying to unlink myself")).rejects.toThrow(/not_admin/);
    await asRole(db, "authenticated", u, async () => {
      await expect(db.query("select public.admin_change_x_account($1, $2, 'release', 'some long reason', null)", [u, id])).rejects.toThrow(/permission denied/);
    });
    expect(await bindingOf(u, "admintarget1")).toBe(id);
  });

  it("replaces a username atomically, audited with the admin's email and reason", async () => {
    const u = await addUser(db);
    await link(u, "Typo_Admn");
    const id = await bindingOf(u, "typo_admn");
    expect(await change(ADMIN, id, "replace", "short", "Fixed")).toEqual({ status: "reason_required" });
    expect((await change(ADMIN, id, "replace", "Ticket 55: spelling fix", "@Fixed_Admin")).status).toBe("replaced");
    expect(await bindingOf(u, "typo_admn")).toBeUndefined();
    expect(await bindingOf(u, "fixed_admin")).toBeDefined();
    const [{ email }] = await rows<{ email: string }>("select email from public.profiles where id = $1", [ADMIN]);
    const ev = await rows<{ action: string; actor: string; reason: string }>("select action, actor, reason from public.x_account_binding_events where user_id = $1 and actor <> 'self' order by id", [u]);
    expect(ev).toEqual([
      { action: "released", actor: `support:${email}`, reason: "Ticket 55: spelling fix" },
      { action: "linked", actor: `support:${email}`, reason: "Ticket 55: spelling fix" },
    ]);
    expect((await change(ADMIN, id, "replace", "Ticket 55: spelling fix", "Other1")).status).toBe("not_active"); // repeat: no change
  });

  it("never links a name that belongs to another account; unlink frees the name and the slot", async () => {
    const a = await addUser(db);
    const b = await addUser(db);
    await link(a, "Owner_A1");
    await link(b, "Owner_B1");
    const idB = await bindingOf(b, "owner_b1");
    expect(await change(ADMIN, idB, "replace", "Ticket 56: wants that name", "OWNER_A1")).toEqual({ status: "taken" });
    expect(await bindingOf(b, "owner_b1")).toBe(idB); // unchanged
    expect((await change(ADMIN, idB, "release", "Ticket 57: account sold")).status).toBe("released");
    expect(await bindingOf(b, "owner_b1")).toBeUndefined();
    expect((await link(a, "owner_b1")).status).toBe("linked"); // free for anyone now
  });
});
