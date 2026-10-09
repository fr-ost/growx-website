import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Runs the REAL migration against an in-process Postgres (PGlite) with minimal
 * stand-ins for Supabase's auth schema and roles, then checks RLS, grants and
 * the trial function behave as designed.
 */
const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const C = "33333333-3333-3333-3333-333333333333";

let db: PGlite;

async function as(role: "anon" | "authenticated" | "service_role" | "postgres", uid: string | null, fn: () => Promise<void>) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  try {
    await fn();
  } finally {
    await db.exec("reset role");
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant usage on schema public to anon, authenticated, service_role;
  `);
  const dir = path.resolve(import.meta.dirname, "../supabase/migrations");
  for (const f of readdirSync(dir).sort()) await db.exec(readFileSync(path.join(dir, f), "utf8"));
  // service_role is granted table privileges by Supabase defaults.
  await db.exec("grant all on all tables in schema public to service_role; grant all on all sequences in schema public to service_role;");
  await db.exec(`insert into auth.users (id, email) values ('${A}','a@example.com'), ('${B}','b@example.com'), ('${C}','c@example.com');`);
});

afterAll(async () => db.close());

describe("schema + RLS", () => {
  it("creates a profile automatically for each auth user", async () => {
    const r = await db.query("select id from public.profiles order by email");
    expect(r.rows).toHaveLength(3);
  });

  it("anon has no access to any table", async () => {
    await as("anon", null, async () => {
      await expect(db.query("select * from public.profiles")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from public.trials")).rejects.toThrow(/permission denied/);
    });
  });

  it("users can read only their own profile", async () => {
    await as("authenticated", A, async () => {
      const r = await db.query<{ email: string }>("select email from public.profiles");
      expect(r.rows.map((x) => x.email)).toEqual(["a@example.com"]);
    });
  });

  it("users cannot insert or update trials, subscriptions or payments", async () => {
    await as("authenticated", A, async () => {
      await expect(
        db.query(`insert into public.trials (user_id, x_username_normalized, expires_at) values ('${A}','x', now() + interval '14 days')`),
      ).rejects.toThrow(/permission denied/);
      await expect(
        db.query(`insert into public.subscriptions (user_id, provider, plan, status) values ('${A}','paddle','PRO_LIFETIME','active')`),
      ).rejects.toThrow(/permission denied/);
      await expect(
        db.query(`insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status) values ('${A}','paddle','p1','PRO_LIFETIME',2999,'USD','succeeded')`),
      ).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from public.webhook_events")).rejects.toThrow(/permission denied/);
    });
  });

  it("users cannot call start_trial directly", async () => {
    await as("authenticated", A, async () => {
      await expect(db.query(`select * from public.start_trial('${A}', 14)`)).rejects.toThrow(/permission denied/);
    });
  });

  it("x_profiles: users manage only their own row and cannot spoof user_id", async () => {
    await as("authenticated", A, async () => {
      await db.query(`insert into public.x_profiles (user_id, x_username) values ('${A}', 'Alice_X')`);
      await expect(db.query(`insert into public.x_profiles (user_id, x_username) values ('${B}', 'spoof')`)).rejects.toThrow(/row-level security/);
      await expect(db.query(`insert into public.x_profiles (user_id, x_username) values ('${A}', 'not valid!')`)).rejects.toThrow();
      const own = await db.query<{ x_username_normalized: string }>("select x_username_normalized from public.x_profiles");
      expect(own.rows).toEqual([{ x_username_normalized: "alice_x" }]);
      // Cannot edit the normalized (generated) column or reassign ownership.
      await expect(db.query("update public.x_profiles set x_username_normalized = 'other'")).rejects.toThrow();
      await expect(db.query(`update public.x_profiles set user_id = '${B}'`)).rejects.toThrow(/permission denied/);
    });
    await as("authenticated", B, async () => {
      const r = await db.query("select * from public.x_profiles");
      expect(r.rows).toHaveLength(0); // cannot see A's row
      const upd = await db.query("update public.x_profiles set x_username = 'hijack' returning *");
      expect(upd.rows).toHaveLength(0); // update silently affects no rows
    });
  });
});

describe("trial creation", () => {
  const start = (uid: string) => db.query<{ started_at: string; expires_at: string }>(`select * from public.start_trial('${uid}', 14)`);

  it("requires an X username", async () => {
    await as("service_role", null, async () => {
      await expect(start(B)).rejects.toThrow(/x_username_required/);
    });
  });

  it("starts a 14-day trial using the database clock", async () => {
    await as("service_role", null, async () => {
      const r = await start(A);
      const t = r.rows[0];
      const days = (new Date(t.expires_at).getTime() - new Date(t.started_at).getTime()) / 86400000;
      expect(days).toBeCloseTo(14, 3);
    });
  });

  it("refuses a second trial for the same account, even after a username change", async () => {
    await as("authenticated", A, async () => {
      await db.query("update public.x_profiles set x_username = 'Alice_New'");
    });
    await as("service_role", null, async () => {
      await expect(start(A)).rejects.toThrow(/trials_user_id_key/);
    });
    const hist = await db.query("select x_username from public.x_profile_history where user_id = $1 order by id", [A]);
    expect(hist.rows.map((r) => (r as { x_username: string }).x_username)).toEqual(["Alice_X", "Alice_New"]);
    const trials = await db.query("select x_username_normalized from public.trials where user_id = $1", [A]);
    expect(trials.rows).toEqual([{ x_username_normalized: "alice_x" }]); // history preserved
  });

  it("refuses a second account reusing the same self-reported username", async () => {
    await as("authenticated", C, async () => {
      await db.query(`insert into public.x_profiles (user_id, x_username) values ('${C}', 'ALICE_X')`);
    });
    await as("service_role", null, async () => {
      await expect(start(C)).rejects.toThrow(/trials_x_username_key/);
    });
  });

  it("users can read their own trial but not others'", async () => {
    await as("authenticated", A, async () => {
      expect((await db.query("select * from public.trials")).rows).toHaveLength(1);
    });
    await as("authenticated", B, async () => {
      expect((await db.query("select * from public.trials")).rows).toHaveLength(0);
    });
  });
});

describe("billing constraints", () => {
  it("rejects a lifetime subscription with a period end and a recurring one without", async () => {
    await expect(
      db.query(`insert into public.subscriptions (user_id, provider, plan, status, current_period_end) values ('${A}','paddle','PRO_LIFETIME','active', now())`),
    ).rejects.toThrow(/subscriptions_period_matches_plan/);
    await expect(
      db.query(`insert into public.subscriptions (user_id, provider, plan, status) values ('${A}','paddle','PRO_MONTHLY','active')`),
    ).rejects.toThrow(/subscriptions_period_matches_plan/);
  });

  it("enforces idempotency keys for payments and webhook events", async () => {
    await db.exec(`insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status) values ('${A}','paddle','txn_1','PRO_LIFETIME',2999,'USD','succeeded')`);
    await expect(
      db.exec(`insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status) values ('${A}','paddle','txn_1','PRO_LIFETIME',2999,'USD','succeeded')`),
    ).rejects.toThrow(/payments_provider_payment_key/);
    await db.exec("insert into public.webhook_events (provider, event_id, event_type) values ('paddle','evt_1','transaction.completed')");
    await expect(db.exec("insert into public.webhook_events (provider, event_id, event_type) values ('paddle','evt_1','transaction.completed')")).rejects.toThrow(/webhook_events_provider_event_key/);
  });

  it("users read only their own payments", async () => {
    await as("authenticated", A, async () => expect((await db.query("select * from public.payments")).rows).toHaveLength(1));
    await as("authenticated", B, async () => expect((await db.query("select * from public.payments")).rows).toHaveLength(0));
  });
});

describe("past_due constraint", () => {
  it("requires past_due_since when status is past_due", async () => {
    await expect(
      db.exec(`insert into public.subscriptions (user_id, provider, plan, status, current_period_end) values ('${B}','paddle','PRO_MONTHLY','past_due', now())`),
    ).rejects.toThrow(/subscriptions_past_due_requires_since/);
    await db.exec(`insert into public.subscriptions (user_id, provider, plan, status, current_period_end, past_due_since) values ('${B}','paddle','PRO_MONTHLY','past_due', now(), now())`);
  });
});

describe("early adopter slots", () => {
  let n = 0;
  const pay = async (status: string, product = "PRO_LIFETIME_EARLY") => {
    const r = await db.query<{ id: string }>(
      `insert into public.payments (user_id, provider, provider_payment_id, product, amount_minor, currency, status) values ('${B}','paddle','ea_${++n}','${product}',99,'USD','${status}') returning id`,
    );
    return r.rows[0].id;
  };
  const claim = async (id: string) => (await db.query<{ s: number | null }>(`select public.claim_early_adopter_slot('${id}') as s`)).rows[0].s;

  it("is not callable by users or anon", async () => {
    const id = await pay("succeeded");
    await as("authenticated", B, async () => {
      await expect(db.query(`select public.claim_early_adopter_slot('${id}')`)).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.early_adopter_available()")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from public.early_adopter_slots")).rejects.toThrow(/permission denied/);
    });
  });

  it("never gives a slot to failed, pending, canceled-like or non-early payments", async () => {
    for (const st of ["pending", "failed", "refunded", "disputed"]) expect(await claim(await pay(st))).toBeNull();
    expect(await claim(await pay("succeeded", "PRO_LIFETIME"))).toBeNull();
    expect(await claim("99999999-9999-9999-9999-999999999999")).toBeNull();
  });

  it("is idempotent per payment, allocates 1..100 and sells out at exactly 100", async () => {
    await as("service_role", null, async () => {
      const first = await pay("succeeded");
      expect(await claim(first)).toBe(1);
      expect(await claim(first)).toBe(1); // duplicate webhook
      for (let i = 2; i <= 100; i++) expect(await claim(await pay("succeeded"))).toBe(i);
      expect((await db.query<{ a: boolean }>("select public.early_adopter_available() as a")).rows[0].a).toBe(false);
      expect(await claim(await pay("succeeded"))).toBeNull(); // 101st
      expect(await claim(first)).toBe(1); // earlier buyers keep their slot
    });
    const c = await db.query<{ n: number }>("select count(*)::int as n from public.early_adopter_slots");
    expect(c.rows[0].n).toBe(100);
  });

  it("slots survive a later refund (no reuse)", async () => {
    await db.exec("update public.payments set status = 'refunded' where provider_payment_id = 'ea_8'");
    expect((await db.query<{ a: boolean }>("select public.early_adopter_available() as a")).rows[0].a).toBe(false);
  });
});
