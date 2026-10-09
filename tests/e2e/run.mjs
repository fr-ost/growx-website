// Builds the app against a local mock Supabase, starts it, runs the browser
// flows, then shuts everything down. Usage: npm run test:e2e
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const root = new URL("../../", import.meta.url).pathname;
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key", // also exercises the Vercel-integration variable name
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
  NEXT_PUBLIC_SITE_URL: "https://www.growxapp.org",
};

const build = spawnSync("node", ["node_modules/next/dist/bin/next", "build"], { cwd: root, env, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const mock = spawn("node", ["tests/e2e/mock-supabase.mjs"], { cwd: root, env, stdio: "ignore" });
const app = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", "3113"], { cwd: root, env, stdio: "ignore" });
const stop = () => {
  mock.kill();
  app.kill();
};
process.on("exit", stop);

for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch("http://localhost:3113/api/health")).ok) break;
  } catch {}
  await sleep(500);
}
const flows = spawnSync("node", ["tests/e2e/flows.mjs"], { cwd: root, env, stdio: "inherit" });
stop();
process.exit(flows.status ?? 1);
