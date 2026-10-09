import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { startTrial } from "@/lib/trial/start";

const fakeAdmin = (result: { data?: unknown; error?: { code?: string; message?: string } | null }) => {
  const rpc = vi.fn().mockResolvedValue({ data: result.data ?? null, error: result.error ?? null });
  return { client: { rpc } as unknown as SupabaseClient, rpc };
};

describe("startTrial", () => {
  it("rejects unverified emails without touching the database", async () => {
    const { client, rpc } = fakeAdmin({});
    expect(await startTrial(client, { id: "u1", emailConfirmed: false })).toEqual({ ok: false, reason: "email_not_verified" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls start_trial with the verified user id and 14 days", async () => {
    const { client, rpc } = fakeAdmin({ data: { started_at: "2026-10-09T00:00:00Z", expires_at: "2026-10-23T00:00:00Z" } });
    const r = await startTrial(client, { id: "u1", emailConfirmed: true });
    expect(r).toEqual({ ok: true, startedAt: "2026-10-09T00:00:00Z", expiresAt: "2026-10-23T00:00:00Z" });
    expect(rpc).toHaveBeenCalledWith("start_trial", { p_user_id: "u1", p_days: 14 });
  });

  it("maps repeat calls (unique violation on user) to already_used", async () => {
    const { client } = fakeAdmin({ error: { code: "23505", message: 'duplicate key value violates unique constraint "trials_user_id_key"' } });
    expect(await startTrial(client, { id: "u1", emailConfirmed: true })).toEqual({ ok: false, reason: "already_used" });
  });

  it("maps username reuse to username_already_used", async () => {
    const { client } = fakeAdmin({ error: { code: "23505", message: 'duplicate key value violates unique constraint "trials_x_username_key"' } });
    expect(await startTrial(client, { id: "u1", emailConfirmed: true })).toEqual({ ok: false, reason: "username_already_used" });
  });

  it("maps a missing username", async () => {
    const { client } = fakeAdmin({ error: { code: "P0001", message: "x_username_required" } });
    expect(await startTrial(client, { id: "u1", emailConfirmed: true })).toEqual({ ok: false, reason: "x_username_required" });
  });

  it("returns a generic error for anything else", async () => {
    const { client } = fakeAdmin({ error: { code: "XX000", message: "boom" } });
    expect(await startTrial(client, { id: "u1", emailConfirmed: true })).toEqual({ ok: false, reason: "error" });
  });
});
