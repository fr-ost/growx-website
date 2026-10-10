import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { OrderStatus } from "@/components/billing/order-status";
import { pageMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Payment status", description: "Status of your GrowX payment.", path: "/checkout", noindex: true });
export const dynamic = "force-dynamic";

/** Where NOWPayments sends the customer back. It only DISPLAYS the server's verified state. */
export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ canceled?: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { canceled } = await searchParams;
  const user = await requireUser(`/checkout/${id}`);
  return (
    <AppShell active="/account" email={user.email}>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Payment status</h1>
        <p className="mt-1 text-text-2">This page updates automatically.</p>
      </div>
      <OrderStatus orderId={id} canceled={canceled === "1"} />
    </AppShell>
  );
}
