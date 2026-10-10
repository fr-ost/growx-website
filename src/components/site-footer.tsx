import Link from "next/link";
import { Logo } from "@/components/logo";
import { IconChrome, IconMail } from "@/components/icons";
import { Container } from "@/components/ui/primitives";
import { site } from "@/config/site";

const cols = [
  { title: "Product", links: [{ href: "/features", label: "Features" }, { href: "/how-it-works", label: "How it works" }, { href: "/pricing", label: "Pricing" }, { href: "/signup", label: "Start free" }] },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/blog/how-growx-auto-follow-works", label: "How auto follow works" },
      { href: "/blog/growx-features-guide-scoring-filters-cleanup", label: "Features guide" },
      { href: "/blog/growx-potential-best-practices-roadmap", label: "Roadmap" },
    ],
  },
  { title: "Account", links: [{ href: "/login", label: "Log in" }, { href: "/dashboard", label: "Dashboard" }, { href: "/account", label: "Account" }] },
  { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/contact", label: "Support" }, { href: "/privacy", label: "Privacy policy" }, { href: "/terms", label: "Terms of service" }, { href: "/refund-policy", label: "Refund policy" }] },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-border bg-surface-2">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Smart, safety-first growth tools for X, right inside Chrome. GrowX is independent and not affiliated with or endorsed by X Corp.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {site.chromeStoreUrl ? (
              <a
                href={site.chromeStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:border-accent/40 hover:text-accent"
              >
                <IconChrome size={16} /> Chrome Web Store
              </a>
            ) : null}
            <a
              href={`mailto:${site.supportEmail}`}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:border-accent/40 hover:text-accent"
            >
              <IconMail size={16} /> Email us
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-bold text-text">{c.title}</h2>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-text-2 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} GrowX · {site.author}</p>
          <p>Premium plans are paid in crypto via NOWPayments. 30-day free trial, no credit card.</p>
        </Container>
      </div>
    </footer>
  );
}
