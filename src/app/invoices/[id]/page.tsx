import Image from "next/image";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { LinkButton } from "@/components/ui/button";
import { isAdmin } from "@/lib/admin/auth";
import { SELLER, loadInvoice, money, type Invoice } from "@/lib/invoices";
import { pageMetadata } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Invoice", description: "GrowX invoice.", path: "/invoices", noindex: true });
export const dynamic = "force-dynamic";

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso)) : "-");
const STATUS: Record<Invoice["status"], { label: string; cls: string }> = {
  paid: { label: "PAID", cls: "bg-ok/10 text-ok ring-ok/30" },
  refunded: { label: "REFUNDED", cls: "bg-surface-2 text-text-2 ring-border-strong" },
  partially_refunded: { label: "PARTIALLY REFUNDED", cls: "bg-surface-2 text-text-2 ring-border-strong" },
  disputed: { label: "DISPUTED", cls: "bg-accent-soft text-accent ring-accent/30" },
};

/** One invoice. Owners see their own (RLS); administrators can open any. Generated from the verified payment record. */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const user = await requireUser(`/invoices/${id}`);

  let inv = await loadInvoice(await createClient(), id, user.email ?? null);
  if (!inv && (await isAdmin(user.id))) {
    const admin = createAdminClient();
    const { data: p } = await admin.from("payments").select("user_id").eq("id", id).maybeSingle();
    const uid = (p as { user_id?: string } | null)?.user_id;
    const email = uid ? ((await admin.from("profiles").select("email").eq("id", uid).maybeSingle()).data as { email?: string } | null)?.email ?? null : null;
    inv = await loadInvoice(admin, id, email);
  }
  if (!inv) notFound();
  const st = STATUS[inv.status];
  const net = inv.amountMinor - inv.refundedMinor;

  return (
    <div className="flex-1 bg-surface-2 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-3xl flex-wrap justify-between gap-3 px-4">
        <LinkButton href="/dashboard" variant="ghost" size="sm">← Back to dashboard</LinkButton>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-soft)] sm:p-10 print:max-w-none print:rounded-none print:border-0 print:shadow-none" data-testid="invoice">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="GrowX logo" width={48} height={48} className="rounded-xl" />
            <div>
              <p className="font-display text-2xl font-extrabold tracking-tight">Grow<span className="text-accent">X</span></p>
              <p className="text-xs text-muted">{SELLER.website}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-extrabold tracking-tight">INVOICE</h1>
            <p className="mt-1 font-mono text-sm font-semibold">{inv.number}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ring-1 ${st.cls}`}>{st.label}</span>
          </div>
        </header>

        <section className="grid gap-6 border-b border-border py-6 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">From</p>
            <p className="mt-1.5 font-bold">{SELLER.name}</p>
            <p>{SELLER.person}</p>
            {SELLER.roles.map((r) => <p key={r} className="text-text-2">{r}</p>)}
            <p className="text-text-2">{SELLER.address}</p>
            <p className="text-text-2">{SELLER.email}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Bill to</p>
            <p className="mt-1.5 break-all font-bold">{inv.customerEmail ?? "-"}</p>
          </div>
          <dl className="space-y-1.5">
            <div className="flex justify-between gap-3"><dt className="text-muted">Invoice date</dt><dd className="font-semibold">{fmt(inv.issuedAt)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Paid on</dt><dd className="font-semibold">{fmt(inv.issuedAt)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Due</dt><dd className="font-semibold">Paid in full</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Expires</dt><dd className="font-semibold">{inv.expires ? fmt(inv.expires) : inv.expiresLabel}</dd></div>
          </dl>
        </section>

        <section className="py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2 font-bold">Description</th>
                <th className="pb-2 text-center font-bold">Qty</th>
                <th className="pb-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border align-top">
                <td className="py-3">
                  <p className="font-semibold">{inv.productName}</p>
                  <p className="text-text-2">{inv.servicePeriod}</p>
                  {inv.expires ? <p className="text-text-2">Premium until {fmt(inv.expires)}</p> : null}
                </td>
                <td className="py-3 text-center">1</td>
                <td className="py-3 text-right font-semibold">{money(inv.amountMinor, inv.currency)}</td>
              </tr>
            </tbody>
          </table>
          <dl className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-text-2">Subtotal</dt><dd>{money(inv.amountMinor, inv.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-2">Tax</dt><dd>{money(0, inv.currency)}</dd></div>
            <div className="flex justify-between font-bold"><dt>Total</dt><dd>{money(inv.amountMinor, inv.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-text-2">Amount paid</dt><dd>{money(inv.amountMinor, inv.currency)}</dd></div>
            {inv.refundedMinor > 0 || inv.status === "refunded" ? (
              <div className="flex justify-between text-text-2"><dt>Refunded{inv.refundedAt ? ` (${fmt(inv.refundedAt)})` : ""}</dt><dd>-{money(inv.refundedMinor || inv.amountMinor, inv.currency)}</dd></div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-1.5 font-bold"><dt>Amount due</dt><dd>{money(inv.amountDueMinor, inv.currency)}</dd></div>
            {inv.refundedMinor > 0 ? <div className="flex justify-between text-text-2"><dt>Net paid</dt><dd>{money(Math.max(0, net), inv.currency)}</dd></div> : null}
          </dl>
        </section>

        <section className="grid gap-6 border-t border-border py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Payment</p>
            <dl className="mt-1.5 space-y-1">
              <div><dt className="inline text-muted">Method: </dt><dd className="inline">{inv.method}</dd></div>
              <div><dt className="inline text-muted">Transaction ID: </dt><dd className="inline break-all font-mono text-xs">{inv.transactionRef}</dd></div>
              {inv.orderRef ? <div><dt className="inline text-muted">Order ID: </dt><dd className="inline break-all font-mono text-xs">{inv.orderRef}</dd></div> : null}
            </dl>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Refunds</p>
            <p className="mt-1.5 text-text-2">
              Refunds can be requested within 14 days of purchase by emailing <strong>{SELLER.email}</strong> from your account email with this invoice number.
              Crypto refunds are sent manually in the same asset, minus network fees. Full policy: {SELLER.website}/refund-policy
            </p>
          </div>
        </section>

        <section className="border-t border-border pt-6 text-xs leading-relaxed text-text-2">
          <p className="font-bold uppercase tracking-wider text-muted">Terms and conditions</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>GrowX Premium is a digital service for the GrowX Chrome extension, delivered instantly to the account above once the payment is confirmed.</li>
            <li>Monthly and yearly plans are prepaid for a fixed period and never renew or charge automatically. Lifetime access lasts for as long as GrowX Premium is offered.</li>
            <li>Prices are in US dollars. Crypto payments are final once confirmed on the network, except for refunds granted under the refund policy.</li>
            <li>A full refund or a chargeback ends Premium access for this purchase.</li>
            <li>Use of GrowX is subject to the Terms of Service ({SELLER.website}/terms) and the Privacy Policy ({SELLER.website}/privacy).</li>
          </ol>
          <p className="mt-4">Questions about this invoice? Contact {SELLER.email}. Thank you for supporting GrowX!</p>
        </section>
      </article>
    </div>
  );
}
