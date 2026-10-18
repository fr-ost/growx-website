import { notFound } from "next/navigation";
import { AllocationIncrease, EarlyBirdEditor } from "@/components/admin/early-bird-admin";
import { GiftAudit, GiftList, GrantGift } from "@/components/admin/gifts-admin";
import { XAccountsAdmin } from "@/components/admin/x-accounts-admin";
import { AppShell, Panel } from "@/components/app-shell";
import { IconAt, IconGift, IconStar } from "@/components/icons";
import { Notice } from "@/components/ui/primitives";
import { getTier } from "@/config/pricing";
import { isAdmin } from "@/lib/admin/auth";
import { loadEarlyBirdAdmin, loadGifts } from "@/lib/admin/data";
import { pageMetadata } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/require-user";

export const metadata = pageMetadata({ title: "Admin", description: "GrowX administration.", path: "/admin", noindex: true });
export const dynamic = "force-dynamic";

const fmt = (iso: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso)) + " UTC";
const money = (minor: number | null) => (minor === null ? "-" : `$${(minor / 100).toFixed(2)}`);

/** Admin dashboard. Only users listed in public.admins can see it (others get a 404); every action is re-checked on the server. */
export default async function AdminPage() {
  const user = await requireUser("/admin");
  if (!(await isAdmin(user.id))) notFound();

  const admin = createAdminClient();
  const [gifts, eb] = await Promise.all([loadGifts(admin).catch(() => null), loadEarlyBirdAdmin(admin).catch(() => null)]);
  const lifetime = getTier("PRO_LIFETIME");

  return (
    <AppShell email={user.email} admin active="/admin">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
        <p className="mt-1 text-text-2">Premium gifts, X accounts and the Lifetime early-bird offer. Every change is recorded with your account and the time.</p>
      </div>

      <Panel title="Premium Gifts" icon={<IconGift size={17} />}>
        {gifts ? (
          <div className="space-y-6">
            <GrantGift />
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">Gifts</h3>
              <GiftList gifts={gifts.gifts} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">Audit log</h3>
              <GiftAudit rows={gifts.audit} />
            </div>
          </div>
        ) : (
          <Notice tone="error">Gifts could not be loaded. Check that the admin migration is applied (/api/health).</Notice>
        )}
      </Panel>

      <Panel title="X Accounts" icon={<IconAt size={17} />}>
        <p className="mb-4 text-sm text-text-2">Change or unlink any user&apos;s linked X username. A new name must not be linked to another account; every change is recorded with your account and the reason.</p>
        <XAccountsAdmin />
      </Panel>

      <Panel title="Lifetime Early Bird" icon={<IconStar size={17} />}>
        {eb ? (
          <div className="space-y-6">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="early-bird-stats">
              {[
                ["Regular Lifetime", lifetime.priceLabel],
                ["Early Bird price", lifetime.earlyBird?.priceLabel ?? "-"],
                ["Campaign allocation", String(eb.status.campaign_allocation)],
                ["Successful purchases", String(eb.status.sold)],
                ["Spots remaining", String(eb.status.remaining)],
                ["Pending reservations", String(eb.status.open_reservations)],
                ["Offer status", eb.status.enabled ? "Enabled" : "Disabled"],
                ["Customers see", eb.status.state === "available" ? lifetime.earlyBird?.priceLabel ?? "-" : eb.status.state === "unavailable" ? `${lifetime.priceLabel} (all spots reserved)` : lifetime.priceLabel],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
                  <dd className="mt-1 text-lg font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            {process.env.EARLY_ADOPTER_ENABLED === "false" ? (
              <Notice tone="warn">EARLY_ADOPTER_ENABLED=false is set in this deployment: everyone pays {lifetime.priceLabel} regardless of the settings below.</Notice>
            ) : null}
            <EarlyBirdEditor remaining={eb.status.remaining} enabled={eb.status.enabled} sold={eb.status.sold} allocation={eb.status.campaign_allocation} updatedAt={eb.status.updated_at} />
            <AllocationIncrease allocation={eb.status.campaign_allocation} />
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">Inventory history</h3>
              {eb.events.length ? (
                <ul className="space-y-1 text-xs text-text-2" aria-label="Inventory history">
                  {eb.events.map((e) => (
                    <li key={e.id}>
                      {fmt(e.createdAt)} · {e.admin} ·{" "}
                      {e.action === "increase_allocation"
                        ? `allocation ${e.prevAllocation} → ${e.newAllocation}`
                        : `remaining ${e.prevRemaining} → ${e.newRemaining}, ${e.prevEnabled ? "enabled" : "disabled"} → ${e.newEnabled ? "enabled" : "disabled"}`}{" "}
                      (sold at the time: {e.soldAtChange}){e.reason ? ` · "${e.reason}"` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No changes yet.</p>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted">Recent early-bird purchases</h3>
              {eb.sales.length ? (
                <ul className="space-y-1 text-xs text-text-2" aria-label="Early-bird purchases">
                  {eb.sales.map((s) => (
                    <li key={s.slot}>#{s.slot} · {fmt(s.claimedAt)} · {s.buyer ?? "?"} · {money(s.amountMinor)} · payment {s.paymentStatus ?? "?"}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No early-bird purchases yet.</p>
              )}
            </div>
          </div>
        ) : (
          <Notice tone="error">The early-bird settings could not be loaded. Check that the admin migration is applied (/api/health).</Notice>
        )}
      </Panel>
    </AppShell>
  );
}
