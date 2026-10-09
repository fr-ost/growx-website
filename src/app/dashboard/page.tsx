import Link from "next/link";
import { PlanSummary, formatDate } from "@/components/plan-summary";
import { StartTrialForm, XUsernameForm } from "@/components/dashboard-forms";
import { LinkButton } from "@/components/ui/button";
import { Card, Container, Notice, PageHeader, Section } from "@/components/ui/primitives";
import { TRIAL_DAYS } from "@/config/pricing";
import { loadEntitlement } from "@/lib/entitlement/load";
import type { Entitlement } from "@/lib/entitlement/types";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Dashboard", description: "Your GrowX dashboard.", path: "/dashboard", noindex: true });
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();

  let entitlement: Entitlement | null = null;
  try {
    entitlement = await loadEntitlement(supabase, user.id);
  } catch {
    entitlement = null;
  }
  const x = await supabase.from("x_profiles").select("x_username").eq("user_id", user.id).maybeSingle();
  const username = x.data?.x_username ?? null;
  const emailConfirmed = !!user.email_confirmed_at;

  const canStart = !!entitlement && !entitlement.trial.used && !!username && emailConfirmed;

  return (
    <Section>
      <Container className="space-y-8">
        <PageHeader eyebrow="Dashboard" title="Your GrowX dashboard">
          Signed in as {user.email}.
        </PageHeader>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Plan</h2>
          {entitlement ? (
            <PlanSummary e={entitlement} />
          ) : (
            <Notice tone="error" title="Could not load your plan">
              Please refresh. If this keeps happening, contact support.
            </Notice>
          )}
          <p className="text-sm text-muted">
            Premium cannot be purchased yet.{" "}
            <Link className="underline" href="/pricing">
              See planned pricing
            </Link>
            .
          </p>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold">X username</h2>
            <XUsernameForm current={username} />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold">{TRIAL_DAYS}-day Premium trial</h2>
            {!entitlement ? (
              <p className="text-sm text-text-2">Trial status is unavailable right now.</p>
            ) : entitlement.trial.active ? (
              <Notice tone="success" title="Trial active">
                Ends {formatDate(entitlement.trial.expiresAt)}.
              </Notice>
            ) : entitlement.trial.used ? (
              <Notice tone="info" title="Trial used">
                Your trial ended {formatDate(entitlement.trial.expiresAt)}. Each account can start one trial.
              </Notice>
            ) : (
              <>
                <p className="text-sm text-text-2">
                  The trial starts only when you press the button. Each account can start one trial, tied to a
                  confirmed email and an X username.
                </p>
                {!emailConfirmed ? <Notice tone="warn">Confirm your email address to start a trial.</Notice> : null}
                {!username ? <Notice tone="warn">Save your X username first.</Notice> : null}
                <StartTrialForm disabled={!canStart} />
              </>
            )}
            <p className="text-xs text-muted">
              The trial is recorded on the server. The GrowX extension does not read it yet, so nothing changes inside
              the extension today.
            </p>
          </Card>
        </div>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Extension connection</h2>
          <Notice tone="info" title="Not available yet">
            Linking the GrowX extension to your account is a later phase. Until then the extension works as it does
            today, without signing in.
          </Notice>
          <LinkButton href="/account" variant="secondary">
            Account details
          </LinkButton>
        </Card>
      </Container>
    </Section>
  );
}
