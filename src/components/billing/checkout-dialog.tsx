"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/auth-form";
import { Button, LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { getProduct, type ProductId } from "@/lib/billing/catalog";
import { minorToDecimal } from "@/lib/billing/catalog";

type Method = "card" | "crypto";
interface OrderView {
  status: "created" | "pending" | "fulfilled" | "expired" | "failed" | "canceled" | "refund_required";
  paymentStatus: string | null;
  providerStatus: string | null;
  crypto: { address: string | null; amount: string | number | null; currency: string | null; actuallyPaid: string | number | null; network: string | null } | null;
}
interface CryptoPayment { address: string; amount: string; currency: string; network: string | null; extraId: string | null; expiresAt: string }

type Phase =
  | { kind: "choose" }
  | { kind: "starting" }
  | { kind: "card-open" }
  | { kind: "waiting"; orderId: string }
  | { kind: "crypto"; orderId: string; payment: CryptoPayment }
  | { kind: "done" }
  | { kind: "error"; message: string };

const ERR: Record<string, string> = {
  unauthenticated: "Please log in to continue.",
  email_not_verified: "Confirm your email address before purchasing.",
  checkout_unavailable: "This payment method is not available right now.",
  unsupported_asset: "That asset is not supported.",
  provider_error: "The payment provider could not be reached. Please try again.",
  bad_origin: "Request blocked. Reload the page and try again.",
};

async function post(path: string, body: unknown) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

/**
 * Checkout flow. IMPORTANT: this component never decides that Premium was
 * granted. "Success" is shown only when the SERVER reports the order as
 * fulfilled, which only a verified provider event can cause.
 */
export function CheckoutDialog({
  product,
  method,
  payCurrencies,
  paddle,
  onClose,
}: {
  product: ProductId;
  method: Method;
  payCurrencies: string[];
  paddle: { environment: "sandbox" | "production" } | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const p = getProduct(product);
  const [phase, setPhase] = useState<Phase>(method === "card" ? { kind: "starting" } : { kind: "choose" });
  const [asset, setAsset] = useState(payCurrencies[0] ?? "");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  const fail = (status: number, json: { error?: { code?: string; message?: string } }) => {
    if (status === 401) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    setPhase({ kind: "error", message: json.error?.message ?? ERR[json.error?.code ?? ""] ?? "Something went wrong. Please try again." });
  };

  // Poll the server for the order state (the only source of truth).
  const orderId = phase.kind === "waiting" || phase.kind === "crypto" ? phase.orderId : null;
  useEffect(() => {
    if (!orderId) return;
    let stop = false;
    let tries = 0;
    const tick = async () => {
      tries++;
      try {
        const r = await fetch(`/api/billing/orders/${orderId}`, { cache: "no-store" });
        if (r.ok && !stop) {
          const o = (await r.json()) as OrderView;
          setOrder(o);
          if (o.status === "fulfilled") {
            setPhase({ kind: "done" });
            router.refresh();
            return;
          }
        }
      } catch {
        /* keep polling */
      }
      if (!stop && tries < 200) timer = setTimeout(tick, method === "crypto" ? 8000 : 4000);
    };
    let timer = setTimeout(tick, 1500);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [orderId, method, router]);

  const startCard = async () => {
    setPhase({ kind: "starting" });
    const { status, json } = await post("/api/billing/paddle/checkout", { product });
    if (status !== 200) return fail(status, json);
    try {
      const { initializePaddle } = await import("@paddle/paddle-js");
      const pd = await initializePaddle({
        environment: json.environment,
        token: json.clientToken,
        eventCallback: (e) => {
          if (e.name === ("checkout.completed" as never)) setPhase({ kind: "waiting", orderId: json.orderId });
          if (e.name === ("checkout.closed" as never)) setPhase((cur) => (cur.kind === "card-open" ? { kind: "choose" } : cur));
        },
      });
      if (!pd) throw new Error("paddle_init");
      setPhase({ kind: "card-open" });
      pd.Checkout.open({ transactionId: json.transactionId });
    } catch {
      setPhase({ kind: "error", message: "Could not load the secure card checkout. Please try again." });
    }
  };

  useEffect(() => {
    if (method === "card" && !started.current) {
      started.current = true;
      void startCard();
    }
    // Starts exactly once when the dialog opens for the card flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const startCrypto = async () => {
    setPhase({ kind: "starting" });
    const { status, json } = await post("/api/billing/crypto/checkout", { product, payCurrency: asset });
    if (status !== 200) return fail(status, json);
    setPhase({ kind: "crypto", orderId: json.orderId, payment: json.payment });
  };

  const close = () => {
    ref.current?.close();
    onClose();
  };
  const price = `$${minorToDecimal(p.amountMinor)}${p.recurring ? (p.plan === "PRO_YEARLY" ? "/year" : "/month") : " one-time"}`;
  const cryptoPaid = order?.crypto?.actuallyPaid;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="checkout-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-border bg-white p-0 shadow-[var(--shadow-lift)] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="checkout-title" className="text-xl font-extrabold">{p.name}</h2>
            <p className="mt-1 text-sm text-text-2">
              {price} · {method === "card" ? "Card & other methods via Paddle" : "Crypto via NOWPayments"}
              {paddle?.environment === "sandbox" && method === "card" ? " · TEST MODE" : ""}
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text">✕</button>
        </div>

        {phase.kind === "choose" && method === "crypto" ? (
          <div className="space-y-4">
            <Notice tone="info" title={p.cryptoPeriodDays ? `Prepaid for ${p.cryptoPeriodDays} days` : "One-time payment"}>
              {p.cryptoPeriodDays ? "Crypto plans do not renew automatically. When the period ends you pay again to continue; nothing is debited from your wallet." : "Pay once for permanent Premium."}
            </Notice>
            <div>
              <label htmlFor="asset" className="mb-1.5 block text-sm font-semibold">Pay with</label>
              <select id="asset" value={asset} onChange={(e) => setAsset(e.target.value)} className="h-12 w-full rounded-xl border border-border-strong bg-white px-3 text-base">
                {payCurrencies.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-muted">The asset code includes the network (for example TRC20). Send on exactly that network.</p>
            </div>
            <Button className="w-full" size="lg" onClick={startCrypto} disabled={!asset}>Show payment details</Button>
          </div>
        ) : null}

        {phase.kind === "starting" ? (
          <p className="flex items-center gap-3 py-6 text-text-2" role="status"><Spinner /> <span className="[&]:text-text-2">Preparing secure checkout…</span></p>
        ) : null}

        {phase.kind === "card-open" ? (
          <Notice tone="info" title="Complete your payment in the secure window">
            Premium is activated only after the payment provider confirms your payment to GrowX. You can close this message.
          </Notice>
        ) : null}

        {phase.kind === "waiting" ? (
          <Notice tone="info" title="Payment submitted, waiting for confirmation">
            We&apos;re waiting for Paddle to confirm your payment with GrowX. This usually takes a few seconds. This is not yet an activated plan. If it takes longer than a few minutes, your Account page will update automatically once confirmed.
          </Notice>
        ) : null}

        {phase.kind === "crypto" ? (
          <div className="space-y-4">
            {order?.status === "expired" || order?.status === "failed" || order?.status === "canceled" ? (
              <Notice tone="error" title={order.status === "expired" ? "Payment window expired" : "Payment failed"}>
                {order.status === "expired" ? "If you already sent funds, contact support with your transaction ID and we'll sort it out." : "Nothing was activated. You can start a new payment."}
              </Notice>
            ) : order?.status === "refund_required" ? (
              <Notice tone="warn" title="Payment received but not activated">
                We received your payment but could not activate it automatically. Please contact support so we can resolve it or refund you.
              </Notice>
            ) : (
              <>
                <dl className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Send exactly</dt>
                    <dd className="mt-1 break-all font-mono text-base font-bold">{phase.payment.amount} {phase.payment.currency.toUpperCase()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">To address</dt>
                    <dd className="mt-1 break-all font-mono text-sm font-semibold">{phase.payment.address}</dd>
                  </div>
                  {phase.payment.network ? <div><dt className="text-xs font-semibold uppercase tracking-wider text-muted">Network</dt><dd className="mt-1 font-semibold">{phase.payment.network}</dd></div> : null}
                  {phase.payment.extraId ? <div><dt className="text-xs font-semibold uppercase tracking-wider text-muted">Memo / tag (required)</dt><dd className="mt-1 break-all font-mono font-semibold">{phase.payment.extraId}</dd></div> : null}
                </dl>
                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(phase.payment.address).then(() => setCopied(true))}>{copied ? "Address copied" : "Copy address"}</Button>
                <PaymentProgress order={order} paid={cryptoPaid} expected={phase.payment.amount} currency={phase.payment.currency} />
                <p className="text-xs text-muted">Pay before {new Date(phase.payment.expiresAt).toLocaleString()}. Underpayments are not activated automatically. Premium turns on only after the payment is fully confirmed.</p>
              </>
            )}
          </div>
        ) : null}

        {phase.kind === "done" ? (
          <div className="space-y-4 text-center">
            <div className="animate-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok text-2xl text-white">✓</div>
            <h3 className="text-lg font-bold">Payment confirmed</h3>
            <p className="text-text-2">Your plan is active. Thank you for supporting GrowX!</p>
            <LinkButton href="/account" className="w-full">View your plan</LinkButton>
          </div>
        ) : null}

        {phase.kind === "error" ? (
          <div className="space-y-4">
            <Notice tone="error">{phase.message}</Notice>
            <div className="flex gap-3">
              <Button onClick={() => (method === "card" ? startCard() : setPhase({ kind: "choose" }))}>Try again</Button>
              <Button variant="secondary" onClick={close}>Close</Button>
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

function PaymentProgress({ order, paid, expected, currency }: { order: OrderView | null; paid: string | number | null | undefined; expected: string; currency: string }) {
  const s = order?.providerStatus ?? "waiting";
  if (s === "partially_paid") {
    return (
      <Notice tone="warn" title="Partial payment received">
        We received {String(paid ?? "part")} of {expected} {currency.toUpperCase()}. Send the remaining amount to the same address. Premium is not active until the full amount is confirmed.
      </Notice>
    );
  }
  if (["confirming", "confirmed", "sending"].includes(s)) {
    return <Notice tone="info" title="Payment detected">Waiting for network confirmations. This can take several minutes. Premium activates after final confirmation.</Notice>;
  }
  return <p className="flex items-center gap-2 text-sm text-text-2" role="status"><Spinner /> <span>Waiting for your payment…</span></p>;
}
