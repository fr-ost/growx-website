import Link from "next/link";
import type { ReactNode } from "react";
import { IconLayout, IconLock, IconLogOut } from "@/components/icons";
import { Container } from "@/components/ui/primitives";

/** Signed-in layout. There is one signed-in page: the dashboard. */
export function AppShell({ email, children, admin = false, active = "/dashboard" }: { email: string | undefined; children: ReactNode; admin?: boolean; active?: "/dashboard" | "/admin" }) {
  const tab = (on: boolean) => `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${on ? "bg-accent-soft text-accent" : "text-text-2 hover:bg-surface-2 hover:text-text"}`;
  return (
    <div className="relative flex-1 bg-surface-2">
      <div className="border-b border-border bg-white">
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
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-text-2 transition-colors hover:border-accent/40 hover:text-accent"
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
    <section className={`animate-fade-up rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          {icon ? <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">{icon}</span> : null}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
