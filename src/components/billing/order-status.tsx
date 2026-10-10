"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/auth-form";
import { LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { getProduct, isProductId } from "@/lib/billing/catalog";

interface OrderView {
  product: string;
  status: "created" | "pending" | "fulfilled" | "expired" | "failed" | "canceled" | "refund_required";
  providerStatus: string | null;
}

const DONE = new Set(["fulfilled", "expired", "failed", "canceled", "refund_required"]);

/** Polls the caller's own order. "Payment confirmed" is shown only when the SERVER says fulfilled. */
export function OrderStatus({ orderId, canceled }: { orderId: string; canceled: boolean }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    const tick = async () => {
      tries++;
      try {
        const r = await fetch(`/api/billing/orders/${orderId}`, { cache: "no-store" });
        if (r.status === 404) {
          if (!stop) setMissing(true);
          return;
        }
        if (r.ok) {
          const o = (await r.json()) as OrderView;
          if (stop) return;
          setOrder(o);
          if (DONE.has(o.status)) return;
        }
      } catch {
        /* keep polling */
      }
      if (!stop && tries < 400) timer = setTimeout(tick, tries < 20 ? 5000 : 15000);
    };
    void tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  if (missing) return <Notice tone="error" title="Order not found">This order does not exist or belongs to another account.</Notice>;
  if (!order) return <p className="flex items-center gap-2 text-text-2" role="status"><Spinner /> <span>Loading your order…</span></p>;

  const name = isProductId(order.product) ? getProduct(order.product).name : order.product;
  const retry = <LinkButton href={isProductId(order.product) ? `/checkout?plan=${order.product}` : "/pricing"} variant="secondary">Start a new payment</LinkButton>;
  const s = order.providerStatus;

  return (
    <section className="animate-fade-up space-y-5 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-text-2">Order: <span className="font-semibold text-text">{name}</span></p>

      {order.status === "fulfilled" ? (
        <div className="space-y-4 text-center">
          <div className="animate-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok text-2xl text-white">✓</div>
          <h2 className="text-xl font-bold">Payment confirmed</h2>
          <p className="text-text-2">Your Premium plan is active. Thank you for supporting GrowX!</p>
          <LinkButton href="/account" className="w-full sm:w-auto">View your plan</LinkButton>
        </div>
      ) : order.status === "refund_required" ? (
        <Notice tone="warn" title="Payment received but not activated">
          We received your payment but could not activate it automatically. Please contact support so we can resolve it or refund you.
        </Notice>
      ) : order.status === "expired" || order.status === "failed" || order.status === "canceled" ? (
        <div className="space-y-4">
          <Notice tone="error" title={order.status === "expired" ? "Payment window expired" : "Payment not completed"}>
            Nothing was activated. If you already sent funds, contact support with your transaction ID.
          </Notice>
          {retry}
        </div>
      ) : s === "partially_paid" ? (
        <Notice tone="warn" title="Partial payment received">
          Less than the full amount arrived. Send the remaining amount from the NOWPayments invoice page or contact support. Premium is not active until the full amount is confirmed.
        </Notice>
      ) : s && ["confirming", "confirmed", "sending"].includes(s) ? (
        <Notice tone="info" title="Payment detected">Waiting for network confirmations. This can take several minutes; Premium activates automatically after final confirmation. You can close this page.</Notice>
      ) : canceled ? (
        <div className="space-y-4">
          <Notice tone="info" title="Payment not finished">You left the payment page. Nothing was charged by GrowX. If you already sent funds, keep this page open: it updates when the payment is detected.</Notice>
          {retry}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-text-2" role="status"><Spinner /> <span>Waiting for your payment. This page updates automatically once the network sees it.</span></p>
      )}
    </section>
  );
}
