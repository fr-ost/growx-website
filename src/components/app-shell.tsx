import Link from "next/link";
import type { ReactNode } from "react";
import { IconLayout, IconLock, IconLogOut } from "@/components/icons";
import { Container } from "@/components/ui/primitives";

/** Signed-in layout. There is one signed-in page: the dashboard. */
export function AppShell({ email, children, admin = false, active = "/dashboard" }: { email: string | undefined; children: ReactNode; admin?: boolean; active?: "/dashboard" | "/admin" }) {
  const tab = (on: boolean) => `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${on ? "bg-accent-soft text-accent-ink ring-1 ring-inset ring-accent/15" : "text-text-2 hover:bg-surface-2 hover:text-text"}`;
  return (
    <div className="relative flex-1 bg-surface-2">
      <div className="border-b border-hairline bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <nav aria-label="Account" className="flex gap-1">
            <Link href="/dashboard" className={tab(active === "/dashboard")} aria-current={active === "/dashboard" ? "page" : undefined}>
              <IconLayout size={17} /> Dashboard
            </Link>
            {admin ? (
              <Link href="/admin" className={tab(active === "/admin")} aria-current={active === "/admin" ? "page" : undefined}>
                <IconLock size={17} /> Admin
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-sm text-muted sm:inline">{email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline-strong px-3.5 py-2 text-sm font-semibold text-text-2 hover:border-accent/40 hover:text-accent-ink transition-[scale] duration-[120ms] ease-glide active:scale-[0.98]"
              >
                <IconLogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </Container>
      </div>
      <Container className="space-y-6 py-8 sm:py-10">{children}</Container>
    </div>
  );
}

export function Panel({ title, icon, children, className = "", action }: { title: string; icon?: ReactNode; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`animate-fade-up rounded-2xl border border-hairline bg-white p-5 shadow-hair sm:p-6 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight">
          {icon ? <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink ring-1 ring-inset ring-accent/10">{icon}</span> : null}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
