import { CountUp } from "./count-up";

export type ToolKey = "counter" | "thread" | "engagement" | "ratio" | "bold" | "templates" | "bio";

const BY_SLUG: Record<string, ToolKey> = {
  "tweet-character-counter": "counter",
  "twitter-thread-maker": "thread",
  "twitter-engagement-rate-calculator": "engagement",
  "twitter-follower-ratio-calculator": "ratio",
  "twitter-bold-text-generator": "bold",
  "tweet-templates": "templates",
  "twitter-bio-generator": "bio",
};

/** Maps a tool href (e.g. "/tools/tweet-templates") to its glyph. */
export function toolKey(href: string): ToolKey {
  const slug = href.split("/").filter(Boolean).pop() ?? "";
  return BY_SLUG[slug] ?? "counter";
}

/**
 * aria-hidden previews for the free tools (home grid + tools hub). Fixed sizes (sm 56px,
 * lg 88px). Hover motion is transform-only and fine-pointer only (fx:) on a parent `.group`.
 */
export function ToolGlyph({ tool, size = "sm" }: { tool: ToolKey; size?: "sm" | "lg" }) {
  const box = size === "lg" ? "size-[88px] rounded-[1.4rem] text-[15px]" : "size-14 rounded-2xl text-[11px]";
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-clip bg-[linear-gradient(180deg,#fff,var(--tint))] font-display font-extrabold text-accent-ink ring-1 ring-hairline-strong shadow-[var(--shadow-hair)] ${box}`}
    >
      <Glyph tool={tool} lg={size === "lg"} />
    </span>
  );
}

function Glyph({ tool, lg }: { tool: ToolKey; lg: boolean }) {
  const s = lg ? 1.5 : 1;
  switch (tool) {
    case "counter":
      return (
        <span className="relative grid place-items-center">
          <svg width={40 * s} height={40 * s} viewBox="0 0 40 40" className="-rotate-90" aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3.5" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset="22" />
          </svg>
          <span className="absolute inset-0 grid place-items-center">
            <CountUp value={280} />
          </span>
        </span>
      );
    case "thread":
      return (
        <span className="relative block" style={{ width: 34 * s, height: 30 * s }}>
          {["1/3", "2/3", "3/3"].map((t, i) => (
            <span
              key={t}
              className={`absolute left-0 top-0 grid h-[70%] w-[78%] place-items-center rounded-md border border-hairline-strong bg-white font-mono text-[0.8em] text-text-2 shadow-[var(--shadow-hair)] fx:transition-[translate,rotate] fx:duration-300 fx:ease-glide ${
                ["", "translate-x-[11%] translate-y-[15%] fx:group-hover:translate-x-[22%] fx:group-hover:translate-y-[20%] fx:group-hover:rotate-3", "translate-x-[22%] translate-y-[30%] fx:group-hover:translate-x-[30%] fx:group-hover:translate-y-[42%] fx:group-hover:rotate-6"][i]
              }`}
            >
              {t}
            </span>
          ))}
        </span>
      );
    case "engagement":
      return (
        <span className="flex items-end gap-[3px]" style={{ height: 30 * s }}>
          <span className="mr-1 self-center">ER</span>
          {[0.45, 0.7, 0.55, 0.9].map((h, i) => (
            <span
              key={i}
              className="w-[5px] origin-bottom rounded-sm bg-accent fx:transition-[scale] fx:duration-300 fx:ease-glide fx:group-hover:scale-y-110"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </span>
      );
    case "ratio":
      return (
        <span className="grid place-items-center gap-1">
          <span className="relative block h-[3px] w-9 origin-center rounded-full bg-text-2 fx:transition-[rotate] fx:duration-300 fx:ease-glide fx:group-hover:-rotate-12">
            <span className="absolute -left-0.5 -top-1.5 size-2.5 rounded-full bg-accent" />
            <span className="absolute -right-0.5 -top-1.5 size-2.5 rounded-full bg-text-2" />
          </span>
          <span className="block h-2.5 w-[3px] bg-text-2" />
          <span className="font-mono text-[0.8em] font-semibold text-text-2">5,000</span>
        </span>
      );
    case "bold":
      return (
        <span className="flex items-baseline gap-1" style={{ fontSize: `${1.6 * s}em` }}>
          <span className="font-black text-text">B</span>
          <span className="font-serif italic text-accent-ink">I</span>
        </span>
      );
    case "templates":
      return (
        <span className="grid place-items-center leading-none">
          <span style={{ fontSize: `${1.7 * s}em` }}>
            <CountUp value={52} />
          </span>
        </span>
      );
    case "bio":
      return (
        <span className="grid w-[76%] gap-1.5">
          <span className="relative block h-1.5 overflow-clip rounded-full bg-border">
            <span className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-accent" />
          </span>
          <span className="text-center leading-none">
            <CountUp value={160} />
          </span>
        </span>
      );
  }
}
