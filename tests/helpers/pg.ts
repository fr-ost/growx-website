import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "../../supabase/migrations");

/** Stand-ins for the parts of Supabase our SQL depends on (auth schema + API roles). */
export const SUPABASE_STUBS = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
`;

export const migrationSql = () =>
  readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(path.join(MIGRATIONS_DIR, f), "utf8"));

export async function freshDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  for (const sql of migrationSql()) await db.exec(sql);
  await db.exec("grant all on all tables in schema public to service_role; grant all on all sequences in schema public to service_role;");
  return db;
}

let n = 0;
export const uid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

export async function addUser(db: { exec: (s: string) => Promise<unknown> }, id = uid()) {
  await db.exec(`insert into auth.users (id, email) values ('${id}', '${id}@example.com')`);
  return id;
}

/** Run fn as a Supabase API role with a given JWT subject (RLS applies). */
export async function asRole<T>(db: PGlite, role: "anon" | "authenticated" | "service_role", sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
