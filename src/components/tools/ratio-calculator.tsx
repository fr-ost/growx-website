"use client";

import { useMemo, useState } from "react";
import { NumberField, Stat, fmtNum, parseCount } from "@/components/tools/ui";
import { BASE_FOLLOWING_CAP, followersNeededFor, ratioReport } from "@/lib/x-math";

const fmtRatio = (v: number | null) => (v === null ? "-" : v >= 100 ? v.toFixed(0) : v.toFixed(2));

export function RatioCalculator() {
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");
  const [target, setTarget] = useState("");
  const r = useMemo(() => ratioReport(parseCount(followers), parseCount(following)), [followers, following]);
  const need = followersNeededFor(parseCount(target));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4 rounded-3xl border border-border bg-white p-5 shadow-[var(--shadow-lift)] sm:p-7">
        <NumberField id="fr-followers" label="Followers" value={followers} onChange={setFollowers} />
        <NumberField id="fr-following" label="Following" value={following} onChange={setFollowing} />
        <NumberField id="fr-target" label="How many accounts do you want to follow? (optional)" value={target} onChange={setTarget} />
      </div>
      <div className="grid content-start gap-4 sm:grid-cols-2" aria-live="polite">
        <Stat tone="accent" label="Followers per following" value={fmtRatio(r.followerRatio)} sub={r.followerRatio === null ? "Enter both numbers" : r.followerRatio >= 1 ? "More people follow you than you follow" : "You follow more people than follow you"} />
        <Stat label="Following per follower" value={fmtRatio(r.followRatio)} sub="The ratio GrowX calls the follow ratio" />
        <Stat label="Estimated following cap" value={fmtNum(r.cap)} sub={r.cap === BASE_FOLLOWING_CAP ? "Everyone can follow 5,000" : "About 10% above your followers"} />
        <Stat label="Room left to follow" value={fmtNum(r.roomLeft)} sub="Before the estimated cap" />
        {parseCount(target) > 0 ? (
          <div className="sm:col-span-2">
            <Stat label={`Followers needed to follow ${fmtNum(parseCount(target))}`} value={need ? fmtNum(need) : "None"} sub={need ? "By the same estimate. X does not publish the exact formula." : "Up to 5,000 needs no particular follower count."} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
