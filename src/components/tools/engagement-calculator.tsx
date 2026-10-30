"use client";

import { useMemo, useState } from "react";
import { BorderBeam } from "@/components/motion/border-beam";
import { NumberField, Stat, fmtNum, fmtPct, parseCount } from "@/components/tools/ui";
import { engagementRateByFollowers, engagementRateByViews, totalInteractions } from "@/lib/x-math";

export function EngagementCalculator() {
  const [v, setV] = useState({ views: "", likes: "", reposts: "", replies: "", bookmarks: "", quotes: "", followers: "" });
  const set = (k: keyof typeof v) => (x: string) => setV((s) => ({ ...s, [k]: x }));
  const r = useMemo(() => {
    const i = { likes: parseCount(v.likes), reposts: parseCount(v.reposts), replies: parseCount(v.replies), bookmarks: parseCount(v.bookmarks), quotes: parseCount(v.quotes) };
    return { total: totalInteractions(i), byViews: engagementRateByViews(i, parseCount(v.views)), byFollowers: engagementRateByFollowers(i, parseCount(v.followers)) };
  }, [v]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="group relative rounded-3xl bg-white p-5 shadow-float ring-1 ring-hairline sm:p-7">
        <BorderBeam mode="focus" />
        <p className="text-sm text-text-2">Copy the numbers from a post&apos;s analytics on X. Write 1.2k or 1,200 as you like.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <NumberField id="er-views" label="Views (impressions)" value={v.views} onChange={set("views")} />
          <NumberField id="er-followers" label="Your followers (optional)" value={v.followers} onChange={set("followers")} />
          <NumberField id="er-likes" label="Likes" value={v.likes} onChange={set("likes")} />
          <NumberField id="er-reposts" label="Reposts" value={v.reposts} onChange={set("reposts")} />
          <NumberField id="er-replies" label="Replies" value={v.replies} onChange={set("replies")} />
          <NumberField id="er-bookmarks" label="Bookmarks" value={v.bookmarks} onChange={set("bookmarks")} />
          <NumberField id="er-quotes" label="Quotes (optional)" value={v.quotes} onChange={set("quotes")} />
        </div>
      </div>
      <div className="space-y-4" aria-live="polite">
        <Stat tone="accent" label="Engagement rate (per view)" value={fmtPct(r.byViews)} sub={r.byViews === null ? "Enter the views to see the rate" : `${fmtNum(r.total)} interactions per ${fmtNum(parseCount(v.views))} views`} />
        <Stat label="Engagement rate (per follower)" value={fmtPct(r.byFollowers)} sub={r.byFollowers === null ? "Optional: enter your followers" : "Interactions divided by your followers"} />
        <Stat label="Total interactions" value={fmtNum(r.total)} sub="Likes + reposts + replies + bookmarks + quotes" />
      </div>
    </div>
  );
}
