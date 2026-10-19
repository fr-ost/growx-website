import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackConversion } from "@/lib/google-conversions";

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) });
});
afterEach(() => vi.unstubAllGlobals());

describe("trackConversion", () => {
  it("does nothing when the Google tag is not loaded", () => {
    vi.stubGlobal("window", {});
    expect(() => trackConversion("purchase", { value: 10, transactionId: "o1" })).not.toThrow();
  });

  it("sends the purchase with value, currency and order id, once per order", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    trackConversion("purchase", { value: 29.99, currency: "USD", transactionId: "order-1" });
    trackConversion("purchase", { value: 29.99, currency: "USD", transactionId: "order-1" });
    trackConversion("purchase", { value: 5, currency: "USD", transactionId: "order-2" });
    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "conversion", { send_to: "AW-18494416712/XJfkCPCv4aEdEMjO6fJE", value: 29.99, currency: "USD", transaction_id: "order-1" });
  });

  it("sign-up stays silent until its label is configured", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    trackConversion("signup");
    expect(gtag).not.toHaveBeenCalled();
  });
});
