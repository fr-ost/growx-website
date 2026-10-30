import type { ReactNode } from "react";
import type { FeatureSlug } from "@/content/feature-slugs";
import { DemoAiDraft } from "./ai-draft";
import { DemoCleanup } from "./cleanup";
import { DemoFollowQueue } from "./follow-queue";
import { DemoFollowerDiff } from "./follower-diff";
import type { DemoProps } from "./frame";
import { DemoHeatmap } from "./heatmap";
import { DemoPalette } from "./palette";
import { DemoQueueSlots } from "./queue-slots";
import { DemoReplyTargets } from "./reply-targets";

/** The only module that imports every demo. Feature pages only. */
export function demoForFeature(slug: FeatureSlug, props: DemoProps = {}): ReactNode {
  switch (slug) {
    case "twitter-auto-follow":
      return <DemoFollowQueue {...props} />;
    case "twitter-post-scheduler":
      return <DemoQueueSlots {...props} />;
    case "ai-tweet-writer":
      return <DemoAiDraft {...props} />;
    case "twitter-analytics":
      return <DemoHeatmap {...props} />;
    case "twitter-unfollower-tracker":
      return <DemoFollowerDiff {...props} />;
    case "twitter-unfollow-tool":
      return <DemoCleanup {...props} />;
    case "twitter-reply-targets":
      return <DemoReplyTargets {...props} />;
  }
}

export type DemoGroup = "grow" | "create" | "ai" | "engage" | "insights" | "cleanup" | "more";

export function demoForGroup(id: DemoGroup, props: DemoProps = {}): ReactNode {
  switch (id) {
    case "grow":
      return <DemoFollowQueue {...props} />;
    case "create":
      return <DemoQueueSlots {...props} />;
    case "ai":
      return <DemoAiDraft {...props} />;
    case "engage":
      return <DemoReplyTargets {...props} />;
    case "insights":
      return <DemoHeatmap {...props} />;
    case "cleanup":
      return <DemoCleanup {...props} />;
    case "more":
      return <DemoPalette {...props} />;
  }
}
