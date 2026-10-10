import { execFileSync, spawnSync } from "node:child_process";
import { chownSync, existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { Pool } from "pg";
import { SUPABASE_STUBS, migrationSql } from "./pg";

/** Finds a local PostgreSQL server install (Debian/Ubuntu layout). Returns null when unavailable. */
export function findPostgresBin(): string | null {
  const root = "/usr/lib/postgresql";
  if (!existsSync(root)) return null;
  const versions = readdirSync(root).sort((a, b) => Number(b) - Number(a));
  for (const v of versions) {
    const bin = path.join(root, v, "bin");
    if (existsSync(path.join(bin, "initdb")) && existsSync(path.join(bin, "pg_ctl"))) return bin;
  }
  return null;
}

const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });

export interface RealPg {
  pool: Pool;
  stop: () => Promise<void>;
}

/** Starts a throwaway PostgreSQL server (as `postgres` when running as root), applies every migration, returns a pool. */
export async function startRealPg(): Promise<RealPg> {
  const bin = findPostgresBin();
  if (!bin) throw new Error("no postgres");
  const root = process.getuid?.() === 0;
  const base = mkdtempSync("/var/tmp/growx-pg-");
  if (root) chownSync(base, Number(execFileSync("id", ["-u", "postgres"]).toString()), -1);
  const run = (cmd: string, args: string[]) => {
    const [c, a] = root ? ["runuser", ["-u", "postgres", "--", path.join(bin, cmd), ...args]] : [path.join(bin, cmd), args];
    const r = spawnSync(c as string, a as string[], { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr}`);
  };
  const data = path.join(base, "data");
  const port = await freePort();
  run("initdb", ["-D", data, "-A", "trust", "-U", "postgres"]);
  run("pg_ctl", ["-D", data, "-o", `-p ${port} -k ${base} -c listen_addresses=127.0.0.1 -c fsync=off -c max_connections=200`, "-l", path.join(base, "log"), "-w", "start"]);

  const pool = new Pool({ host: "127.0.0.1", port, user: "postgres", database: "postgres", max: 60 });
  await pool.query(SUPABASE_STUBS);
  for (const sql of migrationSql()) await pool.query(sql);
  await pool.query("grant all on all tables in schema public to service_role; grant all on all sequences in schema public to service_role;");

  return {
    pool,
    stop: async () => {
      await pool.end();
      try {
        run("pg_ctl", ["-D", data, "stop", "-m", "immediate"]);
      } finally {
        rmSync(base, { recursive: true, force: true });
      }
    },
  };
}
