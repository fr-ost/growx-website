import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { X_ACCOUNT_SLOT_PRICE_CENTS } from "@/config/pricing";
import { getBillable, isBillableId, slotCheckoutBodySchema } from "@/lib/billing/catalog";
import { mapNowPayment, nowEventId, type NowPayment } from "@/lib/billing/nowpayments";
import { normalizeXUsername } from "@/lib/x-accounts/username";
import { summarize } from "@/lib/x-accounts";
import { addUser, freshDb } from "./helpers/pg";

let db: PGlite;
beforeAll(async () => {
  db = await freshDb();
});
afterAll(async () => db.close());

describe("username normalization: TypeScript mirrors the database exactly", () => {
  const inputs = ["Name", "@Name", " @Name ", "\t@name_1\n", "@@name", "name@", "", "@", " ", "a", "A_B_C_D_E_F_G_H", "sixteen_chars_xx", "with space", "naïve", "dash-name", "dot.name", "x.com/name", "ＮＡＭＥ", "UPPER", "0", "_"];
  it.each(inputs)("%j", async (input) => {
    const sql = (await db.query<{ v: string | null }>("select public.x_username_display($1) as v", [input])).rows[0].v;
    const ts = normalizeXUsername(input);
    expect(ts?.username ?? null).toBe(sql);
    if (ts) expect(ts.normalizedUsername).toBe(sql!.toLowerCase());
  });
  it("base slots match the database", async () => {
    expect((await db.query<{ n: number }>("select public.x_account_base_slots() as n")).rows[0].n).toBe(summarize([], 0).baseAccountSlots);
  });
});

describe("slot product catalog", () => {
  it("is $0.99 one-time, grants no Premium plan, and its body accepts nothing", () => {
    expect(getBillable("X_ACCOUNT_SLOT")).toEqual({ id: "X_ACCOUNT_SLOT", plan: null, name: "Extra X account slot", amountMinor: 99, currency: "USD", cryptoPeriodDays: null });
    expect(X_ACCOUNT_SLOT_PRICE_CENTS).toBe(99);
    expect(isBillableId("X_ACCOUNT_SLOT")).toBe(true);
    expect(slotCheckoutBodySchema.safeParse({}).success).toBe(true);
    expect(slotCheckoutBodySchema.safeParse({ quantity: 2 }).success).toBe(false);
  });
});

describe("NOWPayments slot payments through the real billing_apply", () => {
  const np = (orderId: string, o: Partial<NowPayment> = {}): NowPayment => ({
    payment_id: `55${orderId.slice(-6)}`, payment_status: "finished", price_amount: 0.99, price_currency: "usd", pay_amount: "0.0016",
    actually_paid: "0.0016", pay_currency: "bnbbsc", order_id: orderId, updated_at: "2026-10-16T00:00:09Z", ...o,
  });
  async function order(user: string) {
    const r = (await db.query<{ r: { order_id: string } }>("select public.create_checkout_order($1,'nowpayments','X_ACCOUNT_SLOT',null,99,'USD',null,null,3600) as r", [user])).rows[0].r;
    return r.order_id;
  }
  /** What handleNowPaymentsIpn does after verification: bind the order to the payment + coin, then apply. */
  async function deliver(orderId: string, p: NowPayment) {
    await db.query("update public.checkout_orders set provider_ref = $2, asset = $3, status = 'pending' where id = $1 and status in ('created','pending')", [orderId, String(p.payment_id), p.pay_currency]);
    const effect = mapNowPayment(p, "X_ACCOUNT_SLOT");
    return (await db.query<{ r: { result: string } }>("select public.billing_apply('nowpayments',$1,$2,$3::timestamptz,$4::jsonb) as r", [nowEventId(p), `payment.${p.payment_status}`, p.updated_at, JSON.stringify(effect)])).rows[0].r.result;
  }
  const grants = async (u: string) => (await db.query<{ status: string }>("select status from public.account_slot_grants where user_id = $1", [u])).rows.map((r) => r.status);

  it("waiting -> confirming -> finished grants one slot exactly once; a refund revokes it", async () => {
    const u = await addUser(db);
    const o = await order(u);
    const base = np(o);
    expect(await deliver(o, { ...base, payment_status: "waiting", actually_paid: 0, updated_at: "2026-10-16T00:00:01Z" })).toBe("applied");
    expect(await deliver(o, { ...base, payment_status: "confirming", updated_at: "2026-10-16T00:00:02Z" })).toBe("applied");
    expect(await grants(u)).toEqual([]);
    const fin = { ...base, payment_status: "finished", updated_at: "2026-10-16T00:00:03Z" };
    expect(await deliver(o, fin)).toBe("applied");
    expect(await deliver(o, fin)).toBe("duplicate");
    expect(await grants(u)).toEqual(["active"]);
    expect(await deliver(o, { ...base, payment_status: "refunded", updated_at: "2026-10-16T00:00:04Z" })).toBe("applied");
    expect(await grants(u)).toEqual(["revoked"]);
  });

  it("an underpaid 'finished' payment, a different USD price, or a non-USD price never grants", async () => {
    const u = await addUser(db);
    for (const bad of [{ actually_paid: "0.0010" }, { price_amount: 0.5 }, { price_currency: "eur" }] as Partial<NowPayment>[]) {
      const o = await order(u);
      const r = await deliver(o, np(o, bad));
      expect(r === "applied" || r.startsWith("rejected:")).toBe(true);
    }
    expect(await grants(u)).toEqual([]);
  });

  it("failed and expired payments close the order without granting", async () => {
    const u = await addUser(db);
    for (const status of ["failed", "expired"]) {
      const o = await order(u);
      expect(await deliver(o, np(o, { payment_status: status, actually_paid: 0 }))).toBe("applied");
      expect((await db.query<{ status: string }>("select status from public.checkout_orders where id = $1", [o])).rows[0].status).toBe(status);
    }
    expect(await grants(u)).toEqual([]);
  });

  it("an unknown order product falls back to a value that fails the strict order check (never grants)", () => {
    const e = mapNowPayment(np("00000000-0000-4000-8000-000000000001"), "SOMETHING");
    expect(e.kind === "payment" && e.product).toBe("PRO_MONTHLY");
    const s = mapNowPayment(np("00000000-0000-4000-8000-000000000001"), "X_ACCOUNT_SLOT");
    expect(s.kind === "payment" && [s.product, s.amount_minor, s.fulfill]).toEqual(["X_ACCOUNT_SLOT", 99, true]);
  });
});
