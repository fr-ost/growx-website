import Link from "next/link";
import { EngagementCalculator } from "@/components/tools/engagement-calculator";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/twitter-engagement-rate-calculator";

export const metadata = pageMetadata({
  title: "Twitter Engagement Rate Calculator (Free)",
  description: "Free Twitter engagement rate calculator: enter a post's views, likes, reposts, replies and bookmarks to get its engagement rate on X. By GrowX, no sign-up.",
  path: PATH,
  keywords: ["Twitter engagement rate calculator", "X engagement rate", "engagement rate calculator", "tweet engagement rate", "how to calculate engagement rate on Twitter"],
});

const faqs = [
  { q: "How is engagement rate calculated on Twitter?", a: "Add up a post's interactions (likes, reposts, replies, bookmarks and, if you like, quotes) and divide by its views, then multiply by 100. A post with 50 interactions and 2,000 views has an engagement rate of 2.5%." },
  { q: "Should I divide by views or by followers?", a: "By views when you have them: it measures how the people who actually saw the post reacted. Dividing by followers is a fallback when views are unknown, but it mixes reach and reaction, because many viewers are not followers." },
  { q: "What is a good engagement rate on X?", a: "It depends on your niche, account size and the type of post, so a single benchmark is misleading. Compare your own posts with each other: the formats and topics with a higher rate than your usual are the ones to repeat." },
  { q: "Where do I find a post's views and interactions?", a: "Open the post on x.com and look at the numbers under it, or its analytics view. The GrowX Chrome extension also collects views, likes, reposts, replies and bookmarks for your recent posts and works out the rate for you." },
  { q: "Is my data saved?", a: "No. The calculator runs in your browser and nothing you enter is stored or sent anywhere." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Twitter engagement rate calculator"
      title={<>Twitter engagement rate <span className="text-gradient">calculator</span></>}
      lead="Find out how well a post landed with the people who saw it. Enter the numbers from X and get the engagement rate per view and per follower."
      tool={<EngagementCalculator />}
      faqs={faqs}
    >
      <h2>What engagement rate tells you</h2>
      <p>
        Raw likes reward reach: a post that was shown to more people collects more likes even if fewer of them cared. Engagement rate removes that
        bias by dividing interactions by views. That makes it the fairest way to compare your own posts and learn which topics, formats and hooks
        your audience actually responds to.
      </p>
      <ul>
        <li><strong>Engagement rate per view</strong> = (likes + reposts + replies + bookmarks + quotes) / views x 100.</li>
        <li><strong>Engagement rate per follower</strong> = the same interactions / your followers x 100, useful when views are missing.</li>
      </ul>
      <h2>How to raise your engagement rate</h2>
      <p>
        Lead with a clear hook, write for replies (ask a real question, take a position), use images and threads where they fit, and post when
        your followers are online. Then measure: repeat what beats your usual rate and drop what does not. Our guides on{" "}
        <Link href="/blog/how-to-increase-twitter-engagement">how to increase Twitter engagement</Link> and{" "}
        <Link href="/blog/twitter-analytics-guide">reading Twitter analytics</Link> go deeper.
      </p>
      <h2>Let GrowX track it for every post</h2>
      <p>
        The GrowX Chrome extension reads your recent posts&apos; views, likes, reposts, replies and bookmarks, shows the engagement rate of each,
        ranks your topics and formats and builds a best-time-to-post heat map from your own numbers. See{" "}
        <Link href="/features/twitter-analytics">GrowX analytics</Link>.
      </p>
    </ToolPage>
  );
}
