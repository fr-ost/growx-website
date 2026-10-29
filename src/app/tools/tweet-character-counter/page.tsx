import Link from "next/link";
import { CharacterCounter } from "@/components/tools/character-counter";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/tweet-character-counter";

export const metadata = pageMetadata({
  title: "Tweet Character Counter: Free X Character Count",
  description: "Free tweet character counter that counts like X (Twitter): links as 23, emoji and CJK as 2, with the 280 and 25,000 limits. By GrowX, no sign-up needed.",
  path: PATH,
  keywords: ["tweet character counter", "Twitter character counter", "X character count", "280 character counter", "tweet length checker", "character limit Twitter"],
});

const faqs = [
  { q: "What is the character limit on X (Twitter)?", a: "A standard post on X can have up to 280 characters. Accounts with an X Premium subscription can write long posts of up to 25,000 characters. Tick the long post option in the counter to check against that limit." },
  { q: "Why does my emoji count as two characters?", a: "X weighs characters: most Latin letters, numbers and punctuation count as one, while most emoji and Chinese, Japanese and Korean characters count as two. An emoji made of several parts, such as a skin tone or a family emoji, still counts as two." },
  { q: "How are links counted in a tweet?", a: "X shortens every link, so any URL counts as 23 characters no matter how long it really is. The counter does the same, which is why a very long link only uses 23 of your 280 characters." },
  { q: "Is this the same count X shows?", a: "It uses the same weighting rules as X's own counter and the GrowX composer. Rare characters can still differ slightly, so if a post is right at the limit, check it in the X composer before posting." },
  { q: "Is my text saved or sent anywhere?", a: "No. The counter runs entirely in your browser. Nothing you type is stored or sent to GrowX or anyone else." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Tweet character counter"
      title={<>Tweet character counter that <span className="text-gradient">counts like X</span></>}
      lead="Paste your post to see exactly how many of X's 280 characters it uses. Links count as 23 and most emoji as 2, just like on X."
      tool={<CharacterCounter />}
      faqs={faqs}
    >
      <h2>How X counts characters</h2>
      <p>
        X does not simply count letters. Each character has a weight: standard Latin letters, digits and common punctuation count as one, while most
        emoji and Chinese, Japanese and Korean characters count as two. Every link counts as exactly 23 characters, because X wraps links in its own
        short link. That is why a post can look short and still be over the limit, or look long and still fit.
      </p>
      <ul>
        <li><strong>280 characters</strong> for a standard post.</li>
        <li><strong>25,000 characters</strong> for long posts on accounts with X Premium.</li>
        <li><strong>23 characters</strong> for any link, however long.</li>
        <li><strong>2 characters</strong> for most emoji, including emoji with skin tones.</li>
      </ul>
      <h2>Tips for writing within the limit</h2>
      <p>
        Lead with the point. The first line is what people see in their timeline, so put the hook there and cut warm-up phrases. Replace long words
        with short ones, drop filler like &quot;really&quot; and &quot;just&quot;, and use line breaks instead of long sentences. If an idea needs more
        room, turn it into a thread rather than cramming it: our free <Link href="/tools/twitter-thread-maker">Twitter thread maker</Link> splits
        long text into numbered posts that each fit.
      </p>
      <h2>Write, count and schedule in one place</h2>
      <p>
        The GrowX Chrome extension has the same character counting built into its composer, plus thread splitting, images, 52 post templates and a
        queue that posts at your best times. See the <Link href="/features/twitter-post-scheduler">post scheduler</Link>, or read{" "}
        <Link href="/blog/how-to-write-a-twitter-thread">how to write a Twitter thread</Link> and{" "}
        <Link href="/blog/best-time-to-post-on-twitter">how to find your best time to post</Link>.
      </p>
    </ToolPage>
  );
}
