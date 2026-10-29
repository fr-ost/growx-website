import type { FeatureIcon } from "@/content/feature-types";
import type { FeatureSlug } from "@/content/feature-slugs";

/** The feature menu (header, footer, home). Kept small so the client header stays light. */
export const featureNav: { slug: FeatureSlug; label: string; blurb: string; icon: FeatureIcon }[] = [
  { slug: "twitter-auto-follow", label: "Smart auto follow", blurb: "Follow people likely to follow back, at a safe pace", icon: "target" },
  { slug: "twitter-post-scheduler", label: "Post scheduler", blurb: "Queue posts and threads for your best times", icon: "calendar" },
  { slug: "ai-tweet-writer", label: "GrowX AI writer", blurb: "Ideas, hooks and threads, written on your computer", icon: "wand" },
  { slug: "twitter-analytics", label: "Analytics", blurb: "Every post's numbers and your best time to post", icon: "chart" },
  { slug: "twitter-unfollower-tracker", label: "Unfollower tracker", blurb: "See who followed and who unfollowed you", icon: "users" },
  { slug: "twitter-unfollow-tool", label: "Unfollow tool", blurb: "Clean up non-followers and inactive accounts", icon: "userX" },
  { slug: "twitter-reply-targets", label: "Reply targets", blurb: "Fresh posts in your niche, ranked to reply early", icon: "message" },
];

export const toolNav = [
  { href: "/tools/tweet-character-counter", label: "Tweet character counter", blurb: "Count characters the way X does" },
  { href: "/tools/twitter-thread-maker", label: "Twitter thread maker", blurb: "Split long text into a numbered thread" },
  { href: "/tools/twitter-engagement-rate-calculator", label: "Engagement rate calculator", blurb: "How well a post landed with its viewers" },
  { href: "/tools/twitter-follower-ratio-calculator", label: "Follower ratio calculator", blurb: "Your ratio and X's 5,000 follow limit" },
  { href: "/tools/twitter-bold-text-generator", label: "Bold text generator", blurb: "Bold and italic letters for posts and bios" },
] as const;
