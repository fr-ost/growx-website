"use client";

import { useEffect, useState } from "react";
import type { ProductId } from "@/lib/billing/catalog";

export interface BillingOptions {
  crypto: { available: boolean; environment: "sandbox" | "production"; products: ProductId[]; prepaid: boolean };
  earlyAdopter: "unavailable" | "available" | "temporarily_unavailable" | "sold_out";
}

let cache: Promise<BillingOptions | null> | null = null;
const load = () =>
  (cache ??= fetch("/api/billing/options", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<BillingOptions>) : null))
    .catch(() => null));

/** undefined = loading, null = failed to load, otherwise the options. Availability only; never prices or counts. */
export function useBillingOptions(): BillingOptions | null | undefined {
  const [opts, setOpts] = useState<BillingOptions | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    load().then((o) => alive && setOpts(o));
    return () => {
      alive = false;
    };
  }, []);
  return opts;
}
