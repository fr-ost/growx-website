"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";

const input = "h-10 w-full rounded-lg border border-border-strong bg-white px-3 text-sm focus:border-accent focus:outline-none";

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    return { ok: res.ok, json: (await res.json().catch(() => ({}))) as { error?: { message?: string } } };
  } catch {
    return { ok: false, json: { error: { message: "Network error." } } };
  }
}

/** Remaining-spots + enabled editor with an explicit confirmation step. The server validates and audits. */
export function EarlyBirdEditor({ remaining, enabled, sold, allocation, updatedAt }: { remaining: number; enabled: boolean; sold: number; allocation: number; updatedAt: string }) {
  const router = useRouter();
  const [value, setValue] = useState(String(remaining));
  const [on, setOn] = useState(enabled);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const max = Math.max(0, allocation - sold);
  const parsed = /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
  const valid = parsed !== null && parsed <= max;
  const changed = parsed !== remaining || on !== enabled;

  const save = async () => {
    setBusy(true);
    const r = await post("/api/admin/early-bird", { remaining: parsed, enabled: on, expectedUpdatedAt: updatedAt, ...(reason.trim() ? { reason: reason.trim() } : {}) });
    setBusy(false);
    setConfirming(false);
    if (r.ok) {
      setMsg({ tone: "success", text: "Saved." });
      setReason("");
      router.refresh();
    } else setMsg({ tone: "error", text: r.json.error?.message ?? "The change was not saved." });
  };

  return (
    <div className="space-y-3" data-testid="early-bird-editor">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Spots remaining (0 to {max})</span>
          <input id="eb_remaining" inputMode="numeric" value={value} onChange={(e) => { setValue(e.target.value); setConfirming(false); }} className={input} />
        </label>
        <label className="flex items-center gap-2 self-end text-sm font-semibold">
          <input id="eb_enabled" type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); setConfirming(false); }} /> Offer enabled
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Reason (optional)</span>
        <input id="eb_reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={input} />
      </label>
      {!valid ? <Notice tone="warn">Enter a whole number from 0 to {max}. Going higher needs an allocation increase (below).</Notice> : null}
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      {confirming && valid ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-2 p-3 text-sm">
          <span>
            Remaining {remaining} → <strong>{parsed}</strong>; offer {enabled ? "enabled" : "disabled"} → <strong>{on ? "enabled" : "disabled"}</strong>. Sales history and existing owners are not changed.
          </span>
          <Button size="sm" onClick={save} disabled={busy}>{busy ? <Spinner /> : null} Confirm and save</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={busy}>Cancel</Button>
        </div>
      ) : (
        <Button onClick={() => setConfirming(true)} disabled={!valid || !changed}>Review change</Button>
      )}
    </div>
  );
}

/** Separate, explicit and audited: raising the campaign allocation above its current ceiling. */
export function AllocationIncrease({ allocation }: { allocation: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(allocation + 1));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const n = /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN;
  const ok = Number.isInteger(n) && n > allocation && n <= 1000 && reason.trim().length >= 10;

  const save = async () => {
    if (!window.confirm(`Increase the early-bird campaign allocation from ${allocation} to ${n}? This is recorded in the audit log.`)) return;
    setBusy(true);
    const r = await post("/api/admin/early-bird/allocation", { allocation: n, reason: reason.trim() });
    setBusy(false);
    if (r.ok) {
      setMsg({ tone: "success", text: "Allocation increased. Set the remaining spots above to use it." });
      router.refresh();
    } else setMsg({ tone: "error", text: r.json.error?.message ?? "The change was not saved." });
  };

  return (
    <details className="rounded-lg border border-border p-3 text-sm">
      <summary className="cursor-pointer font-semibold">Exceptional: increase the campaign allocation (currently {allocation})</summary>
      <div className="mt-3 space-y-2">
        <input aria-label="New allocation" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} className={input} />
        <input aria-label="Reason (required)" placeholder="Reason (required, at least 10 characters)" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={input} />
        {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
        <Button size="sm" variant="secondary" onClick={save} disabled={!ok || busy}>{busy ? <Spinner /> : null} Increase allocation</Button>
      </div>
    </details>
  );
}
