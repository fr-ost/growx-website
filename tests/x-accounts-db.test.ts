import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addUser, asRole, freshDb } from "./helpers/pg";

/**
 * Permanent X account bindings, slots and the $0.99 slot add-on, on the REAL migrations (PGlite).
 * Concurrency with separate connections is covered in x-accounts-concurrency.test.ts (real PostgreSQL).
 */
let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
});
afterAll(async () => db.close());

const j = (o: unknown) => JSON.stringify(o);
let evt = 0;
const eid = () => `xevt_${++evt}`;
type R = { status: string; [k: string]: unknown };

const register = async (user: string, name: string) =>
  (await db.query<{ r: R }>("select public.register_x_account($1::uuid, $2) as r", [user, name])).rows[0].r;
const support = async (binding: string, action: string, actor: string, reason: string, next: string | null = null) =>
  (await db.query<{ r: R }>("select public.support_change_x_account($1::uuid, $2, $3, $4, $5) as r", [binding, action, actor, reason, next])).rows[0].r;
const rows = async <T = Record<string, unknown>>(sql: string, p: unknown[] = []) => (await db.query<T>(sql, p)).rows;
const active = (u: string) => rows<{ username: string; normalized_username: string; id: string }>("select id, username, normalized_username from public.x_account_bindings where user_id = $1 and status = 'active' order by created_at, username", [u]);
const allowed = async (u: string) => (await rows<{ n: number }>("select public.x_account_allowed_slots($1) as n", [u]))[0].n;

async function slotOrder(user: string, o: { amount?: number; ref?: string | null } = {}) {
  const r = (await db.query<{ r: { status: string; order_id?: string; code?: string } }>(
    "select public.create_checkout_order($1,'nowpayments','X_ACCOUNT_SLOT',null,$2,'USD',null,null,3600) as r", [user, o.amount ?? 99],
  )).rows[0].r;
  if (r.status === "ok" && o.ref !== null) await db.query("select public.attach_order_ref($1, $2, null)", [r.order_id, o.ref ?? `np_${r.order_id}`]);
  return r;
}
const pay = (orderId: string, paymentId: string, status: string, fulfill: boolean, extra: Record<string, unknown> = {}) => ({
  kind: "payment", provider_payment_id: paymentId, order_id: orderId, status, fulfill, product: "X_ACCOUNT_SLOT", amount_minor: 99,
  currency: "USD", asset: null, asset_expected: "0.0015", asset_received: "0.0015", provider_status: status, ...extra,
});
async function apply(effect: Record<string, unknown>, id = eid()) {
  return (await db.query<{ r: { result: string } }>("select public.billing_apply('nowpayments',$1,'payment.test',now(),$2::jsonb) as r", [id, j(effect)])).rows[0].r.result;
}
/** A verified, finished slot payment (as the IPN handler would apply it). */
async function buySlot(user: string) {
  const o = await slotOrder(user);
  expect(o.status).toBe("ok");
  const ref = `np_${o.order_id}`;
  expect(await apply(pay(o.order_id!, ref, "succeeded", true))).toBe("applied");
  return { orderId: o.order_id!, ref };
}

describe("default capacity", () => {
  it("two default slots: first and second registration succeed, the third is rejected without a purchased slot", async () => {
    const u = await addUser(db);
    expect(await allowed(u)).toBe(2);
    expect(await register(u, "first_acct")).toMatchObject({ status: "linked", username: "first_acct", normalized_username: "first_acct", used: 1, allowed: 2 });
    expect(await register(u, "second_acct")).toMatchObject({ status: "linked", used: 2, allowed: 2 });
    expect(await register(u, "third_acct")).toEqual({ status: "no_slot", used: 2, allowed: 2 });
    expect((await active(u)).map((b) => b.username)).toEqual(["first_acct", "second_acct"]);
  });

  it("validates and normalizes: one leading @ removed, case-insensitive, display case kept", async () => {
    const u = await addUser(db);
    expect(await register(u, "  @Mixed_Case1 ")).toMatchObject({ status: "linked", username: "Mixed_Case1", normalized_username: "mixed_case1" });
    expect(await register(u, "MIXED_case1")).toMatchObject({ status: "already_linked" }); // duplicate within one account: idempotent, no new row
    expect(await register(u, "@mixed_case1")).toMatchObject({ status: "already_linked" });
    expect(await active(u)).toHaveLength(1);
    for (const bad of ["", "@", "@@name", "has space", "toolongusername16", "naïve", "a-b", "x.com/abc", null]) {
      expect(await register(u, bad as string)).toEqual({ status: "invalid_username" });
    }
    expect(await active(u)).toHaveLength(1);
  });

  it("unknown account ids never link anything", async () => {
    expect(await register("00000000-0000-4000-8000-0000000fffff", "ghost_name")).toEqual({ status: "no_account" });
    expect(await rows("select 1 from public.x_account_bindings where normalized_username = 'ghost_name'")).toHaveLength(0);
  });
});

describe("global uniqueness", () => {
  it("a username linked to one account cannot be linked to a second account, in any case or with @", async () => {
    const a = await addUser(db);
    const b = await addUser(db);
    expect((await register(a, "SharedName")).status).toBe("linked");
    for (const v of ["SharedName", "sharedname", "SHAREDNAME", "@sharedName", " @SharedName "]) {
      const r = await register(b, v);
      expect(r).toEqual({ status: "taken" }); // nothing about the other account is returned
    }
    expect(await active(b)).toHaveLength(0);
    // slots never bypass uniqueness: b buys a slot and still cannot take it
    await buySlot(b);
    expect(await register(b, "sharedname")).toEqual({ status: "taken" });
  });

  it("the database itself refuses a second active row (unique index), even for a privileged writer", async () => {
    const a = await addUser(db);
    const b = await addUser(db);
    await register(a, "IndexGuard");
    await db.exec("begin; select set_config('growx.x_binding_write', 'register', true);");
    await expect(db.query("insert into public.x_account_bindings (user_id, username, normalized_username) values ($1, 'INDEXGUARD', 'indexguard')", [b])).rejects.toThrow(/x_account_bindings_active_username_key/);
    await db.exec("rollback");
  });
});

describe("bindings are permanent", () => {
  it("authenticated users can read only their own bindings and can never write them", async () => {
    const a = await addUser(db);
    const b = await addUser(db);
    await register(a, "OwnerOnly");
    await asRole(db, "authenticated", b, async () => {
      expect((await db.query("select * from public.x_account_bindings where normalized_username = 'owneronly'")).rows).toHaveLength(0);
    });
    await asRole(db, "authenticated", a, async () => {
      expect((await db.query("select username from public.x_account_bindings")).rows).toEqual([{ username: "OwnerOnly" }]);
      await expect(db.query("update public.x_account_bindings set username = 'Other' where user_id = $1", [a])).rejects.toThrow(/permission denied/);
      await expect(db.query("delete from public.x_account_bindings where user_id = $1", [a])).rejects.toThrow(/permission denied/);
      await expect(db.query("insert into public.x_account_bindings (user_id, username, normalized_username) values ($1, 'Mine2', 'mine2')", [a])).rejects.toThrow(/permission denied/);
      await expect(db.query("insert into public.account_slot_grants (user_id, order_id, payment_id) values ($1, gen_random_uuid(), gen_random_uuid())", [a])).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.register_x_account($1, 'viaRpc')", [a])).rejects.toThrow(/permission denied/);
    });
    await asRole(db, "anon", null, async () => {
      await expect(db.query("select * from public.x_account_bindings")).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.register_x_account($1, 'anonName')", [a])).rejects.toThrow(/permission denied/);
    });
  });

  it("even with table privileges (service role) or as the owner, rows cannot be edited, released or deleted directly", async () => {
    const a = await addUser(db);
    await register(a, "Immutable1");
    for (const role of ["service_role", null] as const) {
      const run = (sql: string) => (role ? asRole(db, role, null, () => db.query(sql, [a])) : db.query(sql, [a]));
      await expect(run("update public.x_account_bindings set username = 'Changed1', normalized_username = 'changed1' where user_id = $1")).rejects.toThrow(/x_account_binding_immutable/);
      await expect(run("update public.x_account_bindings set status = 'released', released_at = now(), released_by = 'x', release_reason = 'y' where user_id = $1")).rejects.toThrow(/x_account_binding_immutable/);
      await expect(run("delete from public.x_account_bindings where user_id = $1")).rejects.toThrow(/x_account_binding_immutable/);
      await expect(run("insert into public.x_account_bindings (user_id, username, normalized_username) values ($1, 'Sneaky1', 'sneaky1')")).rejects.toThrow(/x_account_binding_write_denied/);
    }
    expect((await active(a)).map((b) => b.username)).toEqual(["Immutable1"]);
  });

  it("the audit trail is append-only", async () => {
    const a = await addUser(db);
    await register(a, "Audited1");
    expect(await rows("select action, actor, normalized_username from public.x_account_binding_events where user_id = $1", [a])).toEqual([
      { action: "linked", actor: "self", normalized_username: "audited1" },
    ]);
    await expect(db.query("update public.x_account_binding_events set actor = 'x' where user_id = $1", [a])).rejects.toThrow(/append_only/);
    await expect(db.query("delete from public.x_account_binding_events where user_id = $1", [a])).rejects.toThrow(/append_only/);
  });
});

describe("authorized support workflow", () => {
  it("no API role (anon, authenticated, service_role) can run support changes", async () => {
    const a = await addUser(db);
    await register(a, "NoAdmin1");
    const [{ id }] = await active(a);
    for (const [role, sub] of [["anon", null], ["authenticated", a], ["service_role", null]] as const) {
      await asRole(db, role, sub, async () => {
        await expect(db.query("select public.support_change_x_account($1, 'release', 'support:me', 'please unlink this one')", [id])).rejects.toThrow(/permission denied/);
      });
    }
    expect(await active(a)).toHaveLength(1);
  });

  it("requires an actor and a reason, audits the release, frees the name, and a repeat does nothing", async () => {
    const a = await addUser(db);
    const b = await addUser(db);
    await register(a, "ReleaseMe");
    const [{ id }] = await active(a);
    await expect(support(id, "release", "", "reason long enough")).rejects.toThrow(/actor_required/);
    await expect(support(id, "release", "support:alice", "short")).rejects.toThrow(/reason_required/);
    await expect(support(id, "delete", "support:alice", "reason long enough")).rejects.toThrow(/invalid_action/);

    expect(await support(id, "release", "support:alice", "Ticket 42: user sold the account")).toMatchObject({ status: "released", released_binding_id: id });
    expect(await support(id, "release", "support:alice", "Ticket 42: user sold the account")).toEqual({ status: "not_active" }); // duplicate admin op
    const released = (await rows<Record<string, unknown>>("select status, released_by, release_reason from public.x_account_bindings where id = $1", [id]))[0];
    expect(released).toEqual({ status: "released", released_by: "support:alice", release_reason: "Ticket 42: user sold the account" });
    expect(await rows("select action, actor from public.x_account_binding_events where binding_id = $1 order by id", [id])).toEqual([
      { action: "linked", actor: "self" },
      { action: "released", actor: "support:alice" },
    ]);
    // registration after an authorized unlink: the name is free again (for another account too)
    expect((await register(b, "releaseme")).status).toBe("linked");
    // and a released row can never be re-activated or edited
    await expect(db.query("update public.x_account_bindings set status = 'active', released_at = null, released_by = null, release_reason = null where id = $1", [id])).rejects.toThrow(/immutable/);
  });

  it("replace is atomic, audited, keeps the slot count, and obeys global uniqueness", async () => {
    const a = await addUser(db);
    const b = await addUser(db);
    await register(a, "Typo_Nmae");
    await register(a, "Second_A");
    await register(b, "Taken_By_B");
    const [typo] = (await active(a)).filter((x) => x.normalized_username === "typo_nmae");

    expect(await support(typo.id, "replace", "support:bob", "Ticket 7: spelling correction", "@taken_by_b")).toEqual({ status: "taken" });
    expect(await support(typo.id, "replace", "support:bob", "Ticket 7: spelling correction", "bad name!")).toEqual({ status: "invalid_username" });
    expect(await support(typo.id, "replace", "support:bob", "Ticket 7: spelling correction", "TYPO_NMAE")).toEqual({ status: "unchanged" });
    expect((await active(a)).map((x) => x.username).sort()).toEqual(["Second_A", "Typo_Nmae"]); // nothing changed

    const r = await support(typo.id, "replace", "support:bob", "Ticket 7: spelling correction", "Typo_Name");
    expect(r).toMatchObject({ status: "replaced", released_binding_id: typo.id });
    expect((await active(a)).map((x) => x.username).sort()).toEqual(["Second_A", "Typo_Name"]);
    expect(await rows("select action, actor, related_binding_id from public.x_account_binding_events where binding_id = $1", [r.new_binding_id])).toEqual([
      { action: "linked", actor: "support:bob", related_binding_id: typo.id },
    ]);
    expect(await support(typo.id, "replace", "support:bob", "Ticket 7: spelling correction", "Typo_Name")).toEqual({ status: "not_active" }); // repeat: no double link
    expect(await rows("select 1 from public.x_account_bindings where normalized_username = 'typo_name' and status = 'active'")).toHaveLength(1);
  });

  it("deleting a whole account (only possible without payment history) frees its names and is audited", async () => {
    const a = await addUser(db);
    await register(a, "GoneUser1");
    await db.query("delete from auth.users where id = $1", [a]);
    expect(await rows("select 1 from public.x_account_bindings where user_id = $1", [a])).toHaveLength(0);
    expect(await rows("select action, actor from public.x_account_binding_events where user_id = $1 order by id", [a])).toEqual([
      { action: "linked", actor: "self" },
      { action: "account_deleted", actor: "system" },
    ]);
  });
});

describe("paid slots ($0.99 add-on)", () => {
  it("a verified, finished slot payment grants exactly one slot; a third username then links", async () => {
    const u = await addUser(db);
    await register(u, "paid_one");
    await register(u, "paid_two");
    expect((await register(u, "paid_three")).status).toBe("no_slot");
    const { orderId } = await buySlot(u);
    expect(await rows("select status from public.checkout_orders where id = $1", [orderId])).toEqual([{ status: "fulfilled" }]);
    expect(await allowed(u)).toBe(3);
    expect((await register(u, "paid_three")).status).toBe("linked");
    expect((await register(u, "paid_four")).status).toBe("no_slot");
    // users can see their own grants
    await asRole(db, "authenticated", u, async () => {
      expect((await db.query("select slots, status from public.account_slot_grants")).rows).toEqual([{ slots: 1, status: "active" }]);
    });
  });

  it("pending, confirming, partially paid, failed and expired payments grant nothing", async () => {
    const u = await addUser(db);
    for (const [status, order_status] of [["pending", undefined], ["confirming", undefined], ["partially_paid", undefined], ["failed", "failed"], ["expired", "expired"]] as const) {
      const order = await slotOrder(u);
      expect(order.status).toBe("ok");
      const ref = `np_${order.order_id}`;
      expect(await apply(pay(order.order_id!, ref, status, false, order_status ? { order_status } : {}))).toBe("applied");
      // a "fulfill" flag on a non-succeeded payment is ignored too
      expect(await apply(pay(order.order_id!, ref, status, true, order_status ? { order_status } : {}))).toBe("applied");
      const [{ status: os }] = await rows<{ status: string }>("select status from public.checkout_orders where id = $1", [order.order_id]);
      expect(os).toBe(order_status ?? "pending");
      if (!order_status) await db.query("select public.close_checkout_order($1, 'expired')", [order.order_id]); // keep the open-order cap out of the way
    }
    expect(await rows("select 1 from public.account_slot_grants where user_id = $1", [u])).toHaveLength(0);
    expect(await allowed(u)).toBe(2);
  });

  it("duplicate and replayed webhooks never double-grant", async () => {
    const u = await addUser(db);
    const o = await slotOrder(u);
    const ref = `np_${o.order_id}`;
    const id = eid();
    expect(await apply(pay(o.order_id!, ref, "succeeded", true), id)).toBe("applied");
    expect(await apply(pay(o.order_id!, ref, "succeeded", true), id)).toBe("duplicate"); // same event
    expect(await apply(pay(o.order_id!, ref, "succeeded", true))).toBe("duplicate_fulfillment"); // same payment, new event id
    expect(await allowed(u)).toBe(3);
    expect(await rows("select 1 from public.account_slot_grants where user_id = $1", [u])).toHaveLength(1);
  });

  it("rejects wrong amount, currency, product, coin or reference, and never grants", async () => {
    const u = await addUser(db);
    const cases: [string, Record<string, unknown>][] = [
      ["amount", { amount_minor: 98 }],
      ["currency", { currency: "EUR" }],
      ["product", { product: "PRO_MONTHLY" }],
      ["asset", { asset: "btc" }],
    ];
    for (const [, extra] of cases) {
      const o = await slotOrder(u);
      expect(await apply(pay(o.order_id!, `np_${o.order_id}`, "succeeded", true, extra))).toBe("rejected:order_validation_failed");
      expect(await rows("select status from public.checkout_orders where id = $1", [o.order_id])).toEqual([{ status: "refund_required" }]);
    }
    const o = await slotOrder(u);
    expect(await apply(pay(o.order_id!, "some_other_payment", "succeeded", true))).toBe("rejected:order_reference_mismatch");
    expect(await rows("select 1 from public.account_slot_grants where user_id = $1", [u])).toHaveLength(0);
  });

  it("a slot payment cannot be applied to a Premium order and vice versa", async () => {
    const u = await addUser(db);
    const prem = (await db.query<{ r: { order_id: string } }>("select public.create_checkout_order($1,'nowpayments','PRO_MONTHLY','PRO_MONTHLY',199,'USD',null,30,3600) as r", [u])).rows[0].r;
    await db.query("select public.attach_order_ref($1, $2, null)", [prem.order_id, `np_${prem.order_id}`]);
    expect(await apply(pay(prem.order_id, `np_${prem.order_id}`, "succeeded", true))).toBe("rejected:order_validation_failed");
    expect(await rows("select 1 from public.account_slot_grants where user_id = $1", [u])).toHaveLength(0);
    expect(await rows("select 1 from public.subscriptions where user_id = $1", [u])).toHaveLength(0);
  });

  it("a full refund or a chargeback revokes the slot; already linked usernames stay linked (never silently unlinked)", async () => {
    const u = await addUser(db);
    const s1 = await buySlot(u);
    const s2 = await buySlot(u);
    for (const n of ["ref_a", "ref_b", "ref_c", "ref_d"]) expect((await register(u, n)).status).toBe("linked");
    expect(await allowed(u)).toBe(4);
    const adj = (ref: string, action: string) => ({ kind: "adjustment", provider_payment_id: ref, adjustment_id: `${action}:${ref}`, action, adj_type: "full", status: "approved", amount_minor: 99 });
    expect(await apply(adj(s1.ref, "refund"))).toBe("applied");
    expect(await apply(adj(s1.ref, "refund"))).toBe("duplicate_adjustment");
    expect(await apply(adj(s2.ref, "chargeback"))).toBe("applied");
    expect(await rows("select revoked_reason from public.account_slot_grants where user_id = $1 order by revoked_reason", [u])).toEqual([{ revoked_reason: "chargeback" }, { revoked_reason: "refund" }]);
    expect(await allowed(u)).toBe(2);
    expect(await active(u)).toHaveLength(4); // over capacity, but nothing is unlinked
    expect((await register(u, "ref_e")).status).toBe("no_slot");
  });

  it("a lifetime owner can still buy slots; at most 3 unpaid slot orders can be open", async () => {
    const u = await addUser(db);
    await db.query("insert into public.subscriptions (user_id, provider, plan, status) values ($1, 'nowpayments', 'PRO_LIFETIME', 'active')", [u]);
    expect((await slotOrder(u)).status).toBe("ok");
    expect((await slotOrder(u)).status).toBe("ok");
    expect((await slotOrder(u)).status).toBe("ok");
    expect(await slotOrder(u)).toEqual({ status: "error", code: "too_many_open_orders" });
    // the Premium lifetime guard is unchanged
    const r = (await db.query<{ r: R }>("select public.create_checkout_order($1,'nowpayments','PRO_LIFETIME','PRO_LIFETIME',5999,'USD',null,null,3600) as r", [u])).rows[0].r;
    expect(r).toEqual({ status: "error", code: "already_owned" });
  });

  it("order constraints: a slot has no plan and only uses NOWPayments; Premium orders still require their plan", async () => {
    const u = await addUser(db);
    const ins = (product: string, plan: string | null, provider = "nowpayments") =>
      db.query("insert into public.checkout_orders (user_id, provider, product, plan, expected_amount_minor) values ($1, $2, $3, $4, 99)", [u, provider, product, plan]);
    await expect(ins("X_ACCOUNT_SLOT", "PRO_MONTHLY")).rejects.toThrow(/plan_matches_product/);
    await expect(ins("X_ACCOUNT_SLOT", null, "paddle")).rejects.toThrow(/plan_matches_product/);
    await expect(ins("PRO_MONTHLY", null)).rejects.toThrow(/plan_matches_product/);
    await expect(ins("PRO_LIFETIME_EARLY", null)).rejects.toThrow(/plan_matches_product|early_is_lifetime/);
    await expect(ins("SOMETHING_ELSE", null)).rejects.toThrow(/checkout_orders_(product_check|plan_matches_product)/);
    await expect(ins("X_ACCOUNT_SLOT", null)).resolves.toBeDefined();
  });
});

describe("unrelated records are untouched", () => {
  it("linking usernames and buying slots never creates, resets or edits trials, subscriptions or x_profiles", async () => {
    const u = await addUser(db);
    await db.query("insert into public.x_profiles (user_id, x_username) values ($1, 'TrialName')", [u]);
    await db.query("select public.start_trial($1, 30)", [u]);
    await db.query("insert into public.subscriptions (user_id, provider, plan, status, current_period_end) values ($1, 'nowpayments', 'PRO_YEARLY', 'active', now() + interval '200 days')", [u]);
    const snap = async () => ({
      trials: await rows("select * from public.trials where user_id = $1", [u]),
      subs: await rows("select * from public.subscriptions where user_id = $1", [u]),
      xp: await rows("select * from public.x_profiles where user_id = $1", [u]),
      hist: await rows("select * from public.x_profile_history where user_id = $1", [u]),
    });
    const before = await snap();
    expect(before.trials).toHaveLength(1);

    await register(u, "TrialName"); // the trial username can be linked, but only explicitly
    await register(u, "Another_1");
    await buySlot(u);
    await register(u, "Third_One");
    const [b] = (await active(u)).filter((x) => x.normalized_username === "another_1");
    await support(b.id, "replace", "support:carol", "Ticket 9: correction request", "Another_2");

    expect(await snap()).toEqual(before);
    // a user with no trial gets no trial from linking
    const v = await addUser(db);
    await register(v, "NoTrialHere");
    expect(await rows("select 1 from public.trials where user_id = $1", [v])).toHaveLength(0);
  });

  it("the migration links nothing by itself: existing x_profiles are not turned into bindings", async () => {
    const u = await addUser(db);
    await db.query("insert into public.x_profiles (user_id, x_username) values ($1, 'NotAutoLinked')", [u]);
    expect(await rows("select 1 from public.x_account_bindings where normalized_username = 'notautolinked'")).toHaveLength(0);
  });
});
