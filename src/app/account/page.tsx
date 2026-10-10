import { AppShell, Panel } from "@/components/app-shell";
import { IconLock, IconMail, IconStar, IconUser } from "@/components/icons";
import { PlanSummary, formatDate } from "@/components/plan-summary";
import { LinkButton } from "@/components/ui/button";
import { Badge, Notice } from "@/components/ui/primitives";
import { getProduct, isProductId } from "@/lib/billing/catalog";
import { site } from "@/config/site";
import { DataIssue } from "@/components/data-issue";
import { logDbIssue, toDbIssue } from "@/lib/db/errors";
import { COLUMNS } from "@/lib/db/queries";
import { tryLoadEntitlement } from "@/lib/entitlement/load";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Account", description: "Your GrowX account and plan.", path: "/account", noindex: true });
export const dynamic = "force-dynamic";

const PRODUCT_NAME = (p: string) => (isProductId(p) ? getProduct(p).name : p);
const PROVIDER_LABEL: Record<string, string> = { nowpayments: "Crypto (NOWPayments)" };
const PAYMENT_LABEL: Record<string, { text: string; tone: "ok" | "warn" | "neutral" | "accent" }> = {
  succeeded: { text: "Paid", tone: "ok" },
  pending: { text: "Pending", tone: "neutral" },
  confirming: { text: "Confirming", tone: "neutral" },
  partially_paid: { text: "Partially paid", tone: "warn" },
  failed: { text: "Failed", tone: "warn" },
  expired: { text: "Expired", tone: "warn" },
  refunded: { text: "Refunded", tone: "neutral" },
  disputed: { text: "Disputed", tone: "warn" },
};
const serverNow = () => Date.now();
const money = (minor: number, cur: string) => `${(minor / 100).toFixed(2)} ${cur}`;

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const user = await requireUser("/account");
  const sp = await searchParams;
  const supabase = await createClient();

  const [ent, x, payments, subs, orders] = await Promise.all([
    tryLoadEntitlement(supabase, user.id),
    supabase.from("x_profiles").select(COLUMNS.x_profiles).eq("user_id", user.id).maybeSingle(),
    supabase.from("payments").select(COLUMNS.payments).eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("subscriptions").select(COLUMNS.subscription_details).eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("checkout_orders").select(COLUMNS.checkout_orders).eq("user_id", user.id).in("status", ["created", "pending", "refund_required"]).order("created_at", { ascending: false }).limit(10),
  ]);
  const entitlement = ent.entitlement;
  const xIssue = x.error ? toDbIssue("x_profiles", x.error) : null;
  const payIssue = payments.error ? toDbIssue("payments", payments.error) : null;
  const subIssue = subs.error ? toDbIssue("subscriptions", subs.error) : null;
  for (const [i, e] of [[xIssue, x.error], [payIssue, payments.error], [subIssue, subs.error]] as const) if (i) logDbIssue(i, e);
  const xUsername = (x.data as { x_username?: string } | null)?.x_username ?? null;
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  const now = serverNow();
  const openOrders = (orders.data ?? []).filter((o) => o.status === "refund_required" || !o.reservation_expires_at || Date.parse(o.reservation_expires_at) > now);

  return (
    <AppShell active="/account" email={user.email}>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Account</h1>
        <p className="mt-1 text-text-2">Your profile, plan and billing history.</p>
      </div>

      {sp.checkout === "return" ? (
        <Notice tone="info" title="Thanks! We're confirming your payment">
          Your plan updates only after the payment provider confirms the payment to GrowX. This page shows the verified state; refresh in a moment if it hasn&apos;t changed yet.
        </Notice>
      ) : null}

      <Panel title="Profile" icon={<IconUser size={17} />}>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email</dt>
            <dd className="mt-1.5 break-all font-semibold">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email status</dt>
            <dd className="mt-1.5">{user.email_confirmed_at ? <Badge tone="ok">Confirmed</Badge> : <Badge tone="warn">Not confirmed</Badge>}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">X username</dt>
            <dd className="mt-1.5 font-semibold">{xIssue ? <span className="text-danger">Could not load</span> : xUsername ? `@${xUsername}` : "Not set"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Member since</dt>
            <dd className="mt-1.5 font-semibold">{formatDate(user.created_at)?.replace(/,? \d{1,2}:\d{2}.*$/, "")}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Plan" icon={<IconStar size={17} />} action={<LinkButton href="/pricing" variant="ghost" size="sm">View plans</LinkButton>}>
        {entitlement ? <PlanSummary e={entitlement} /> : <DataIssue title="Could not load your plan" issues={ent.issues} />}
      </Panel>

      <Panel title="Subscriptions & access" icon={<IconStar size={17} />}>
        {subIssue ? (
          <DataIssue title="Could not load subscriptions" issues={[subIssue]} />
        ) : subs.data && subs.data.length > 0 ? (
          <ul className="divide-y divide-border">
            {subs.data.map((s) => {
              const lifetime = s.plan === "PRO_LIFETIME";
              const revoked = !!s.access_revoked_at;
              const ended = s.current_period_end && Date.parse(s.current_period_end) <= now;
              const live = !revoked && s.status === "active" && !ended;
              const label = revoked ? (s.revoked_reason === "chargeback" ? "Access removed (chargeback)" : "Access removed (refund)") : s.status === "past_due" ? "Payment failed" : s.status === "canceled" ? "Canceled" : ended ? "Expired" : s.cancel_at_period_end ? "Active, cancels at period end" : "Active";
              return (
                <li key={s.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{PRODUCT_NAME(s.plan)} <span className="font-normal text-muted">· {PROVIDER_LABEL[s.provider] ?? s.provider}</span></p>
                    <Badge tone={live ? "ok" : s.status === "past_due" ? "warn" : "neutral"}>{label}</Badge>
                  </div>
                  <p className="text-sm text-text-2">
                    {lifetime ? "Lifetime access: no expiry date." : s.current_period_end ? `${live ? "Paid through" : "Paid through (ended)"}: ${formatDate(s.current_period_end)}` : null}
                    {s.provider === "nowpayments" && !lifetime ? " Prepaid: this plan does not renew automatically." : ""}
                  </p>
                  {s.provider === "nowpayments" && !lifetime && !revoked ? (
                    <LinkButton href="/pricing" variant="secondary" size="sm">{live ? "Add more time" : "Renew"}</LinkButton>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-center">
            <p className="font-semibold">No paid subscription</p>
            <p className="mt-1 text-sm text-muted">You&apos;re on {entitlement?.isPremium ? "a trial" : "the Free plan"}. <LinkButton href="/pricing" variant="ghost" size="sm">See Premium plans</LinkButton></p>
          </div>
        )}
      </Panel>

      {openOrders.length > 0 ? (
        <Panel title="Payments in progress" icon={<IconMail size={17} />}>
          <ul className="space-y-3">
            {openOrders.map((o) => (
              <li key={o.id}>
                <Notice tone={o.status === "refund_required" ? "warn" : "info"} title={`${PRODUCT_NAME(o.product)} · ${PROVIDER_LABEL[o.provider] ?? o.provider}`}>
                  {o.status === "refund_required"
                    ? "We received a payment that could not be activated automatically. Contact support and we will resolve it or refund you."
                    : "Waiting for the payment provider to confirm. Nothing is activated until it does."}
                </Notice>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Payment history" icon={<IconMail size={17} />}>
        {payIssue ? (
          <DataIssue title="Could not load payments" issues={[payIssue]} />
        ) : payments.data && payments.data.length > 0 ? (
          <ul className="divide-y divide-border">
            {payments.data.map((p) => {
              const st = PAYMENT_LABEL[p.status] ?? { text: p.status, tone: "neutral" as const };
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm">
                  <span className="font-semibold">{PRODUCT_NAME(p.product)} <span className="font-normal text-muted">· {PROVIDER_LABEL[p.provider] ?? p.provider}</span></span>
                  <span className="flex flex-wrap items-center gap-3 text-text-2">
                    {money(Number(p.amount_minor), p.currency)}
                    {Number(p.refunded_minor) > 0 ? <span className="text-muted">(refunded {money(Number(p.refunded_minor), p.currency)})</span> : null}
                    <Badge tone={st.tone}>{st.text}</Badge>
                    <span className="text-muted">{formatDate(p.created_at)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-center">
            <p className="font-semibold">No payments yet</p>
            <p className="mt-1 text-sm text-muted">Payments appear here once a provider confirms them.</p>
          </div>
        )}
      </Panel>

      <Panel title="Security" icon={<IconLock size={17} />}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-2">
            {provider === "email" ? "Change your password with a secure email link." : `You sign in with ${provider}.`}
          </p>
          {provider === "email" ? (
            <LinkButton href="/forgot-password" variant="secondary" size="sm">
              Change password
            </LinkButton>
          ) : null}
        </div>
        <p className="mt-5 border-t border-border pt-5 text-sm text-muted">
          Want to delete your account? Email {site.supportEmail} from the address on your account.
        </p>
      </Panel>
    </AppShell>
  );
}
