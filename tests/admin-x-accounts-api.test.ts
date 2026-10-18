import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const apiUser = vi.fn();
const rpc = vi.fn();
let adminIds = new Set<string>();
const tableRows: Record<string, unknown[]> = {};

vi.mock("@/lib/api/guards", async (orig) => ({ ...(await orig<typeof import("@/lib/api/guards")>()), requireApiUser: (...a: unknown[]) => apiUser(...a) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    rpc: (...a: unknown[]) => rpc(...a),
    from: (table: string) => {
      const q = {
        select: () => q,
        order: () => q,
        limit: () => q,
        eq: (_c: string, id: string) => (table === "admins" ? { maybeSingle: async () => (adminIds.has(id) ? { data: { user_id: id }, error: null } : { data: null, error: null }) } : q),
        then: (ok: (v: unknown) => unknown) => Promise.resolve({ data: tableRows[table] ?? [], error: null }).then(ok),
      };
      return q;
    },
  }),
}));

const list = await import("@/app/api/admin/x-accounts/route");
const one = await import("@/app/api/admin/x-accounts/[id]/route");

const ADMIN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const BIND = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const H = { origin: "https://www.growxapp.org", host: "www.growxapp.org", "content-type": "application/json" };
const get = () => list.GET(new NextRequest("https://www.growxapp.org/api/admin/x-accounts?email=u@example.com", { headers: H }));
const post = (body: unknown) => one.POST(new NextRequest(`https://www.growxapp.org/api/admin/x-accounts/${BIND}`, { method: "POST", headers: H, body: JSON.stringify(body) }), { params: Promise.resolve({ id: BIND }) });
const as = (id: string) => apiUser.mockResolvedValue({ ok: true, user: { id, email_confirmed_at: "2026-01-01" } });

beforeEach(() => {
  vi.clearAllMocks();
  adminIds = new Set([ADMIN]);
  as(ADMIN);
  tableRows.x_account_bindings = [{ id: BIND, username: "Main", status: "active" }];
  tableRows.x_account_binding_events = [{ id: 1, action: "linked", username: "Main", actor: "self" }];
  rpc.mockImplementation(async (fn: string) => ({ data: fn === "admin_find_user" ? { status: "ok", user_id: USER, email: "u@example.com" } : { status: "replaced" }, error: null }));
});

describe("admin X-account routes", () => {
  it("non-admins get 404 and nothing is called", async () => {
    as(USER);
    expect((await get()).status).toBe(404);
    expect((await post({ action: "release", reason: "a long enough reason" })).status).toBe(404);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("lists a user's linked usernames and history", async () => {
    const body = await (await get()).json();
    expect(body).toMatchObject({ userId: USER, email: "u@example.com", bindings: [{ id: BIND, username: "Main" }], events: [{ action: "linked" }] });
  });
  it("replace/unlink pass the session admin id; strict bodies; reason of 10+ characters required", async () => {
    expect((await post({ action: "replace", newUsername: "NewName", reason: "Ticket 1: spelling" })).status).toBe(200);
    expect(rpc).toHaveBeenLastCalledWith("admin_change_x_account", { p_admin: ADMIN, p_binding_id: BIND, p_action: "replace", p_reason: "Ticket 1: spelling", p_new_username: "NewName" });
    rpc.mockResolvedValueOnce({ data: { status: "released" }, error: null });
    expect((await post({ action: "release", reason: "Ticket 2: sold account" })).status).toBe(200);
    for (const b of [{ action: "release", reason: "short" }, { action: "replace", reason: "a long enough reason" }, { action: "delete", reason: "a long enough reason" }, { action: "release", reason: "a long enough reason", admin: ADMIN }]) {
      expect((await post(b)).status, JSON.stringify(b)).toBe(400);
    }
  });
  it("a name linked to another account is refused with the standard message", async () => {
    rpc.mockResolvedValueOnce({ data: { status: "taken" }, error: null });
    const r = await post({ action: "replace", newUsername: "Taken", reason: "Ticket 3: wants that" });
    expect([r.status, (await r.json()).error.message]).toEqual([409, "This X username is already linked to another GrowX account."]);
  });
});
