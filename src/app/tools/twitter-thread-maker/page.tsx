import Link from "next/link";
import { ThreadMaker } from "@/components/tools/thread-maker";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/twitter-thread-maker";

export const metadata = pageMetadata({
  title: "Twitter Thread Maker: Split Text Into a Thread",
  description: "Free Twitter thread maker: paste long text and split it into numbered X posts that each fit 280 characters, at natural breaks. By GrowX, no sign-up needed.",
  path: PATH,
  keywords: ["Twitter thread maker", "thread maker", "X thread generator", "split text into tweets", "tweet splitter", "thread splitter"],
});

const faqs = [
  { q: "How does the thread maker split my text?", a: "It fills each post with as much text as fits within 280 characters, cutting at the best natural break it can find: a blank line, then a line break, then the end of a sentence, then a comma, then a space. A line with just --- always starts a new post." },
  { q: "Can I choose where a new post starts?", a: "Yes. Put a line containing only --- (three dashes) wherever you want the next post to begin. Everything between two such lines stays together if it fits." },
  { q: "What does numbering do?", a: "With numbering on, each post ends with its position, such as 1/5. Room for the number is kept, so numbered posts still fit within the limit." },
  { q: "How long can a thread be?", a: "The thread maker creates up to 25 posts, the same as the GrowX composer. For longer pieces, consider splitting the topic into two threads." },
  { q: "Can I post the thread straight to X?", a: "Copy each post into X yourself, or use the GrowX Chrome extension, which can post a whole thread now or schedule it, with every part posted as a reply to the one before." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Twitter thread maker"
      title={<>Twitter thread maker: <span className="text-gradient">long text to thread</span></>}
      lead="Paste a draft, an article or your notes. The thread maker splits it into numbered X posts that each fit 280 characters, at natural breaks."
      tool={<ThreadMaker />}
      faqs={faqs}
    >
      <h2 className="h-rule">How to use the thread maker</h2>
      <ul>
        <li>Paste or write your text in the box. The thread appears on the right as you type.</li>
        <li>Add a line with just <code>---</code> wherever you want a new post to start.</li>
        <li>Keep numbering on to add 1/n to each post, or turn it off for a cleaner look.</li>
        <li>Copy posts one by one, or copy the whole thread at once.</li>
      </ul>
      <h2 className="h-rule">What makes a good Twitter thread</h2>
      <p>
        The first post does most of the work: it has to make people want to read the rest. Promise something specific, like a result, a list or a
        lesson. Keep each following post to one idea, so it reads well on its own when someone quotes or reposts it. End with a short summary and an
        invitation to follow you or repost the first post. Read our full guide on{" "}
        <Link href="/blog/how-to-write-a-twitter-thread">how to write a Twitter thread</Link> for hooks and structures that work.
      </p>
      <h2 className="h-rule">Characters are counted the way X counts them</h2>
      <p>
        The thread maker uses the same weighting as X and our <Link href="/tools/tweet-character-counter">tweet character counter</Link>: links count
        as 23 characters and most emoji as 2, so every post really fits.
      </p>
      <h2 className="h-rule">Schedule your thread with GrowX</h2>
      <p>
        The GrowX Chrome extension has this splitter built in (the &quot;Thread it&quot; button), plus images, 52 templates, the GrowX AI writer and a
        queue that posts your thread at your best time, each part as a reply to the one before. See the{" "}
        <Link href="/features/twitter-post-scheduler">post scheduler</Link> and the <Link href="/features/ai-tweet-writer">AI writer</Link>.
      </p>
    </ToolPage>
  );
}
