import type { ReactNode } from "react";
import { AppShell, Panel } from "@/components/app-shell";
import { StartTrialForm, XUsernameForm } from "@/components/dashboard-forms";
import { IconAt, IconCheck, IconChrome, IconGift, IconStar } from "@/components/icons";
import { PlanSummary, formatDate } from "@/components/plan-summary";
import { ExternalButton, LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { DataIssue } from "@/components/data-issue";
import { logDbIssue, toDbIssue, type DbIssue } from "@/lib/db/errors";
import { COLUMNS } from "@/lib/db/queries";
import { tryLoadEntitlement } from "@/lib/entitlement/load";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Dashboard", description: "Your GrowX dashboard.", path: "/dashboard", noindex: true });
export const dynamic = "force-dynamic";

function Step({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
          done ? "bg-ok" : "bg-white text-transparent ring-2 ring-border-strong"
        }`}
      >
        <IconCheck size={15} />
      </span>
      <span className={`text-sm font-semibold ${done ? "text-muted line-through decoration-muted/50" : "text-text"}`}>{children}</span>
    </li>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  const user = await requireUser("/dashboard");
  const sp = await searchParams;
  const supabase = await createClient();

  // Independent loads: one failing section must not blank the others.
  const [ent, x] = await Promise.all([
    tryLoadEntitlement(supabase, user.id),
    supabase.from("x_profiles").select(COLUMNS.x_profiles).eq("user_id", user.id).maybeSingle(),
  ]);
  const entitlement = ent.entitlement;
  const xIssue: DbIssue | null = x.error ? toDbIssue("x_profiles", x.error) : null;
  if (xIssue) logDbIssue(xIssue, x.error);
  const issues = [...ent.issues, ...(xIssue ? [xIssue] : [])];
  // No row is a normal state (username not added yet), not an error.
  const username = (x.data as { x_username?: string } | null)?.x_username ?? null;
  const emailConfirmed = !!user.email_confirmed_at;
  const canStart = !!entitlement && !entitlement.trial.used && !!username && emailConfirmed;
  const name = user.email?.split("@")[0] ?? "there";

  return (
    <AppShell active="/dashboard" email={user.email}>
      {sp.password === "updated" ? <Notice tone="success">Your password was updated.</Notice> : null}
      <DataIssue title="Some of your account data could not be loaded" issues={issues} />

      <section className="bg-brand animate-fade-up relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_30px_60px_-30px_rgba(159,18,57,0.8)] sm:p-8">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
        <div className="glow -right-16 -top-20 h-64 w-64 animate-drift bg-white/25" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/80">Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Welcome, {name}</h1>
            <p className="mt-2 text-white/85">
              {entitlement?.isPremium ? "Premium is active on your account." : `You're on the Free plan. Premium can be tried free for ${TRIAL_DAYS} days.`}
            </p>
          </div>
          <ol className="space-y-2.5 rounded-2xl bg-white p-5 text-text shadow-lg md:min-w-72">
            <Step done>Create your account</Step>
            <Step done={emailConfirmed}>Confirm your email</Step>
            <Step done={!!username}>Add your X username</Step>
            <Step done={!!entitlement?.trial.used}>Start your Premium trial</Step>
          </ol>
        </div>
      </section>

      <Panel title="Your plan" icon={<IconStar size={17} />} action={<LinkButton href="/pricing" variant="ghost" size="sm">View plans</LinkButton>}>
        {entitlement ? <PlanSummary e={entitlement} /> : <p className="text-sm text-text-2">Your plan could not be loaded, so Premium status is not shown. See the message above.</p>}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="X username" icon={<IconAt size={17} />}>
          {xIssue ? <p className="mb-4 text-sm text-danger">Your saved username could not be loaded.</p> : null}
          <XUsernameForm current={username} />
        </Panel>

        <Panel title={`${TRIAL_DAYS}-day Premium trial`} icon={<IconGift size={17} />}>
          {!entitlement ? (
            <p className="text-sm text-text-2">Trial status is unavailable right now.</p>
          ) : entitlement.trial.active ? (
            <Notice tone="success" title="Your trial is active">
              Premium until {formatDate(entitlement.trial.expiresAt)}.
            </Notice>
          ) : entitlement.trial.used ? (
            <Notice tone="info" title="Trial used">
              Your trial ended {formatDate(entitlement.trial.expiresAt)}. Each account can start one trial.
            </Notice>
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-text-2">
                A {TRIAL_DAYS}-day Premium trial, no card needed. It starts only when you press the button, and each account
                and X username can use it once.
              </p>
              {!emailConfirmed ? <Notice tone="warn">Confirm your email address first (check your inbox).</Notice> : null}
              {!username ? <Notice tone="warn">Save your X username first.</Notice> : null}
              <StartTrialForm disabled={!canStart} />
            </div>
          )}
          {entitlement ? (
            <p className="mt-4 text-xs text-muted">
              Your plan and trial are recorded on your GrowX account. The extension will read them once account linking ships;
              until then it works as before.
            </p>
          ) : null}
        </Panel>
      </div>

      <Panel title="GrowX extension" icon={<IconChrome size={17} />}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-text-2">
            Install GrowX from the Chrome Web Store and open it on x.com. Linking the extension to this account is coming in a
            future update; until then the extension works on its own.
          </p>
          {site.chromeStoreUrl ? (
            <ExternalButton href={site.chromeStoreUrl}>
              <IconChrome size={18} /> Open Chrome Web Store
            </ExternalButton>
          ) : null}
        </div>
      </Panel>
    </AppShell>
  );
}
