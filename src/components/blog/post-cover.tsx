import type { ReactNode } from "react";
import { hash, rand } from "@/components/motion/demos/seed";
import type { Post } from "@/content/posts";

type Category = Post["category"];
type Rng = () => number;
type Layers = { back: ReactNode; front: ReactNode };

/** Round to one decimal so the SVG markup stays short and stable. */
const n = (v: number) => Math.round(v * 10) / 10;
const between = (r: Rng, min: number, max: number) => n(min + r() * (max - min));

const WHITE = "#fff";
const PINK = "#ff5a68";
const INK = "#160d12";

/** A skeleton text bar (never real text: covers carry no words or numbers). */
function Bar({ x, y, w, h = 6, fill = INK, o = 0.14 }: { x: number; y: number; w: number; h?: number; fill?: string; o?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} fillOpacity={o} />;
}

/** The GrowX arrowhead (from the logo), placed so its tip sits up-right of (x, y). */
function Arrowhead({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const p = (dx: number, dy: number) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return <path d={`M${p(-16, -3.5)} L${p(4.6, -5.8)} L${p(2.3, 15)} Z`} fill={WHITE} stroke={WHITE} strokeWidth={3} strokeLinejoin="round" />;
}

/** Guides: a rising stepped line that ends in the GrowX arrow. */
function guides(r: Rng): Layers {
  const steps = 4 + Math.floor(r() * 3);
  const [sx, sy, ex, ey] = [30, 118, between(r, 254, 270), between(r, 30, 40)];
  const dx = (ex - 24 - sx) / steps;
  const dy = (sy - (ey + 24)) / steps;
  let d = `M${sx} ${sy}`;
  const corners: [number, number][] = [];
  for (let i = 1; i <= steps; i++) {
    const x = n(sx + dx * i);
    const y = n(sy - dy * i);
    d += ` H${x} V${y}`;
    corners.push([x, y]);
  }
  d += ` L${ex} ${ey}`;
  return {
    back: (
      <>
        <path d={d} transform="translate(-14 14)" fill="none" stroke={WHITE} strokeOpacity={0.16} strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={38} fill="none" stroke={WHITE} strokeOpacity={0.1} strokeWidth={1.5} />
        <circle cx={ex} cy={ey} r={62} fill="none" stroke={WHITE} strokeOpacity={0.06} strokeWidth={1.5} />
      </>
    ),
    front: (
      <>
        <path d={d} fill="none" stroke={WHITE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {corners.slice(0, -1).map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} fill={PINK} stroke={WHITE} strokeWidth={2.5} />
        ))}
        <Arrowhead x={ex} y={ey} />
      </>
    ),
  };
}

/** Create: stacked post cards and a clock. */
function create(r: Rng): Layers {
  const hour = between(r, 0, 360);
  const minute = between(r, 0, 360);
  const hand = (deg: number, len: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x2: n(250 + Math.cos(a) * len), y2: n(98 + Math.sin(a) * len) };
  };
  const w1 = between(r, 56, 84);
  const w2 = between(r, 72, 104);
  return {
    back: (
      <>
        <rect x={104} y={14} width={150} height={78} rx={12} fill={WHITE} fillOpacity={0.12} transform="rotate(5 179 53)" />
        <rect x={94} y={22} width={150} height={80} rx={12} fill={WHITE} fillOpacity={0.24} transform="rotate(2.5 169 62)" />
      </>
    ),
    front: (
      <>
        <rect x={80} y={34} width={150} height={82} rx={12} fill={WHITE} />
        <circle cx={100} cy={54} r={9} fill={PINK} />
        <Bar x={116} y={48} w={w1} />
        <Bar x={116} y={58} w={36} h={5} o={0.08} />
        <Bar x={96} y={78} w={116} />
        <Bar x={96} y={90} w={w2} />
        <Bar x={96} y={102} w={44} h={5} fill={PINK} o={0.5} />
        <circle cx={250} cy={98} r={25} fill={INK} stroke={WHITE} strokeWidth={3.5} />
        <line x1={250} y1={98} {...hand(hour, 11)} stroke={WHITE} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={250} y1={98} {...hand(minute, 17)} stroke={PINK} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={250} cy={98} r={2.5} fill={WHITE} />
      </>
    ),
  };
}

/** A speech bubble with a tail on one side, filled with skeleton bars. */
function Bubble({ x, y, w, h, side, fill, o = 1, bars }: { x: number; y: number; w: number; h: number; side: "l" | "r"; fill: string; o?: number; bars: number[] }) {
  const tx = side === "l" ? x + 14 : x + w - 14;
  const tail = side === "l" ? `M${tx} ${y + h - 1} l-10 11 l18 -11 Z` : `M${tx} ${y + h - 1} l10 11 l-18 -11 Z`;
  const barFill = fill === WHITE ? INK : WHITE;
  return (
    <g fillOpacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2.4} fill={fill} />
      <path d={tail} fill={fill} />
      {bars.map((bw, i) => (
        <Bar key={i} x={x + 14} y={y + 10 + i * 10} w={bw} fill={barFill} o={barFill === INK ? 0.14 : 0.55} />
      ))}
    </g>
  );
}

/** Engage: reply bubbles. */
function engage(r: Rng): Layers {
  const flip = r() > 0.5;
  const a = between(r, 70, 110);
  const b = between(r, 50, 90);
  const c = between(r, 60, 100);
  const L = (x: number) => (flip ? 320 - x : x);
  return {
    back: (
      <>
        <Bubble x={flip ? 320 - 52 - 150 : 52} y={14} w={150} h={36} side={flip ? "r" : "l"} fill={WHITE} o={0.22} bars={[a, a * 0.6]} />
        <Bubble x={flip ? 320 - 70 - 130 : 70} y={98} w={130} h={28} side={flip ? "r" : "l"} fill={WHITE} o={0.16} bars={[c * 0.8]} />
        <circle cx={L(34)} cy={46} r={10} fill={WHITE} fillOpacity={0.3} />
      </>
    ),
    front: (
      <>
        <Bubble x={flip ? 320 - 112 - 164 : 112} y={50} w={164} h={38} side={flip ? "l" : "r"} fill={WHITE} bars={[b + 30, b]} />
        <circle cx={L(292)} cy={84} r={11} fill={PINK} stroke={WHITE} strokeWidth={2.5} />
        <path d={flip ? `M${L(82)} 56 V63 a6 6 0 0 1 -6 6 H${L(106)}` : `M82 56 V63 a6 6 0 0 0 6 6 H106`} fill="none" stroke={WHITE} strokeOpacity={0.55} strokeWidth={2.5} strokeLinecap="round" />
      </>
    ),
  };
}

/** Insights: bars and heat cells. */
function insights(r: Rng): Layers {
  const bars = Array.from({ length: 7 }, (_, i) => between(r, 18 + i * 5, 40 + i * 7));
  const top = bars.indexOf(Math.max(...bars));
  const cells = Array.from({ length: 28 }, () => r());
  return {
    back: (
      <>
        {cells.map((v, i) => (
          <rect key={i} x={186 + (i % 7) * 16} y={30 + Math.floor(i / 7) * 16} width={12} height={12} rx={3} fill={v > 0.72 ? PINK : WHITE} fillOpacity={v > 0.72 ? 0.95 : n(0.08 + v * 0.3)} />
        ))}
      </>
    ),
    front: (
      <>
        <line x1={28} y1={120} x2={168} y2={120} stroke={WHITE} strokeOpacity={0.35} strokeWidth={1.5} strokeLinecap="round" />
        {bars.map((h, i) => (
          <rect key={i} x={34 + i * 19} y={n(116 - h)} width={12} height={h} rx={3} fill={i === top ? PINK : WHITE} fillOpacity={i === top ? 1 : 0.85} />
        ))}
      </>
    ),
  };
}

/** How it works: flow arrows between three steps. */
function howItWorks(r: Rng): Layers {
  const lift = Array.from({ length: 3 }, () => between(r, -8, 8));
  const hot = Math.floor(r() * 3);
  const xs = [36, 139, 242];
  return {
    back: (
      <>
        <path d="M63 104 C 100 134, 220 134, 263 104" fill="none" stroke={WHITE} strokeOpacity={0.22} strokeWidth={2.5} strokeDasharray="3 7" strokeLinecap="round" />
        <path d="M70 99 l-7 5 l8 3" fill="none" stroke={WHITE} strokeOpacity={0.22} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    front: (
      <>
        {xs.slice(0, 2).map((x, i) => {
          const y1 = 70 + lift[i];
          const y2 = 70 + lift[i + 1];
          return (
            <g key={x} stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d={`M${x + 52} ${y1} L${xs[i + 1] - 10} ${y2}`} />
              <path d={`M${xs[i + 1] - 18} ${y2 - 7} L${xs[i + 1] - 9} ${y2} L${xs[i + 1] - 18} ${y2 + 7}`} />
            </g>
          );
        })}
        {xs.map((x, i) => (
          <g key={x}>
            <rect x={x} y={44 + lift[i]} width={44} height={52} rx={12} fill={i === hot ? PINK : WHITE} stroke={WHITE} strokeWidth={i === hot ? 3 : 0} />
            <Bar x={x + 10} y={60 + lift[i]} w={24} fill={i === hot ? WHITE : INK} o={i === hot ? 0.9 : 0.16} />
            <Bar x={x + 10} y={72 + lift[i]} w={16} fill={i === hot ? WHITE : INK} o={i === hot ? 0.6 : 0.1} />
          </g>
        ))}
      </>
    ),
  };
}

/** Features: a tile grid with one tile lifted. */
function features(r: Rng): Layers {
  const hot = Math.floor(r() * 8);
  const tile = (i: number) => ({ x: 41 + (i % 4) * 62, y: 26 + Math.floor(i / 4) * 50 });
  const widths = Array.from({ length: 8 }, () => between(r, 16, 30));
  const h = tile(hot);
  return {
    back: (
      <>
        {widths.map((w, i) => {
          const t = tile(i);
          return (
            <g key={i}>
              <rect x={t.x} y={t.y} width={52} height={40} rx={10} fill={WHITE} fillOpacity={0.12} stroke={WHITE} strokeOpacity={0.28} strokeWidth={1.2} />
              <circle cx={t.x + 13} cy={t.y + 14} r={4} fill={WHITE} fillOpacity={0.45} />
              <Bar x={t.x + 10} y={t.y + 25} w={w} h={5} fill={WHITE} o={0.35} />
            </g>
          );
        })}
      </>
    ),
    front: (
      <g transform="translate(-4 -5)">
        <rect x={h.x} y={h.y} width={52} height={40} rx={10} fill={PINK} stroke={WHITE} strokeWidth={2.5} />
        <circle cx={h.x + 13} cy={h.y + 14} r={4.5} fill={WHITE} />
        <Bar x={h.x + 10} y={h.y + 25} w={30} h={5} fill={WHITE} o={0.9} />
      </g>
    ),
  };
}

/** Roadmap: timeline dots (done, now, next). */
function roadmap(r: Rng): Layers {
  const done = 2 + Math.floor(r() * 2);
  const xs = [42, 101, 160, 219, 278];
  const widths = xs.map(() => between(r, 26, 40));
  return {
    back: (
      <>
        <line x1={24} y1={72} x2={296} y2={72} stroke={WHITE} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round" />
        <line x1={24} y1={72} x2={xs[done]} y2={72} stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
        {xs.map((x, i) => {
          const up = i % 2 === 0;
          const y = up ? 22 : 92;
          return (
            <g key={x}>
              <line x1={x} y1={up ? y + 26 : y} x2={x} y2={up ? 64 : 80} stroke={WHITE} strokeOpacity={0.3} strokeWidth={1.5} />
              <rect x={x - 24} y={y} width={48} height={26} rx={8} fill={WHITE} fillOpacity={i <= done ? 0.92 : 0.16} />
              <Bar x={x - 16} y={y + 10} w={widths[i]} h={5} fill={i <= done ? INK : WHITE} o={i <= done ? 0.16 : 0.4} />
            </g>
          );
        })}
      </>
    ),
    front: (
      <>
        {xs.map((x, i) =>
          i < done ? (
            <circle key={x} cx={x} cy={72} r={6} fill={WHITE} />
          ) : i === done ? (
            <g key={x}>
              <circle cx={x} cy={72} r={13} fill={PINK} fillOpacity={0.3} />
              <circle cx={x} cy={72} r={7.5} fill={PINK} stroke={WHITE} strokeWidth={3} />
            </g>
          ) : (
            <circle key={x} cx={x} cy={72} r={5.5} fill={INK} stroke={WHITE} strokeOpacity={0.6} strokeWidth={2} />
          ),
        )}
      </>
    ),
  };
}

const MOTIFS: Record<Category, (r: Rng) => Layers> = {
  Guides: guides,
  Create: create,
  Engage: engage,
  Insights: insights,
  "How it works": howItWorks,
  Features: features,
  Roadmap: roadmap,
};

const LAYER =
  "absolute inset-0 size-full fx:transition-[translate] fx:duration-[var(--dur-3)] fx:ease-glide";

/**
 * Decorative, text-free cover for a post: one motif per category over a warm mesh of two
 * radial gradients (brand reds over ink), varied deterministically by the slug. With a fine
 * pointer, hovering the parent `.group` shifts the two layers 6px in opposite directions.
 */
export function PostCover({ slug, category, className = "aspect-[16/7]" }: { slug: string; category: Category; className?: string }) {
  const seed = hash(slug);
  const r = rand(seed);
  const [x1, y1, x2, y2] = [Math.round(6 + r() * 34), Math.round(r() * 40), Math.round(60 + r() * 34), Math.round(60 + r() * 40)];
  const background = [
    "radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1.2px) 0 0 / 16px 16px",
    `radial-gradient(85% 120% at ${x1}% ${y1}%, rgb(255 75 92 / 0.92), transparent 62%)`,
    `radial-gradient(80% 110% at ${x2}% ${y2}%, rgb(159 18 57 / 0.9), transparent 66%)`,
    "linear-gradient(160deg, #3a1420, #160d12)",
  ].join(", ");
  const { back, front } = MOTIFS[category](rand(seed ^ 0x9e3779b9));
  return (
    <div aria-hidden="true" data-decor="" className={`relative overflow-clip ${className}`} style={{ background }}>
      <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet" focusable="false" className={`${LAYER} fx:group-hover:-translate-x-1.5`}>
        {back}
      </svg>
      <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet" focusable="false" className={`${LAYER} fx:group-hover:translate-x-1.5`}>
        {front}
      </svg>
    </div>
  );
}
