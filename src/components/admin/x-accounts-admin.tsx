"use client";

import { useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Badge, Notice } from "@/components/ui/primitives";

const input = "h-10 w-full rounded-lg border border-border-strong bg-white px-3 text-sm focus:border-accent focus:outline-none";
const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso)) + " UTC" : "");

interface Binding {
  id: string;
  username: string;
  status: "active" | "released";
  linked_by: string;
  created_at: string;
  released_at: string | null;
  released_by: string | null;
  release_reason: string | null;
}
interface Event {
  id: number;
  action: string;
  username: string;
  actor: string;
  reason: string | null;
  created_at: string;
}
interface Result {
  userId: string;
  email: string;
  bindings: Binding[];
  events: Event[];
}

async function call(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" }, cache: "no-store" });
    return { ok: res.ok, json: (await res.json().catch(() => ({}))) as Result & { error?: { message?: string } } };
  } catch {
    return { ok: false, json: { error: { message: "Network error." } } as Result & { error?: { message?: string } } };
  }
}

function BindingRow({ b, onDone }: { b: Binding; onDone: (msg: string) => void }) {
  const [mode, setMode] = useState<"none" | "replace" | "release">("none");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    const r = await call(`/api/admin/x-accounts/${b.id}`, {
      method: "POST",
      body: JSON.stringify(mode === "replace" ? { action: "replace", newUsername: name.trim(), reason: reason.trim() } : { action: "release", reason: reason.trim() }),
    });
    setBusy(false);
    if (r.ok) {
      setMode("none");
      onDone(mode === "replace" ? `@${b.username} was changed to @${name.trim().replace(/^@/, "")}.` : `@${b.username} was unlinked.`);
    } else setErr(r.json.error?.message ?? "The change was not saved.");
  };

  return (
    <li className="py-3 text-sm" data-testid="admin-binding">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">
          @{b.username} <Badge tone={b.status === "active" ? "ok" : "neutral"}>{b.status === "active" ? "Linked" : "Unlinked"}</Badge>
        </span>
        {b.status === "active" && mode === "none" ? (
          <span className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setMode("replace")}>Change username</Button>
            <Button size="sm" variant="ghost" onClick={() => setMode("release")}>Unlink</Button>
          </span>
        ) : null}
      </div>
      <p className="text-text-2">Linked {fmt(b.created_at)} by {b.linked_by}</p>
      {b.released_at ? <p className="text-muted">Unlinked {fmt(b.released_at)} by {b.released_by}{b.release_reason ? ` (${b.release_reason})` : ""}</p> : null}
      {mode !== "none" ? (
        <div className="mt-2 space-y-2 rounded-lg bg-surface-2 p-3">
          {mode === "replace" ? (
            <input aria-label="New X username" placeholder="new_username" value={name} maxLength={64} onChange={(e) => setName(e.target.value)} className={input} />
          ) : (
            <p>Unlink @{b.username}? It frees one of the user&apos;s slots and the name can then be linked by anyone.</p>
          )}
          <input aria-label="Reason" placeholder="Reason (required, at least 10 characters), e.g. ticket number" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={input} />
          {err ? <Notice tone="error">{err}</Notice> : null}
          <span className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={busy || reason.trim().length < 10 || (mode === "replace" && !name.trim())}>
              {busy ? <Spinner /> : null}
              {mode === "replace" ? `Confirm: change to @${name.trim().replace(/^@/, "") || "…"}` : "Confirm unlink"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode("none")} disabled={busy}>Cancel</Button>
          </span>
        </div>
      ) : null}
    </li>
  );
}

/** Find a user by email and correct or unlink their linked X usernames. Every change is audited server-side. */
export function XAccountsAdmin() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = async (addr: string) => {
    const r = await call(`/api/admin/x-accounts?email=${encodeURIComponent(addr)}`);
    if (r.ok) setData(r.json);
    else {
      setData(null);
      setMsg({ tone: "error", text: r.json.error?.message ?? "Not found." });
    }
  };
  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    await load(email.trim());
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="xadmin_email">User email</label>
        <input id="xadmin_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className={input} />
        <Button type="submit" variant="secondary" disabled={busy}>Find user</Button>
      </form>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      {data ? (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm">Account: <strong>{data.email}</strong></p>
          {data.bindings.length ? (
            <ul className="divide-y divide-border" aria-label="Linked X usernames">
              {data.bindings.map((b) => (
                <BindingRow
                  key={b.id}
                  b={b}
                  onDone={async (text) => {
                    setMsg({ tone: "success", text });
                    await load(data.email);
                  }}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">This account has no linked X usernames.</p>
          )}
          {data.events.length ? (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">History</h3>
              <ul className="space-y-1 text-xs text-text-2" aria-label="X account history">
                {data.events.map((e) => (
                  <li key={e.id}>{fmt(e.created_at)} · <strong>{e.action}</strong> @{e.username} by {e.actor}{e.reason ? ` · "${e.reason}"` : ""}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
