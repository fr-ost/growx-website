/** Small, pure calculations behind the free X (Twitter) tools. */

export interface Interactions {
  likes: number;
  reposts: number;
  replies: number;
  bookmarks: number;
  quotes?: number;
}

const n = (v: number | undefined) => (Number.isFinite(v) && (v as number) > 0 ? (v as number) : 0);

export const totalInteractions = (i: Interactions) => n(i.likes) + n(i.reposts) + n(i.replies) + n(i.bookmarks) + n(i.quotes);

/** Interactions per view, in percent (null when there are no views). Same definition as GrowX Insights. */
export function engagementRateByViews(i: Interactions, views: number): number | null {
  return n(views) ? (totalInteractions(i) / n(views)) * 100 : null;
}

/** Interactions per follower, in percent (null without followers). Useful when views are unknown. */
export function engagementRateByFollowers(i: Interactions, followers: number): number | null {
  return n(followers) ? (totalInteractions(i) / n(followers)) * 100 : null;
}

/** Everyone can follow 5,000 accounts on X. */
export const BASE_FOLLOWING_CAP = 5000;

/**
 * Estimated following cap. X lets everyone follow 5,000 accounts and then ties the limit to the follower count; it
 * does not publish the formula. GrowX's cap guard estimates it as about 10% above the follower count.
 */
export const estimatedFollowingCap = (followers: number) => Math.max(BASE_FOLLOWING_CAP, Math.floor(n(followers) * 1.1));

/** Followers needed (by the same estimate) before you can follow `target` accounts. */
export const followersNeededFor = (target: number) => (n(target) <= BASE_FOLLOWING_CAP ? 0 : Math.ceil(n(target) / 1.1));

export interface RatioReport {
  /** following / followers (GrowX's "follow ratio"); null without followers. */
  followRatio: number | null;
  /** followers / following; null when you follow nobody. */
  followerRatio: number | null;
  cap: number;
  /** How many more accounts you could follow before the estimated cap (never negative). */
  roomLeft: number;
}

export function ratioReport(followers: number, following: number): RatioReport {
  const f = n(followers);
  const g = n(following);
  const cap = estimatedFollowingCap(f);
  return { followRatio: f ? g / f : null, followerRatio: g ? f / g : null, cap, roomLeft: Math.max(0, cap - g) };
}

/** "1,200" -> 1200, "1.2k" -> 1200, "3m" -> 3000000; anything else -> 0. */
export function parseCount(v: string): number {
  const m = v.trim().toLowerCase().replace(/[, _]/g, "").match(/^(\d+(?:\.\d+)?)([km]?)$/);
  if (!m) return 0;
  return Math.round(Number(m[1]) * (m[2] === "k" ? 1e3 : m[2] === "m" ? 1e6 : 1));
}
