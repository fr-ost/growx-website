import type { ReactNode } from "react";
import { AppShell, Panel } from "@/components/app-shell";
import { StartTrialForm } from "@/components/dashboard-forms";
import { DataIssue } from "@/components/data-issue";
import { IconAt, IconCheck, IconChrome, IconMail, IconStar, IconUser } from "@/components/icons";
import { PlanSummary, formatDate } from "@/components/plan-summary";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Badge, Notice } from "@/components/ui/primitives";
import { XAccountsManager } from "@/components/x-accounts-manager";
import { TRIAL_DAYS, X_ACCOUNT_SLOT_PRICE_LABEL } from "@/config/pricing";
import { site } from "@/config/site";
import { getBillable, isBillableId } from "@/lib/billing/catalog";
import { nowPaymentsStatus } from "@/lib/billing/config";
import { logDbIssue, toDbIssue, type DbIssue } from "@/lib/db/errors";
import { COLUMNS } from "@/lib/db/queries";
import { tryLoadEntitlement } from "@/lib/entitlement/load";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";
import { loadXAccounts } from "@/lib/x-accounts";
import { isAdmin } from "@/lib/admin/auth";
import { INVOICE_STATUSES, invoiceNumber } from "@/lib/invoices";

export const metadata = pageMetadata({ title: "Dashboard", description: "Your GrowX account, plan, X accounts and payments.", path: "/dashboard", noindex: true });
export const dynamic = "force-dynamic";

const PRODUCT_NAME = (p: string) => (isBillableId(p) ? getBillable(p).name : p);
const PAYMENT_LABEL: Record<string, { text: string; tone: "ok" | "warn" | "neutral" }> = {
  succeeded: { text: "Paid", tone: "ok" },
  pending: { text: "Pending", tone: "neutral" },
  confirming: { text: "Confirming", tone: "neutral" },
  partially_paid: { text: "Partially paid", tone: "warn" },
  failed: { text: "Failed", tone: "warn" },
  expired: { text: "Expired", tone: "warn" },
  refunded: { text: "Refunded", tone: "neutral" },
  disputed: { text: "Disputed", tone: "warn" },
};
const money = (minor: number, cur: string) => `${(minor / 100).toFixed(2)} ${cur}`;
const serverNow = () => Date.now();

function Step({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-colors ${done ? "bg-ok" : "bg-white text-transparent ring-2 ring-border-strong"}`}>
        <IconCheck size={15} />
      </span>
      <span className={`text-sm font-semibold ${done ? "text-muted line-through decoration-muted/50" : "text-text"}`}>{children}</span>
    </li>
  );
}

/** The one signed-in page: plan + trial, X accounts, payments and account settings. */
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ password?: string; checkout?: string }> }) {
  const user = await requireUser("/dashboard");
  const sp = await searchParams;
  const supabase = await createClient();

  // Independent loads: one failing section never blanks the others.
  const [ent, xAccounts, xProfile, payments, subs, orders, slotHistory, admin] = await Promise.all([
    tryLoadEntitlement(supabase, user.id),
    loadXAccounts(supabase, user.id).catch(() => null),
    supabase.from("x_profiles").select(COLUMNS.x_profiles).eq("user_id", user.id).maybeSingle(),
    supabase.from("payments").select(COLUMNS.payments).eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("subscriptions").select(COLUMNS.subscription_details).eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("checkout_orders").select(COLUMNS.checkout_orders).eq("user_id", user.id).in("status", ["created", "pending", "refund_required"]).order("created_at", { ascending: false }).limit(10),
    supabase.from("account_slot_grants").select(COLUMNS.slot_grant_history).eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    isAdmin(user.id),
  ]);

  const issues: DbIssue[] = [...ent.issues];
  for (const [source, r] of [["payments", payments], ["subscriptions", subs]] as const) {
    if (r.error) {
      const i = toDbIssue(source, r.error);
      logDbIssue(i, r.error);
      issues.push(i);
    }
  }
  if (!xAccounts) issues.push({ kind: "unknown", code: null, source: "x_account_bindings" });

  const entitlement = ent.entitlement;
  const emailConfirmed = !!user.email_confirmed_at;
  const linked = xAccounts?.linkedXAccounts ?? [];
  const canStartTrial = !!entitlement && !entitlement.trial.used && linked.length > 0 && emailConfirmed;
  // The old self-reported trial username, offered only as a starting value for linking (never linked without confirmation).
  const oldTrialName = (xProfile.data as { x_username?: string } | null)?.x_username ?? null;
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  const now = serverNow();
  const openOrders = (orders.data ?? []).filter((o) => o.status === "refund_required" || !o.reservation_expires_at || Date.parse(o.reservation_expires_at) > now);
  const name = user.email?.split("@")[0] ?? "there";

  return (
    <AppShell email={user.email} admin={admin}>
      {sp.password === "updated" ? <Notice tone="success">Your password was updated.</Notice> : null}
      {sp.checkout === "return" ? (
        <Notice tone="info" title="Thanks! We're confirming your payment">
          Your plan updates only after the payment provider confirms the payment. Refresh in a moment if it hasn&apos;t changed yet.
        </Notice>
      ) : null}
      <DataIssue title="Some of your account data could not be loaded" issues={issues} />

      <section className="bg-brand animate-fade-up relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_30px_60px_-30px_rgba(159,18,57,0.8)] sm:p-8">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/80">Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Welcome, {name}</h1>
            <p className="mt-2 text-white/85">
              {entitlement?.isPremium ? "Premium is active on your account." : `You're on the Free plan. Try Premium free for ${TRIAL_DAYS} days.`}
            </p>
          </div>
          <ol className="space-y-2.5 rounded-2xl bg-white p-5 text-text shadow-lg md:min-w-72">
            <Step done={emailConfirmed}>Confirm your email</Step>
            <Step done={linked.length > 0}>Link your X account</Step>
            <Step done={!!entitlement?.trial.used || !!entitlement?.isPremium}>Start Premium</Step>
          </ol>
        </div>
      </section>

      <Panel title="Your plan" icon={<IconStar size={17} />} action={<LinkButton href="/pricing" variant="ghost" size="sm">View plans</LinkButton>}>
        {entitlement ? <PlanSummary e={entitlement} /> : <p className="text-sm text-text-2">Your plan could not be loaded right now.</p>}

        {entitlement && !entitlement.trial.used && !entitlement.isPremium ? (
          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <p className="font-semibold">Free {TRIAL_DAYS}-day Premium trial</p>
            <p className="text-sm text-text-2">All Premium features for {TRIAL_DAYS} days. No card, no commitment. One trial per account and per X account.</p>
            {!emailConfirmed ? <Notice tone="warn">Confirm your email address first (check your inbox).</Notice> : null}
            {emailConfirmed && linked.length === 0 ? <Notice tone="warn">Link your X account below first.</Notice> : null}
            <StartTrialForm disabled={!canStartTrial} />
          </div>
        ) : null}
        {entitlement?.trial.active ? (
          <div className="mt-5">
            <Notice tone="success" title="Your trial is active">Premium until {formatDate(entitlement.trial.expiresAt)}.</Notice>
          </div>
        ) : null}

        {subs.data && subs.data.length > 0 ? (
          <ul className="mt-5 divide-y divide-border border-t border-border">
            {subs.data.map((s) => {
              const lifetime = s.plan === "PRO_LIFETIME";
              const revoked = !!s.access_revoked_at;
              const ended = s.current_period_end && Date.parse(s.current_period_end) <= now;
              const live = !revoked && s.status === "active" && !ended;
              const label = revoked ? (s.revoked_reason === "chargeback" ? "Removed (chargeback)" : "Removed (refund)") : s.status === "canceled" ? "Canceled" : ended ? "Expired" : "Active";
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-semibold">
                    {PRODUCT_NAME(s.plan)}
                    <span className="font-normal text-muted"> · {lifetime ? "never expires" : s.current_period_end ? `paid through ${formatDate(s.current_period_end)}` : ""}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <Badge tone={live ? "ok" : "neutral"}>{label}</Badge>
                    {s.provider === "nowpayments" && !lifetime && !revoked ? <LinkButton href="/pricing" variant="ghost" size="sm">{live ? "Add time" : "Renew"}</LinkButton> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Panel>

      <Panel title="X accounts" icon={<IconAt size={17} />}>
        {xAccounts ? (
          <>
            <XAccountsManager summary={xAccounts} priceLabel={X_ACCOUNT_SLOT_PRICE_LABEL} checkoutAvailable={nowPaymentsStatus().available} suggestion={oldTrialName} />
            {slotHistory.data && slotHistory.data.length > 0 ? (
              <ul className="mt-5 space-y-1 border-t border-border pt-4 text-sm text-text-2">
                {slotHistory.data.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-center gap-3">
                    Extra slot bought {formatDate(g.created_at)}
                    {g.status === "active" ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">{g.revoked_reason === "chargeback" ? "Removed (chargeback)" : "Removed (refund)"}</Badge>}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-text-2">Your X accounts could not be loaded right now.</p>
        )}
      </Panel>

      <Panel title="Payments & invoices" icon={<IconMail size={17} />}>
        {openOrders.length > 0 ? (
          <ul className="mb-5 space-y-3">
            {openOrders.map((o) => (
              <li key={o.id}>
                <Notice tone={o.status === "refund_required" ? "warn" : "info"} title={PRODUCT_NAME(o.product)}>
                  {o.status === "refund_required" ? (
                    "We received a payment that could not be activated automatically. Contact support and we will fix it or refund you."
                  ) : (
                    <>Waiting for the payment to be confirmed. Nothing is activated until it is. <a className="font-semibold underline" href={`/checkout/${o.id}`}>View status</a></>
                  )}
                </Notice>
              </li>
            ))}
          </ul>
        ) : null}
        {payments.error ? (
          <p className="text-sm text-text-2">Payments could not be loaded right now.</p>
        ) : payments.data && payments.data.length > 0 ? (
          <ul className="divide-y divide-border">
            {payments.data.map((p) => {
              const st = PAYMENT_LABEL[p.status] ?? { text: p.status, tone: "neutral" as const };
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm">
                  <span className="font-semibold">{PRODUCT_NAME(p.product)}</span>
                  <span className="flex flex-wrap items-center gap-3 text-text-2">
                    {money(Number(p.amount_minor), p.currency)}
                    {Number(p.refunded_minor) > 0 ? <span className="text-muted">(refunded {money(Number(p.refunded_minor), p.currency)})</span> : null}
                    <Badge tone={st.tone}>{st.text}</Badge>
                    <span className="text-muted">{formatDate(p.created_at)}</span>
                    {(INVOICE_STATUSES as readonly string[]).includes(p.status) ? (
                      <a href={`/invoices/${p.id}`} className="font-semibold text-accent underline-offset-2 hover:underline" data-testid="invoice-link">
                        Invoice {invoiceNumber(p.id, p.created_at)}
                      </a>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">No payments yet.</p>
        )}
      </Panel>

      <Panel title="Account" icon={<IconUser size={17} />}>
        <dl className="grid gap-5 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email</dt>
            <dd className="mt-1.5 break-all font-semibold">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email status</dt>
            <dd className="mt-1.5">{emailConfirmed ? <Badge tone="ok">Confirmed</Badge> : <Badge tone="warn">Not confirmed</Badge>}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Member since</dt>
            <dd className="mt-1.5 font-semibold">{formatDate(user.created_at)?.replace(/,? \d{1,2}:\d{2}.*$/, "")}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {provider === "email" ? <LinkButton href="/forgot-password" variant="secondary" size="sm">Change password</LinkButton> : <span className="text-sm text-text-2">You sign in with {provider}.</span>}
          {site.chromeStoreUrl ? (
            <ExternalButton href={site.chromeStoreUrl}>
              <IconChrome size={18} /> Get the extension
            </ExternalButton>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-muted">To delete your account, email {site.supportEmail} from the address on your account.</p>
      </Panel>
    </AppShell>
  );
}
