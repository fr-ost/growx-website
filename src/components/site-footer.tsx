import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/primitives";

const cols = [
  { title: "Product", links: [{ href: "/features", label: "Features" }, { href: "/pricing", label: "Pricing" }] },
  { title: "Account", links: [{ href: "/login", label: "Log in" }, { href: "/signup", label: "Sign up" }, { href: "/dashboard", label: "Dashboard" }] },
  { title: "Company", links: [{ href: "/contact", label: "Contact" }, { href: "/privacy", label: "Privacy (draft)" }, { href: "/terms", label: "Terms (draft)" }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            GrowX is an independent Chrome extension. It is not affiliated with or endorsed by X Corp.
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-text-2 hover:text-text hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} GrowX. Pricing shown is planned; checkout is not yet available.
      </div>
    </footer>
  );
}
