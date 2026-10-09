import { afterEach, describe, expect, it } from "vitest";
import { getSupabasePublicConfig, getSupabaseServiceKey } from "@/lib/env";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
];
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
const clear = () => KEYS.forEach((k) => delete process.env[k]);
afterEach(() => KEYS.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]))));

describe("Supabase env resolution", () => {
  it("accepts the names created by the Vercel Supabase integration", () => {
    clear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co/";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    expect(getSupabasePublicConfig()).toEqual({ url: "https://abc.supabase.co", key: "anon" });
  });

  it("prefers the publishable key and falls back to server-side names", () => {
    clear();
    process.env.SUPABASE_URL = "https://srv.supabase.co";
    process.env.SUPABASE_ANON_KEY = "a";
    expect(getSupabasePublicConfig()).toEqual({ url: "https://srv.supabase.co", key: "a" });
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pub";
    expect(getSupabasePublicConfig()?.key).toBe("pub");
  });

  it("returns null when incomplete, ignoring blank values", () => {
    clear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "  ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "x";
    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("accepts the legacy service_role key or the new secret key", () => {
    clear();
    expect(getSupabaseServiceKey()).toBeNull();
    process.env.SUPABASE_SECRET_KEY = "sb_secret_x";
    expect(getSupabaseServiceKey()).toBe("sb_secret_x");
    process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy";
    expect(getSupabaseServiceKey()).toBe("legacy");
  });
});
