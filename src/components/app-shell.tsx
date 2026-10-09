import Link from "next/link";
import type { ReactNode } from "react";
import { IconLayout, IconLogOut, IconUser } from "@/components/icons";
import { Container } from "@/components/ui/primitives";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayout },
  { href: "/account", label: "Account", icon: IconUser },
] as const;

export function AppShell({ active, email, children }: { active: "/dashboard" | "/account"; email: string | undefined; children: ReactNode }) {
  return (
    <div className="relative flex-1 bg-surface-2">
      <div className="border-b border-border bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <nav aria-label="Account" className="flex gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active === t.href ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  active === t.href ? "bg-accent-soft text-accent" : "text-text-2 hover:bg-surface-2 hover:text-text"
                }`}
              >
                <t.icon size={17} /> {t.label}
              </Link>
            ))}
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
