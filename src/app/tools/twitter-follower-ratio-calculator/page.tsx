import Link from "next/link";
import { RatioCalculator } from "@/components/tools/ratio-calculator";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/twitter-follower-ratio-calculator";

export const metadata = pageMetadata({
  title: "Twitter Follower Ratio Calculator & Follow Limit",
  description: "Free Twitter follower ratio calculator: see your followers-to-following ratio and how close you are to X's 5,000 follow limit. By GrowX, no sign-up.",
  path: PATH,
  keywords: ["Twitter follower ratio calculator", "following to followers ratio", "Twitter follow limit 5000", "X follow limit", "Twitter ratio", "follow ratio"],
});

const faqs = [
  { q: "What is the following limit on X (Twitter)?", a: "Everyone can follow up to 5,000 accounts. Beyond that, X ties how many accounts you can follow to how many people follow you. X does not publish the exact formula; this calculator uses GrowX's working estimate of about 10% above your follower count." },
  { q: "What is a good follower ratio?", a: "There is no official number. A profile that follows far more people than follow it can look like a follow-for-follow account, while a ratio near or above one usually reads as more credible. What matters most is that the people you follow and who follow you are real and relevant." },
  { q: "How do I improve my ratio?", a: "Follow fewer, better-targeted accounts, post content that earns follows on its own, and regularly unfollow accounts that never followed back or have gone inactive, at a safe pace." },
  { q: "Why can't I follow more people?", a: "You may have hit the following limit for your follower count, or a daily follow limit after following many accounts quickly. Wait, grow your followers, and clean up your following list." },
  { q: "Is my data saved?", a: "No. The calculator runs in your browser and nothing you enter is stored or sent anywhere." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Twitter follower ratio calculator"
      title={<>Twitter follower ratio <span className="text-gradient">calculator</span></>}
      lead="Enter your followers and following to see your ratio, your estimated following cap and how many more accounts you can follow on X."
      tool={<RatioCalculator />}
      faqs={faqs}
    >
      <h2 className="h-rule">Why your follower ratio matters</h2>
      <p>
        Your ratio is one of the first things people notice on your profile. A healthy balance between followers and following makes an account look
        credible, and it keeps room under X&apos;s following limit so you can keep following new, relevant people. Read our full guide to the{" "}
        <Link href="/blog/twitter-follower-ratio">Twitter follower ratio</Link>.
      </p>
      <h2 className="h-rule">How the following cap works</h2>
      <ul>
        <li>Up to <strong>5,000</strong> following: open to everyone.</li>
        <li>Above 5,000: the limit grows with your followers. X does not publish the exact rule; GrowX estimates it at about <strong>10% above your follower count</strong>.</li>
        <li>Separately, X limits how many accounts you can follow per day, and following in bursts can trigger temporary limits.</li>
      </ul>
      <h2 className="h-rule">Improve your ratio with GrowX</h2>
      <p>
        GrowX&apos;s <Link href="/features/twitter-unfollow-tool">unfollow tool</Link> finds accounts that don&apos;t follow you back or went quiet so
        you can review and unfollow them at a safe pace, and its <Link href="/features/twitter-auto-follow">smart auto follow</Link> targets people
        likely to follow back, with a cap guard that pauses at your following limit instead of hammering it.
      </p>
    </ToolPage>
  );
}
