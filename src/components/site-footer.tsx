import Link from "next/link";
import { Logo } from "@/components/logo";
import { IconChrome, IconMail } from "@/components/icons";
import { Container } from "@/components/ui/primitives";
import { featureNav, toolNav } from "@/config/nav";
import { site } from "@/config/site";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "All features" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/tools", label: "Free tools" },
      { href: "/blog", label: "Blog" },
      { href: "/signup", label: "Start free" },
    ],
  },
  { title: "Free tools", links: toolNav.map((t) => ({ href: t.href, label: t.label })) },
  { title: "Features", links: featureNav.map((f) => ({ href: `/features/${f.slug}`, label: f.label })) },
  {
    title: "Guides",
    links: [
      { href: "/blog/how-to-grow-on-twitter-x", label: "How to grow on Twitter" },
      { href: "/blog/first-1000-followers-on-x", label: "Your first 1,000 followers" },
      { href: "/blog/how-to-schedule-tweets", label: "How to schedule tweets" },
      { href: "/blog/best-time-to-post-on-twitter", label: "Best time to post on X" },
      { href: "/blog/who-unfollowed-me-on-twitter", label: "Who unfollowed me?" },
      { href: "/blog/twitter-algorithm-explained", label: "The X algorithm explained" },
      { href: "/blog/best-twitter-growth-tools", label: "Best growth tools" },
      { href: "/blog", label: "All articles" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/press", label: "Press kit" },
      { href: "/contact", label: "Support" },
      { href: "/login", label: "Log in" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto bg-ink text-white/70">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(5,1fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            The all-in-one X (Twitter) growth tool for Chrome: smart auto follow, a post scheduler, an AI writer, analytics and cleanup.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {site.chromeStoreUrl ? (
              <a
                href={site.chromeStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                <IconChrome size={16} /> Chrome Web Store
              </a>
            ) : null}
            <a
              href={`mailto:${site.supportEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/40"
            >
              <IconMail size={16} /> Email us
            </a>
          </div>
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-white/45">GrowX is independent and not affiliated with or endorsed by X Corp.</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-bold text-white">{c.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/45 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} GrowX · {site.author}</p>
          <p>Free plan forever · 30-day Premium trial, no credit card · Premium paid in crypto via NOWPayments</p>
        </Container>
      </div>
    </footer>
  );
}
