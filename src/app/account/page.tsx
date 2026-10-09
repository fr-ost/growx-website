import { PlanSummary, formatDate } from "@/components/plan-summary";
import { Button } from "@/components/ui/button";
import { Badge, Card, Container, Notice, PageHeader, Section } from "@/components/ui/primitives";
import { loadEntitlement } from "@/lib/entitlement/load";
import type { Entitlement } from "@/lib/entitlement/types";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Account", description: "Your GrowX account and plan.", path: "/account", noindex: true });
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const supabase = await createClient();

  let entitlement: Entitlement | null = null;
  try {
    entitlement = await loadEntitlement(supabase, user.id);
  } catch {
    entitlement = null;
  }
  const [x, payments] = await Promise.all([
    supabase.from("x_profiles").select("x_username").eq("user_id", user.id).maybeSingle(),
    supabase.from("payments").select("id, product, amount_minor, currency, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <Section>
      <Container className="space-y-8">
        <PageHeader eyebrow="Account" title="Account and plan" />

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Profile</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Email</dt>
              <dd className="mt-1 break-all font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Email status</dt>
              <dd className="mt-1">{user.email_confirmed_at ? <Badge tone="ok">Confirmed</Badge> : <Badge tone="warn">Not confirmed</Badge>}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">X username (self-reported)</dt>
              <dd className="mt-1 font-medium">{x.data?.x_username ? `@${x.data.x_username}` : "Not set"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Plan</h2>
          {entitlement ? <PlanSummary e={entitlement} /> : <Notice tone="error">Could not load your plan. Please refresh.</Notice>}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Payments</h2>
          {payments.error ? (
            <Notice tone="error">Could not load payments.</Notice>
          ) : payments.data && payments.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {payments.data.map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span>{p.product}</span>
                  <span>
                    {(p.amount_minor / 100).toFixed(2)} {p.currency} - {p.status} - {formatDate(p.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-2">No payments yet. Checkout is not available.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Session</h2>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
          <p className="text-sm text-muted">Account deletion is not self-service yet. Contact support to request it.</p>
        </Card>
      </Container>
    </Section>
  );
}
