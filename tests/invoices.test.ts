import { describe, expect, it } from "vitest";
import { buildInvoice, invoiceNumber, type PaymentRow } from "@/lib/invoices";

const pay = (o: Partial<PaymentRow> = {}): PaymentRow => ({
  id: "1a2b3c4d-0000-4000-8000-000000000000", user_id: "u", provider: "nowpayments", provider_payment_id: "5512345", product: "PRO_MONTHLY",
  amount_minor: 199, currency: "USD", status: "succeeded", refunded_minor: 0, asset: "bnbbsc", order_id: "o-1",
  created_at: "2026-10-18T15:50:00Z", updated_at: "2026-10-18T15:55:00Z", ...o,
});

describe("invoices", () => {
  it("numbers are stable and derived from the payment", () => {
    expect(invoiceNumber("1a2b3c4d-0000-4000-8000-000000000000", "2026-10-18T15:50:00Z")).toBe("GX-20261018-1A2B3C4D");
  });
  it("monthly: 30 days prepaid, expiry from the subscription it produced (or payment date + period)", () => {
    const a = buildInvoice(pay(), "c@example.com", 30, "2026-12-01T00:00:00Z");
    expect(a).toMatchObject({ number: "GX-20261018-1A2B3C4D", customerEmail: "c@example.com", productName: "Premium Monthly", amountMinor: 199, amountDueMinor: 0, status: "paid", expires: "2026-12-01T00:00:00Z", method: "NOWPayments · USD", transactionRef: "5512345", orderRef: "o-1" });
    expect(a.servicePeriod).toMatch(/30 days of Premium, prepaid/);
    expect(buildInvoice(pay(), null, 30, null).expires).toBe("2026-11-17T15:50:00.000Z");
  });
  it("lifetime early bird and the X slot add-on never expire", () => {
    expect(buildInvoice(pay({ product: "PRO_LIFETIME_EARLY", amount_minor: 2999 }), null, null, null)).toMatchObject({ productName: "Premium Lifetime (Early Bird)", expires: null, expiresLabel: "Never (lifetime)" });
    expect(buildInvoice(pay({ product: "X_ACCOUNT_SLOT", amount_minor: 99 }), null, null, null)).toMatchObject({ productName: "Extra X account slot", expiresLabel: "Permanent add-on" });
  });
  it("shows refunds (full and partial) and disputes", () => {
    expect(buildInvoice(pay({ status: "refunded", refunded_minor: 199 }), null, 30, null)).toMatchObject({ status: "refunded", refundedMinor: 199, expires: null, expiresLabel: "Access ended (refunded)", refundedAt: "2026-10-18T15:55:00Z" });
    expect(buildInvoice(pay({ refunded_minor: 50 }), null, 30, null)).toMatchObject({ status: "partially_refunded", refundedMinor: 50 });
    expect(buildInvoice(pay({ status: "disputed" }), null, 30, null).status).toBe("disputed");
  });
});
