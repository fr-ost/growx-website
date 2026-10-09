import { describe, expect, it } from "vitest";
import { classifyDbError } from "@/lib/db/errors";
import { resolveOrigin } from "@/lib/origin";
import { PRODUCTION_URL, resolveSiteUrl } from "@/config/site";

const hdrs = (o: Record<string, string>) => ({ get: (k: string) => o[k.toLowerCase()] ?? null });

describe("classifyDbError", () => {
  it.each([
    [{ code: "PGRST205", message: "Could not find the table 'public.trials' in the schema cache" }, "table_missing"],
    [{ code: "42P01", message: 'relation "public.trials" does not exist' }, "table_missing"],
    [{ code: "42703", message: "column subscriptions.past_due_since does not exist" }, "column_missing"],
    [{ code: "PGRST202", message: "Could not find the function public.start_trial" }, "function_missing"],
    [{ code: "42501", message: "permission denied for table payments" }, "permission_denied"],
    [{ code: "PGRST301", message: "JWT expired" }, "auth"],
    [{ code: "", message: "TypeError: fetch failed" }, "unreachable"],
    [{ code: "XX000", message: "boom" }, "unknown"],
  ])("%j -> %s", (err, kind) => expect(classifyDbError(err)).toBe(kind));
});

describe("resolveOrigin (auth email redirect base)", () => {
  const fb = PRODUCTION_URL;
  it("uses the production host behind Vercel's proxy", () => {
    expect(resolveOrigin(hdrs({ "x-forwarded-host": "www.growxapp.org", "x-forwarded-proto": "https" }), { vercelEnv: "production", fallback: fb })).toBe(
      "https://www.growxapp.org",
    );
  });
  it("keeps localhost for local development", () => {
    expect(resolveOrigin(hdrs({ host: "localhost:3000" }), { vercelEnv: undefined, fallback: fb })).toBe("http://localhost:3000");
  });
  it("never yields localhost in a production deployment", () => {
    expect(resolveOrigin(hdrs({ host: "localhost:3000" }), { vercelEnv: "production", fallback: fb })).toBe(fb);
  });
  it("rejects malformed hosts and takes the first forwarded value", () => {
    expect(resolveOrigin(hdrs({ host: "evil.com/path" }), { fallback: fb })).toBe(fb);
    expect(resolveOrigin(hdrs({ "x-forwarded-host": "www.growxapp.org, other", "x-forwarded-proto": "https,http" }), { fallback: fb })).toBe(
      "https://www.growxapp.org",
    );
  });
});

describe("resolveSiteUrl", () => {
  it("defaults to production and ignores localhost in production", () => {
    expect(resolveSiteUrl(undefined, undefined)).toBe(PRODUCTION_URL);
    expect(resolveSiteUrl("http://localhost:3000", "production")).toBe(PRODUCTION_URL);
    expect(resolveSiteUrl("http://localhost:3000", undefined)).toBe("http://localhost:3000");
    expect(resolveSiteUrl("https://www.growxapp.org/", "production")).toBe("https://www.growxapp.org");
    expect(resolveSiteUrl("not a url", "production")).toBe(PRODUCTION_URL);
  });
});
