/** Normalised, provider-neutral effects consumed by the SQL function public.billing_apply(). */
export type PaymentStatus = "pending" | "confirming" | "partially_paid" | "succeeded" | "failed" | "expired";

export type BillingEffect =
  | { kind: "noop"; reason?: string }
  | {
      kind: "payment";
      provider_payment_id: string;
      status: PaymentStatus;
      fulfill: boolean;
      order_id?: string;
      subscription_ref?: string;
      customer_ref?: string;
      product: string;
      /** Paddle: product resolved from the transaction's price ids via the server price map. */
      price_product?: string;
      amount_minor: number;
      currency: string;
      asset?: string;
      asset_expected?: string;
      asset_received?: string;
      provider_status: string;
      order_status?: "expired" | "failed" | "canceled";
    }
  | {
      kind: "subscription_sync";
      provider_subscription_id: string;
      order_id?: string;
      customer_ref?: string;
      plan?: string;
      status: string;
      period_end?: string;
      cancel_at_period_end: boolean;
    }
  | {
      kind: "adjustment";
      provider_payment_id: string;
      /** Provider adjustment id: the idempotency key for refunds/chargebacks. */
      adjustment_id?: string;
      subscription_ref?: string;
      action: string;
      adj_type: string;
      status: string;
      amount_minor: number;
    };
