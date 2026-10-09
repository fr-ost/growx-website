import { AppShell, Panel } from "@/components/app-shell";
import { IconLock, IconMail, IconStar, IconUser } from "@/components/icons";
import { PlanSummary, formatDate } from "@/components/plan-summary";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
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

export default async function AccountPage() {
  const user = await requireUser("/account");
  const supabase = await createClient();

  const [ent, x, payments] = await Promise.all([
    tryLoadEntitlement(supabase, user.id),
    supabase.from("x_profiles").select(COLUMNS.x_profiles).eq("user_id", user.id).maybeSingle(),
    supabase.from("payments").select(COLUMNS.payments).eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);
  const entitlement = ent.entitlement;
  const xIssue = x.error ? toDbIssue("x_profiles", x.error) : null;
  const payIssue = payments.error ? toDbIssue("payments", payments.error) : null;
  if (xIssue) logDbIssue(xIssue, x.error);
  if (payIssue) logDbIssue(payIssue, payments.error);
  const xUsername = (x.data as { x_username?: string } | null)?.x_username ?? null;
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";

  return (
    <AppShell active="/account" email={user.email}>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Account</h1>
        <p className="mt-1 text-text-2">Your profile, plan and billing history.</p>
      </div>

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

      <Panel title="Plan" icon={<IconStar size={17} />}>
        {entitlement ? <PlanSummary e={entitlement} /> : <DataIssue title="Could not load your plan" issues={ent.issues} />}
      </Panel>

      <Panel title="Payments" icon={<IconMail size={17} />}>
        {payIssue ? (
          <DataIssue title="Could not load payments" issues={[payIssue]} />
        ) : payments.data && payments.data.length > 0 ? (
          <ul className="divide-y divide-border">
            {payments.data.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span className="font-semibold">{p.product}</span>
                <span className="text-text-2">
                  {(p.amount_minor / 100).toFixed(2)} {p.currency} · {p.status} · {formatDate(p.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-center">
            <p className="font-semibold">No payments yet</p>
            <p className="mt-1 text-sm text-muted">Premium checkout is coming soon.</p>
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
