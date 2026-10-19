import { site } from "@/config/site";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Reports a Google Ads conversion. Does nothing where the Google tag is not loaded (previews, local runs, ad blockers)
 * or when the conversion has no label. Each (kind, transactionId) is sent once per browser, and Google also
 * dedupes purchases on transaction_id.
 */
export function trackConversion(kind: "purchase" | "signup", opts: { value?: number; currency?: string; transactionId?: string } = {}): void {
  const sendTo = site.googleConversions[kind];
  if (!sendTo || typeof window === "undefined" || typeof window.gtag !== "function") return;
  const key = `gx_conv_${kind}_${opts.transactionId ?? ""}`;
  try {
    if (opts.transactionId && localStorage.getItem(key)) return;
    if (opts.transactionId) localStorage.setItem(key, "1");
  } catch {
    /* storage blocked: still report once for this page view */
  }
  window.gtag("event", "conversion", {
    send_to: sendTo,
    ...(opts.value !== undefined ? { value: opts.value, currency: opts.currency ?? "USD" } : {}),
    ...(opts.transactionId ? { transaction_id: opts.transactionId } : {}),
  });
}
