/** Template-based X (Twitter) bio ideas. Runs in the browser; no AI, nothing is sent anywhere. */
export const BIO_LIMIT = 160;

export interface BioInput {
  /** e.g. "Founder of Acme" */
  role: string;
  /** e.g. "indie hackers" */
  audience: string;
  /** e.g. "ship faster" */
  benefit: string;
  /** comma separated, e.g. "SaaS, marketing, design" */
  topics: string;
  /** e.g. "Built 3 products" */
  proof: string;
  /** e.g. "Coffee, cats and long walks" */
  personal: string;
  /** e.g. "Free guide below" */
  cta: string;
}

const clean = (s: string) => s.trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "");
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const list = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);
const sentence = (s: string) => (s ? `${cap(s)}.` : "");
const join = (parts: string[], sep = " ") => parts.filter(Boolean).join(sep).replace(/\s+/g, " ").trim();

export const bioLength = (bio: string) => [...bio].length;

/** Up to 8 distinct bios built from the parts that were filled in. */
export function generateBios(raw: BioInput): string[] {
  const role = clean(raw.role);
  const audience = clean(raw.audience);
  const benefit = clean(raw.benefit);
  const topics = raw.topics.split(",").map(clean).filter(Boolean).slice(0, 4);
  const proof = clean(raw.proof);
  const personal = clean(raw.personal);
  const cta = clean(raw.cta);
  const helping = audience ? `helping ${audience}${benefit ? ` ${benefit}` : ""}` : benefit ? `helping you ${benefit}` : "";

  const ideas = [
    join([sentence(join([role, helping], role && helping ? ", " : ""))]),
    join([sentence(role), topics.length ? `I post about ${list(topics)}.` : "", sentence(proof)]),
    join([helping ? cap(helping) : "", role, proof], " | "),
    join([sentence(join([role, helping], role && helping ? ", " : "")), sentence(proof), cta ? `${cap(cta)} ↓` : ""]),
    join([topics.length ? `${topics.map(cap).join(" · ")}.` : "", sentence(role), sentence(personal)]),
    join([role ? `${cap(role)} 🛠` : "", helping ? `${cap(helping)} 🚀` : "", proof ? `${cap(proof)} ✅` : ""], "\n"),
    join([audience && benefit ? `Want to ${benefit}? I share what works for ${audience}.` : "", sentence(role), cta ? `${cap(cta)} ↓` : ""]),
    join([sentence(role), topics.length ? `Writing about ${list(topics)}.` : "", sentence(personal)]),
  ];
  const seen = new Set<string>();
  return ideas.filter((b) => b && !seen.has(b) && seen.add(b)).slice(0, 8);
}
