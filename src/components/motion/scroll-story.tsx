import type { CSSProperties, ReactNode } from "react";

export type StoryStep = { key: string; content: ReactNode; visual: ReactNode; inlineVisual: ReactNode; pops?: ReactNode };

/** csstype may not know these yet. */
type TimelineStyle = CSSProperties & { viewTimelineName?: string; animationTimeline?: string };
const tl = (i: number): string => `--story-${i}`;

/**
 * CSS-only sticky scroll story. Enhanced mode (>= 1024px, motion allowed, timeline-scope supported):
 * >= 80vh steps on the left, a sticky stage on the right whose slots cross-fade as each step
 * crosses the viewport centre, a segmented rail and springy pops. Everywhere else: alternating
 * rows with inline visuals. CSS picks the mode before first paint (no layout change on hydration).
 * Put reveals on each step's children, never on the step itself. No headings in visuals/pops.
 * `caption` shows under the sticky stage in enhanced mode and after the steps in rows mode
 * (pass rowsCaption={false} when each inlineVisual already carries its own caption).
 */
export function ScrollStory({
  steps,
  aspect = "960 / 560",
  caption,
  rowsCaption = true,
  className = "",
}: {
  steps: StoryStep[];
  aspect?: string;
  caption?: ReactNode;
  rowsCaption?: boolean;
  className?: string;
}) {
  if (process.env.NODE_ENV !== "production" && (steps.length < 2 || steps.length > 6)) {
    throw new Error(`ScrollStory needs 2-6 steps, got ${steps.length}.`);
  }
  return (
    <div className={`story ${className}`}>
      <div className="story__steps">
        {steps.map((s, i) => (
          <article key={s.key} className="story__step" style={{ viewTimelineName: tl(i) } as TimelineStyle}>
            <div className="story__copy">{s.content}</div>
            <div className="story__inline">{s.inlineVisual}</div>
          </article>
        ))}
        {caption && rowsCaption ? <p className="story__rows-caption -mt-14 text-xs text-muted">{caption}</p> : null}
      </div>
      <div className="story__stage">
        <ol aria-hidden="true" className="mb-4 flex gap-1.5">
          {steps.map((s, i) => (
            <li key={s.key} className="relative h-1 flex-1 overflow-clip rounded-full bg-hairline-strong">
              <span className="story__rail-fill absolute inset-0 rounded-full bg-accent" style={{ animationTimeline: tl(i) } as TimelineStyle} />
            </li>
          ))}
        </ol>
        <div className="relative w-full" style={{ aspectRatio: aspect }}>
          {steps.map((s, i) => (
            <div key={s.key} className="story__slot" style={{ animationTimeline: tl(i) } as TimelineStyle}>
              {s.visual}
              {s.pops ? (
                <div aria-hidden="true" className="story__pop pointer-events-none absolute inset-0" style={{ animationTimeline: tl(i) } as TimelineStyle}>
                  {s.pops}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {caption ? <p className="mt-3 text-xs text-muted">{caption}</p> : null}
      </div>
    </div>
  );
}
