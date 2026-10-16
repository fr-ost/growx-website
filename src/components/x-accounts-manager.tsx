"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Badge, Notice } from "@/components/ui/primitives";
import type { XAccountSummary } from "@/lib/x-accounts";
import { normalizeXUsername } from "@/lib/x-accounts/username";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Account page: permanently link X usernames (with an explicit confirmation step) and buy extra slots.
 * Everything shown here is the server's state; capacity is decided by the database, never by this component.
 */
export function XAccountsManager({
  summary,
  priceLabel,
  checkoutAvailable,
  suggestion,
}: {
  summary: XAccountSummary;
  priceLabel: string;
  checkoutAvailable: boolean;
  /** The trial X username from the dashboard, offered as a starting value only (never linked without confirmation). */
  suggestion: string | null;
}) {
  const router = useRouter();
  const alreadyLinked = new Set(summary.linkedXAccounts.map((a) => a.normalizedUsername));
  const initial = suggestion && !alreadyLinked.has(suggestion.toLowerCase()) ? suggestion : "";
  const [input, setInput] = useState(initial);
  const [pending, setPending] = useState<{ username: string } | null>(null);
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState<"link" | "buy" | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const full = summary.availableAccountSlots <= 0;

  const review = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const n = normalizeXUsername(input);
    if (!n) return setMessage({ tone: "error", text: "Enter a valid X username: 1 to 15 letters, numbers or underscores." });
    if (alreadyLinked.has(n.normalizedUsername)) return setMessage({ tone: "error", text: `@${n.username} is already linked to your account.` });
    setUnderstood(false);
    setPending({ username: n.username });
  };

  const link = async () => {
    if (!pending) return;
    setBusy("link");
    setMessage(null);
    try {
      const res = await fetch("/api/x-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: pending.username, confirm: true }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ tone: "success", text: `@${pending.username} is now permanently linked to your GrowX account.` });
        setPending(null);
        setInput("");
        router.refresh();
      } else {
        setMessage({ tone: "error", text: json.error?.message ?? "Could not link the X username. Try again." });
        if (json.error?.code !== "session_check_unavailable") setPending(null);
      }
    } catch {
      setMessage({ tone: "error", text: "Network error. Nothing was linked. Try again." });
    }
    setBusy(null);
  };

  const buySlot = async () => {
    setBusy("buy");
    setMessage(null);
    try {
      const res = await fetch("/api/x-accounts/slots/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && typeof json.invoiceUrl === "string" && json.invoiceUrl.startsWith("https://")) {
        window.location.assign(json.invoiceUrl);
        return;
      }
      setMessage({ tone: "error", text: json.error?.message ?? "Could not start the slot payment. Try again." });
    } catch {
      setMessage({ tone: "error", text: "Network error. Try again." });
    }
    setBusy(null);
  };

  return (
    <div className="space-y-5" id="x-accounts">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4" data-testid="x-slot-stats">
        {[
          ["Slots used", `${summary.usedAccountSlots} of ${summary.allowedAccountSlots}`],
          ["Available", String(summary.availableAccountSlots)],
          ["Included free", String(summary.baseAccountSlots)],
          ["Extra purchased", String(summary.purchasedExtraSlots)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-1 text-lg font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      {summary.linkedXAccounts.length > 0 ? (
        <ul className="divide-y divide-border rounded-xl border border-border" aria-label="Linked X accounts">
          {summary.linkedXAccounts.map((a) => (
            <li key={a.normalizedUsername} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="font-semibold">@{a.username}</span>
              <span className="flex items-center gap-3 text-sm text-muted">
                Linked {fmt(a.linkedAt)} <Badge tone="ok">Linked permanently</Badge>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-2">No X usernames linked yet.</p>
      )}

      <p className="text-sm text-text-2">
        Each X username you link is <strong>permanent</strong>: it cannot be changed or removed from this page, and it cannot be linked to any other GrowX account.
        For a correction, contact support. Your account includes {summary.baseAccountSlots} X account slots; extra slots cost {priceLabel} each, one-time.
        Linking lists the usernames GrowX may be used with; it does not sign in to X or verify ownership.
      </p>

      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      {pending ? (
        <div className="space-y-4 rounded-xl border border-accent/40 bg-accent/5 p-5" role="dialog" aria-labelledby="x-confirm-title">
          <p id="x-confirm-title" className="font-bold">Permanently link @{pending.username}?</p>
          <p className="text-sm text-text-2">
            Check the spelling carefully. After you confirm, <strong>@{pending.username}</strong> stays linked to this GrowX account and uses one slot permanently.
            You will not be able to change or remove it yourself; only support can correct it.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
            <span>I understand this X username will be permanently linked and cannot be changed without contacting support.</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <Button onClick={link} disabled={!understood || busy !== null}>
              {busy === "link" ? <Spinner /> : null}
              {busy === "link" ? "Linking..." : `Link @${pending.username} permanently`}
            </Button>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={busy !== null}>
              Go back
            </Button>
          </div>
        </div>
      ) : full ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border-strong p-5">
          <p className="font-semibold">All your X account slots are in use.</p>
          <p className="text-sm text-text-2">
            Buy one extra slot for {priceLabel} (one-time, paid in crypto). The slot is added after the payment is confirmed on the network, never before.
          </p>
          {checkoutAvailable ? (
            <Button onClick={buySlot} disabled={busy !== null}>
              {busy === "buy" ? <Spinner /> : null}
              {busy === "buy" ? "Opening secure payment page..." : `Buy 1 extra slot (${priceLabel})`}
            </Button>
          ) : (
            <Notice tone="info">Slot purchases are temporarily unavailable. Please try again later.</Notice>
          )}
        </div>
      ) : (
        <form onSubmit={review} className="space-y-3">
          <div className="relative">
            <Field
              label="Add an X username"
              id="x_account_username"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="yourhandle"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={64}
              className="[&_input]:pl-9"
              hint={`${summary.availableAccountSlots} slot${summary.availableAccountSlots === 1 ? "" : "s"} available. You will be asked to confirm before anything is linked.`}
            />
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-[2.45rem] font-semibold text-muted">
              @
            </span>
          </div>
          <Button type="submit" variant="secondary">Review and link</Button>
        </form>
      )}
    </div>
  );
}
