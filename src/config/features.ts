/**
 * Features of GrowX extension v2.4.4 and the Free / Premium split (from the extension's shared/plan.js and
 * docs/PRODUCT_FACTS.md). Used by /features and the pricing comparison.
 */
import type { FeatureSlug } from "@/content/feature-slugs";

export type Tier = "free" | "premium";

export interface Feature {
  id: string;
  title: string;
  description: string;
  /** Which plan includes the feature. */
  tier: Tier;
}

export interface FeatureGroup {
  id: "grow" | "create" | "ai" | "engage" | "insights" | "cleanup" | "more";
  title: string;
  summary: string;
  /** Longer, factual explanation shown on the features page. */
  detail: string[];
  /** Landing page with the full story, if any. */
  page?: FeatureSlug;
  features: Feature[];
}

export const featureGroups: readonly FeatureGroup[] = [
  {
    id: "grow",
    title: "Grow: smart auto follow",
    summary: "Follows the newest followers of accounts in your niche, the people most likely to follow you back, at a safe pace.",
    detail: [
      "Add source profiles, or press Find sources for me. GrowX reads each source's newest followers every hour and follows the most recent ones first. Everyone else is ranked by a follow-back score from 1 to 99 and must pass your filters.",
      "It runs in the background with random delays, breaks and rolling hourly and daily caps, slows down by itself after any warning from X, and stops when your account needs attention.",
    ],
    page: "twitter-auto-follow",
    features: [
      { id: "pace-free", title: "Safe and Balanced paces", description: "About 150 and 280 follows a day, with breaks and hourly caps built in.", tier: "free" },
      { id: "sources", title: "Sources, Find sources for me, recent followers first", description: "Follow the newest followers of accounts in your niche; GrowX can suggest sources for you.", tier: "free" },
      { id: "score", title: "Follow-back score and core filters", description: "A 1-99 score plus audience size, ratio, photo, activity, age and exclude-keyword filters.", tier: "free" },
      { id: "safety", title: "Safety controls", description: "Active hours, warm-up, adaptive slow-down, follow verification, following-cap guard and Alt+Shift+S stop.", tier: "free" },
      { id: "leaderboard", title: "Source leaderboard", description: "Follow-back rate, retention and cost of every source.", tier: "free" },
      { id: "fast-pace", title: "Turbo and X Premium paces", description: "About 390 a day (Turbo) or 800 a day on accounts with X Premium; custom limits above Balanced.", tier: "premium" },
      { id: "smart-score", title: "Smart score", description: "The follow-back score learns from your own results.", tier: "premium" },
      { id: "more-sources", title: "More source types", description: "A post's reposts, replies and likes, searches and #hashtags, and X Lists.", tier: "premium" },
      { id: "advanced-filters", title: "Advanced filters and list import", description: "Include, location and verified filters, account age and last-active rules; paste a list to follow first.", tier: "premium" },
      { id: "auto-replace", title: "Auto-replace weak sources", description: "Weak sources are swapped for the best auto-found ones while the autopilot runs.", tier: "premium" },
    ],
  },
  {
    id: "create",
    title: "Create: posts and threads",
    summary: "Write posts and threads with images, then post now, schedule or fill your queue slots.",
    detail: [
      "The composer counts characters the way X does, splits long text into threads and keeps drafts. Add to queue takes the next free slot; GrowX suggests your best time to post from your own posts and when your followers are active.",
      "Posting has its own safety rules: a daily cap, a minimum gap between posts and a pause on any warning from X. A post that is more than six hours late is never posted by itself.",
    ],
    page: "twitter-post-scheduler",
    features: [
      { id: "composer", title: "Posts, threads and images", description: "Up to 25 posts per thread and 4 images per post, with X's own character counting.", tier: "free" },
      { id: "schedule", title: "Schedule and queue slots", description: "Post now, pick a time or add to your queue. Up to 10 posts waiting at once.", tier: "free" },
      { id: "best-time", title: "Best time to post, calendar and drafts", description: "A weekly heat map from your own numbers, plus a calendar and drafts.", tier: "free" },
      { id: "templates", title: "52 templates", description: "Hooks, threads, lists and stories to fill in, and your own templates.", tier: "free" },
      { id: "unlimited", title: "Unlimited scheduling", description: "Keep as many posts and threads in your queue as you like.", tier: "premium" },
      { id: "evergreen", title: "Evergreen recycling", description: "Your best posts go out again every few weeks, with rotating variants.", tier: "premium" },
      { id: "auto-plug", title: "Auto-plug", description: "When a post takes off, GrowX replies to it with your call to action.", tier: "premium" },
    ],
  },
  {
    id: "ai",
    title: "GrowX AI writer",
    summary: "Ideas, rewrites, hooks, threads and reply ideas, written by AI that runs on your computer.",
    detail: [
      "GrowX AI uses the AI model built into Chrome. It is private, free to run and needs no API key: your drafts are never sent to GrowX. It writes in your voice and niche from Settings, and uses {placeholders} instead of inventing facts.",
      "When the model isn't available on a computer, the AI buttons fall back to templates and the plain thread splitter, so GrowX never depends on it.",
    ],
    page: "ai-tweet-writer",
    features: [
      { id: "ai-write", title: "Write, Improve, Hooks and Thread it", description: "Turn an idea or notes into posts and threads, sharpen a draft or get stronger openings.", tier: "premium" },
      { id: "ai-replies", title: "Reply ideas and weekly summary", description: "Suggested replies on the Engage page and a written summary of your week.", tier: "premium" },
    ],
  },
  {
    id: "engage",
    title: "Engage: reply targets and people",
    summary: "Fresh posts from the accounts you care about, ranked so you can reply early when replies are seen most.",
    detail: [
      "Reply targets collects new posts from your sources, VIPs and anyone you add, ranked by how fresh they are and how fast they take off. Reply and like from GrowX: nothing is ever sent unless you press the button.",
    ],
    page: "twitter-reply-targets",
    features: [
      { id: "targets", title: "Reply targets", description: "Fresh posts to reply to, with reply and like buttons.", tier: "free" },
      { id: "people", title: "People list", description: "Tags, notes, VIPs, mutuals and fans you don't follow back yet.", tier: "free" },
      { id: "vip-alerts", title: "VIP alerts", description: "A notification the moment someone on your VIP list posts.", tier: "premium" },
    ],
  },
  {
    id: "insights",
    title: "Insights: analytics and followers",
    summary: "Every post's numbers, your best time to post, what works, and who followed or unfollowed you.",
    detail: [
      "GrowX reads your recent posts' views, likes, reposts, replies and bookmarks through an x.com tab that is already open, every three hours. Once a day it compares your full follower list to show who followed and who unfollowed you.",
    ],
    page: "twitter-analytics",
    features: [
      { id: "post-analytics", title: "Post analytics", description: "Views, likes, reposts, replies, bookmarks and engagement rate for your latest 30 posts.", tier: "free" },
      { id: "what-works", title: "Topics and formats that work", description: "Questions, images, text, threads and links compared by engagement.", tier: "free" },
      { id: "tracker", title: "Unfollower tracker", description: "Who followed and who unfollowed you, with 7 days of history.", tier: "free" },
      { id: "goals", title: "Goals, streaks and milestones", description: "Daily goals for posts, replies and new followers, plus a growth chart.", tier: "free" },
      { id: "full-analytics", title: "Full analytics and weekly report", description: "Every post's numbers over time, which posts brought followers and a weekly report.", tier: "premium" },
      { id: "full-tracker", title: "Full follower history and quality", description: "Unlimited history, one-click unfollow back, and real / inactive / likely bot analysis.", tier: "premium" },
    ],
  },
  {
    id: "cleanup",
    title: "Cleanup: unfollow tool",
    summary: "Find accounts that don't follow you back or went quiet, review them, then unfollow at a safe pace.",
    detail: [
      "The scan reads who you follow and your followers, then sorts accounts into not following back and inactive (no post in 30, 90, 180 or 365 days). Unknown activity is never called inactive, and partial scans are marked unverified.",
      "You choose who to unfollow. Each account is checked with X right before it is unfollowed, at a safe pace with rolling caps.",
    ],
    page: "twitter-unfollow-tool",
    features: [
      { id: "scan", title: "Cleanup scan and review", description: "Not following back and inactive accounts, with search, filters and sorting.", tier: "free" },
      { id: "manual", title: "Safe unfollow runs", description: "Up to 200 per run at the Safe pace (30 an hour, 200 a day).", tier: "free" },
      { id: "bulk", title: "Bulk unfollow and Balanced pace", description: "Select all and unfollow up to 5,000 in one run, up to 45 an hour and 320 a day.", tier: "premium" },
      { id: "auto-clean", title: "Automatic cleanup", description: "Unfollows GrowX's own follows that didn't follow back after 2, 5 or 7 days.", tier: "premium" },
    ],
  },
  {
    id: "more",
    title: "Everything else",
    summary: "The little things that make GrowX pleasant to use every day.",
    detail: [
      "A setup wizard, 8 colour themes and dark mode, a command palette (Ctrl+K), phone and tablet layouts, a quick post box in the popup, backup and restore, and optional sync of your settings through Chrome.",
    ],
    features: [
      { id: "ux", title: "Themes, dark mode and Ctrl+K", description: "8 colour themes, dark mode, density and font options and a command palette.", tier: "free" },
      { id: "sync", title: "Backup, restore and Chrome sync", description: "Export a backup file, or sync settings, sources and templates through Chrome.", tier: "free" },
      { id: "workspaces", title: "Multiple X accounts", description: "A separate workspace (sources, queue and posts) for every X account you use.", tier: "premium" },
    ],
  },
] as const;

export const freeFeatures = featureGroups.flatMap((g) => g.features.filter((f) => f.tier === "free"));
export const premiumFeatures = featureGroups.flatMap((g) => g.features.filter((f) => f.tier === "premium"));
