import Image from "next/image";
import { CtaBand } from "@/components/home/cta-band";
import { IconDownload, IconMail } from "@/components/icons";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { stagger } from "@/components/motion/stagger";
import { CopyButton } from "@/components/tools/ui";
import { Container, PageHero, Section, SectionHeading } from "@/components/ui/primitives";
import { pricingTiers, TRIAL_DAYS } from "@/config/pricing";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "GrowX Press Kit: Logos, Screenshots & Facts",
  description: "GrowX press kit: logos, product screenshots, short and long descriptions, key facts and ready-made links for writing about the X (Twitter) growth tool.",
  path: "/press",
  keywords: ["GrowX press kit", "GrowX logo", "GrowX screenshots", "about GrowX", "X growth tool press"],
});

const oneLine = "GrowX is a free Chrome extension that helps you grow on X (Twitter): smart auto follow, a post scheduler, an on-device AI writer, analytics and an unfollower tracker.";
const short = `GrowX is the all-in-one X (Twitter) growth tool for Chrome. It follows people likely to follow you back at a safe, human pace, schedules posts and threads for your best times, writes with an AI that runs on your own computer, and shows which posts bring followers and who unfollowed you. Free plan forever, with a ${TRIAL_DAYS}-day Premium trial and no credit card.`;
const long = `GrowX is an independent Chrome extension, built by ${site.author}, that brings the daily work of growing an X (Twitter) account into one dashboard. Its smart auto follow reads the newest followers of accounts in your niche, scores every candidate for follow-back likelihood and follows one account at a time with random delays, breaks, rolling caps and an automatic slow-down after any warning from X. A post and thread scheduler with queue slots and a best-time heat map keeps you posting consistently; the GrowX AI writer suggests ideas, hooks and threads using the AI model built into Chrome, so drafts never leave your computer. Insights show every post's numbers, the topics and formats that work, and who followed or unfollowed you, while Reply targets surfaces fresh posts in your niche to reply to early. GrowX works inside your own signed-in x.com session and never asks for your X password. The free plan stays free; Premium starts at $1.99 for 30 days, with a ${TRIAL_DAYS}-day free trial.`;

const shots = [
  { src: "/screens/overview.webp", name: "Dashboard and popup" },
  { src: "/screens/grow.webp", name: "Grow: sources and pace" },
  { src: "/screens/create.webp", name: "Create: composer and GrowX AI" },
  { src: "/screens/insights.webp", name: "Insights: posts and best time" },
  { src: "/screens/followers.webp", name: "Followers: new and unfollowers" },
  { src: "/screens/marquee.webp", name: "Promo banner (1400 x 560)" },
];

const badge = `<a href="${site.url}/" title="GrowX: The Ultimate X (Twitter) Growth Tool"><img src="${site.url}/badges/growx-badge.svg" alt="Grow on X with GrowX" width="220" height="56"></a>`;
const textLink = `<a href="${site.url}/">GrowX, the X (Twitter) growth tool</a>`;

export default function PressPage() {
  const prices = pricingTiers
    .filter((t) => t.priceCents)
    .map((t) => `${t.priceLabel} ${t.cadence}`)
    .join(" · ");
  const facts: [string, string][] = [
    ["Name", "GrowX"],
    ["Full name", `GrowX: ${site.tagline}`],
    ["What it is", "Chrome extension for growing an X (Twitter) account"],
    ["Main features", "Smart auto follow, post scheduler, GrowX AI writer, analytics, unfollower tracker, reply targets, cleanup"],
    ["Platform", "Desktop Chrome 116+ (Windows, macOS, Linux, ChromeOS)"],
    ["Current version", "2.4.4"],
    ["Pricing", `Free plan; ${TRIAL_DAYS}-day Premium trial (no card); Premium ${prices}`],
    ["Developer", site.author],
    ["Website", site.url.replace("https://", "")],
    ["Contact", site.supportEmail],
  ];
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Press kit", path: "/press" }])]} />
      <PageHero eyebrow="Press kit" title={<>Writing about <span className="text-gradient">GrowX</span>?</>}>
        <p>
          Logos, screenshots, descriptions and facts, ready to use. Questions or interview requests:{" "}
          <a className="link-draw font-semibold text-accent-ink" href={`mailto:${site.supportEmail}`}>
            {site.supportEmail}
          </a>
          .
        </p>
      </PageHero>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Key facts" title="GrowX at a glance" />
            <dl className="reveal mt-8 divide-y divide-hairline overflow-clip rounded-3xl border border-hairline bg-white shadow-hair">
              {facts.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4">
                  <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{k}</dt>
                  <dd className="text-sm text-text">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <SectionHeading eyebrow="Descriptions" title="Copy and paste" />
            <div className="mt-8 space-y-4">
              {[
                ["One line", oneLine],
                ["Short (about 60 words)", short],
                ["Long (about 170 words)", long],
              ].map(([k, v]) => (
                <div key={k} className="reveal rounded-3xl border border-border bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold">{k}</h3>
                    <CopyButton value={v} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-2">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-2">
        <Container>
          <SectionHeading eyebrow="Brand assets" title="Logo, badge and screenshots" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { src: "/logo.svg", name: "Logo (SVG)", w: 72, h: 72 },
              { src: "/icon.png", name: "Icon (PNG, 128 x 128)", w: 72, h: 72 },
              { src: "/badges/growx-badge.svg", name: "Badge (SVG)", w: 140, h: 36 },
            ].map((a, i) => (
              <li key={a.src} className="reveal lift flex items-center gap-5 rounded-3xl border border-hairline bg-white p-5 shadow-hair" style={stagger(i % 3)}>
                <div
                  data-tilt="3"
                  className="grid h-24 w-40 shrink-0 place-items-center rounded-2xl ring-1 ring-hairline-strong [background:repeating-conic-gradient(#f1ecee_0_25%,#fff_0_50%)_0_0/16px_16px]"
                >
                  <Image src={a.src} alt={`GrowX ${a.name}`} width={a.w} height={a.h} className="rounded-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold">{a.name}</p>
                  <a href={a.src} download className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
                    <IconDownload size={15} /> <span className="link-draw">Download</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shots.map((s, i) => (
              <li key={s.src} className="reveal lift group overflow-clip rounded-3xl border border-hairline bg-white shadow-hair" style={stagger(i % 3)}>
                <div className="relative overflow-clip border-b border-hairline bg-surface-2">
                  <Image
                    src={s.src}
                    alt={`GrowX screenshot: ${s.name} (demo data)`}
                    width={640}
                    height={280}
                    className="h-auto w-full fx:transition-[scale] fx:duration-500 fx:ease-glide fx:group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 360px, 100vw"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-text-2 shadow-hair ring-1 ring-hairline-strong"
                  >
                    demo data
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <p className="text-sm font-bold">{s.name}</p>
                  <a href={s.src} download className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
                    <IconDownload size={15} /> <span className="link-draw">WebP</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Screenshots show demo data. Please do not present their numbers as real results.</p>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Linking to GrowX" title="Link or add the badge" center>
            Please link to the home page or the most relevant feature page. Thank you for mentioning GrowX.
          </SectionHeading>
          <div className="mt-10 space-y-4">
            {[
              ["Text link (HTML)", textLink],
              ["Badge (HTML)", badge],
            ].map(([k, v]) => (
              <div key={k} className="reveal rounded-3xl border border-hairline bg-white p-5 shadow-hair">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">{k}</h3>
                  <CopyButton value={v} label="Copy code" />
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-2xl bg-surface-2 p-4 font-mono text-xs leading-relaxed text-text-2 ring-1 ring-hairline">{v}</pre>
              </div>
            ))}
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-text-2">
            <IconMail size={16} className="text-accent-ink" /> Press and partnerships:{" "}
            <a className="link-draw font-semibold text-accent-ink" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
          </p>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
