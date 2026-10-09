/**
 * Features that exist in GrowX extension v2.3.0 (inspected from source), and the
 * PROPOSED Free / Premium split. Nothing here is enforced anywhere yet: the
 * extension currently has no accounts and no paywall. See docs/FEATURE_SPLIT.md.
 */
export type Tier = "free" | "premium";

export interface Feature {
  id: string;
  title: string;
  description: string;
  /** Proposed placement once Premium launches. */
  tier: Tier;
}

export interface FeatureGroup {
  id: string;
  title: string;
  summary: string;
  features: Feature[];
}

export const featureGroups: readonly FeatureGroup[] = [
  {
    id: "autopilot",
    title: "Autopilot follow engine",
    summary: "Follows one account at a time with randomised delays, breaks and rolling caps.",
    features: [
      {
        id: "pace-safe-balanced",
        title: "Safe and Balanced paces",
        description: "Up to about 150 and 280 follows per day, with breaks and hourly caps built in.",
        tier: "free",
      },
      {
        id: "pace-turbo",
        title: "Turbo and X Premium paces",
        description: "Higher-volume presets (about 390 and 800 per day) for aged accounts and X Premium accounts.",
        tier: "premium",
      },
      {
        id: "safety",
        title: "Safety controls",
        description: "Active hours, warm-up, adaptive slow-down after X warnings, follow verification and an Alt+Shift+S emergency stop.",
        tier: "free",
      },
      {
        id: "custom-limits",
        title: "Custom limits above Balanced",
        description: "Raise delays, hourly and daily caps beyond the Balanced preset.",
        tier: "premium",
      },
    ],
  },
  {
    id: "targeting",
    title: "Sources, queue and targeting",
    summary: "Reads the newest followers of profiles in your niche and scores each one for follow-back likelihood.",
    features: [
      {
        id: "sources-queue",
        title: "Source profiles and follow queue",
        description: "Add source accounts, review the scored queue, keep a never-follow list.",
        tier: "free",
      },
      {
        id: "basic-filters",
        title: "Core targeting filters",
        description: "Follow-back score, audience size, follow ratio, profile photo, private accounts and more.",
        tier: "free",
      },
      {
        id: "advanced-filters",
        title: "Advanced filters",
        description: "Keyword include/exclude lists, location keywords, verified-only, account age and last-active rules.",
        tier: "premium",
      },
      {
        id: "list-import",
        title: "Bulk list import",
        description: "Import a list of accounts to follow.",
        tier: "premium",
      },
    ],
  },
  {
    id: "insight",
    title: "History and analytics",
    summary: "Measures who follows back and which sources work.",
    features: [
      {
        id: "history-analytics",
        title: "Follow history, growth chart and planner",
        description: "Follow-back tracking, source performance and a monthly goal planner.",
        tier: "free",
      },
      {
        id: "backup",
        title: "Backup and restore",
        description: "Export and import your settings, sources and history as a file.",
        tier: "free",
      },
    ],
  },
  {
    id: "cleanup",
    title: "Cleanup tools",
    summary: "Finds inactive accounts and people who do not follow back.",
    features: [
      {
        id: "cleanup-scan",
        title: "Account scan and review",
        description: "Scan who you follow and who follows you, then filter, search and sort the results.",
        tier: "free",
      },
      {
        id: "cleanup-manual",
        title: "Manual selection and unfollow",
        description: "Pick accounts yourself and unfollow them at a safe pace, up to a reasonable daily amount (exact limit to be decided).",
        tier: "free",
      },
      {
        id: "cleanup-bulk",
        title: "High-volume bulk unfollow",
        description: "Select all matching accounts and run large unfollow batches with the higher Balanced pace and caps.",
        tier: "premium",
      },
    ],
  },
] as const;

export const freeFeatures = featureGroups.flatMap((g) => g.features.filter((f) => f.tier === "free"));
export const premiumFeatures = featureGroups.flatMap((g) => g.features.filter((f) => f.tier === "premium"));
