"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Badge, Notice } from "@/components/ui/primitives";
import { GIFT_DURATIONS, durationLabel, type GiftDuration } from "@/lib/admin/durations";

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso)) + " UTC" : "Never (lifetime)");
const input = "h-10 w-full rounded-lg border border-border-strong bg-white px-3 text-sm focus:border-accent focus:outline-none";

export interface GiftView {
  id: string;
  recipient: string | null;
  duration: string;
  status: "active" | "expired" | "revoked";
  startsAt: string;
  expiresAt: string | null;
  reason: string | null;
  grantedBy: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
}
export interface GiftAuditView {
  id: number;
  action: string;
  admin: string | null;
  recipient: string | null;
  duration: string | null;
  prevExpiresAt: string | null;
  newExpiresAt: string | null;
  reason: string | null;
  createdAt: string;
}

async function call(url: string, method: string, body?: unknown): Promise<{ ok: boolean; json: { error?: { message?: string }; [k: string]: unknown } }> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
    return { ok: res.ok, json: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, json: { error: { message: "Network error." } } };
  }
}

function DurationPicker({ value, onChange, name }: { value: GiftDuration; onChange: (d: GiftDuration) => void; name: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Duration">
      {GIFT_DURATIONS.map((d) => (
        <label key={d.id} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold ${value === d.id ? "border-accent bg-accent-soft text-accent" : "border-border-strong"}`}>
          <input type="radio" className="sr-only" name={name} checked={value === d.id} onChange={() => onChange(d.id)} />
          {d.label}
        </label>
      ))}
    </div>
  );
}

/** Grant form: find a user by email, pick a duration, confirm. The server computes the expiry and re-checks admin rights. */
export function GrantGift() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<{ userId: string; email: string } | null>(null);
  const [duration, setDuration] = useState<GiftDuration>("30d");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setUser(null);
    setConfirming(false);
    const r = await call(`/api/admin/users?email=${encodeURIComponent(email.trim())}`, "GET");
    if (r.ok) setUser({ userId: String(r.json.userId), email: String(r.json.email) });
    else setMsg({ tone: "error", text: r.json.error?.message ?? "Not found." });
    setBusy(false);
  };

  const grant = async () => {
    if (!user) return;
    setBusy(true);
    const r = await call("/api/admin/gifts", "POST", { userId: user.userId, duration, ...(reason.trim() ? { reason: reason.trim() } : {}) });
    if (r.ok) {
      setMsg({ tone: "success", text: `Premium gifted to ${user.email} (${durationLabel(duration)}).` });
      setUser(null);
      setEmail("");
      setReason("");
      router.refresh();
    } else setMsg({ tone: "error", text: r.json.error?.message ?? "Could not grant the gift." });
    setConfirming(false);
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="gift_email">User email</label>
        <input id="gift_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className={input} />
        <Button type="submit" variant="secondary" disabled={busy}>Find user</Button>
      </form>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      {user ? (
        <div className="space-y-3 rounded-xl border border-border p-4" data-testid="gift-grant">
          <p className="text-sm">Recipient: <strong>{user.email}</strong></p>
          <DurationPicker value={duration} onChange={setDuration} name="grant_duration" />
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Internal reason (optional, not shown to the user)</span>
            <input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={input} id="gift_reason" />
          </label>
          {confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">Grant <strong>{durationLabel(duration)}</strong> of Premium to <strong>{user.email}</strong> now?</span>
              <Button onClick={grant} disabled={busy}>{busy ? <Spinner /> : null} Confirm grant</Button>
              <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setConfirming(true)}>Grant Premium</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function GiftActions({ gift }: { gift: GiftView }) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "extend" | "revoke">("none");
  const [duration, setDuration] = useState<GiftDuration>("30d");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (gift.status === "revoked") return null;
  const submit = async () => {
    setBusy(true);
    setErr(null);
    const r = await call(`/api/admin/gifts/${gift.id}`, "POST", mode === "extend" ? { action: "extend", duration, ...(reason.trim() ? { reason: reason.trim() } : {}) } : { action: "revoke", ...(reason.trim() ? { reason: reason.trim() } : {}) });
    setBusy(false);
    if (r.ok) {
      setMode("none");
      setReason("");
      router.refresh();
    } else setErr(r.json.error?.message ?? "The change was not saved.");
  };

  if (mode === "none")
    return (
      <span className="flex gap-2">
        {gift.expiresAt ? <Button size="sm" variant="secondary" onClick={() => setMode("extend")}>Extend</Button> : null}
        <Button size="sm" variant="ghost" onClick={() => setMode("revoke")}>Revoke</Button>
      </span>
    );
  return (
    <div className="mt-2 w-full space-y-2 rounded-lg bg-surface-2 p-3">
      {mode === "extend" ? <DurationPicker value={duration} onChange={setDuration} name={`extend_${gift.id}`} /> : <p className="text-sm">Revoke this gift? Paid subscriptions of this user are not affected.</p>}
      <input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className={input} aria-label="Reason" />
      {err ? <Notice tone="error">{err}</Notice> : null}
      <span className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={busy}>{busy ? <Spinner /> : null}{mode === "extend" ? `Confirm: add ${durationLabel(duration)}` : "Confirm revoke"}</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("none")} disabled={busy}>Cancel</Button>
      </span>
    </div>
  );
}

export function GiftList({ gifts }: { gifts: GiftView[] }) {
  if (!gifts.length) return <p className="text-sm text-muted">No gifts yet.</p>;
  return (
    <ul className="divide-y divide-border" aria-label="Gifts">
      {gifts.map((g) => (
        <li key={g.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm" data-testid="gift-row">
          <div className="min-w-0 space-y-0.5">
            <p className="font-semibold">
              {g.recipient ?? "(deleted account)"} · {durationLabel(g.duration)}{" "}
              <Badge tone={g.status === "active" ? "ok" : g.status === "revoked" ? "warn" : "neutral"}>{g.status === "active" ? "Active" : g.status === "revoked" ? "Revoked" : "Expired"}</Badge>
            </p>
            <p className="text-text-2">Granted {fmt(g.startsAt)} by {g.grantedBy} · Expires: {fmt(g.expiresAt)}</p>
            {g.reason ? <p className="text-muted">Reason: {g.reason}</p> : null}
            {g.revokedAt ? <p className="text-muted">Revoked {fmt(g.revokedAt)} by {g.revokedBy}{g.revokeReason ? ` (${g.revokeReason})` : ""}</p> : null}
          </div>
          <GiftActions gift={g} />
        </li>
      ))}
    </ul>
  );
}

export function GiftAudit({ rows }: { rows: GiftAuditView[] }) {
  if (!rows.length) return <p className="text-sm text-muted">No gift activity yet.</p>;
  return (
    <ul className="space-y-1 text-xs text-text-2" aria-label="Gift audit log">
      {rows.map((r) => (
        <li key={r.id}>
          {fmt(r.createdAt)} · <strong>{r.action}</strong> {r.duration ? durationLabel(r.duration) : ""} for {r.recipient} by {r.admin}
          {r.action !== "grant" ? ` · expiry ${r.prevExpiresAt ? fmt(r.prevExpiresAt) : "lifetime"} → ${r.newExpiresAt ? fmt(r.newExpiresAt) : "lifetime"}` : ""}
          {r.reason ? ` · "${r.reason}"` : ""}
        </li>
      ))}
    </ul>
  );
}
