import Link from "next/link";
import { BoldTextGenerator } from "@/components/tools/bold-text";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/twitter-bold-text-generator";

export const metadata = pageMetadata({
  title: "Twitter Bold Text Generator: Bold & Italic for X",
  description: "Free Twitter bold text generator: turn text into bold, italic, script and more for X posts and bios, then copy it. By GrowX, works in your browser, no sign-up.",
  path: PATH,
  keywords: ["Twitter bold text generator", "bold text for Twitter", "italic text Twitter", "X bold text", "Twitter font generator", "fancy text for Twitter bio"],
});

const faqs = [
  { q: "Can you write in bold on Twitter (X)?", a: "X has no bold button for normal posts. This generator uses special Unicode letters that look bold or italic, so they show up styled wherever you paste them, including posts, replies and your bio." },
  { q: "Why does bold text use more characters?", a: "The styled letters are separate Unicode characters that X counts as two each. A 10-letter bold word uses 20 of your 280 characters, so use it for a few words, not whole posts." },
  { q: "Is bold Unicode text bad for accessibility?", a: "It can be. Screen readers may read the letters one by one, use odd names or skip them, and the text is harder to search. Keep styled text short and never use it for important information." },
  { q: "Will bold text hurt my reach?", a: "There is no published rule about it, but styled letters are not normal words, so they may not match searches. Use them for emphasis, and keep the main message in plain text." },
  { q: "Is my text saved?", a: "No. Everything happens in your browser and nothing you type is stored or sent anywhere." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Twitter bold text generator"
      title={<>Twitter bold text <span className="text-gradient">generator</span></>}
      lead="Type your text and copy it in bold, italic, script, monospace and more. Works for X posts, replies and your bio."
      tool={<BoldTextGenerator />}
      faqs={faqs}
    >
      <h2 className="h-rule">How it works</h2>
      <p>
        Unicode includes complete alphabets that look bold, italic or decorative. They were made for maths, but because they are real characters,
        they keep their look when you paste them into X, where normal formatting is not available. The generator swaps each letter (and number,
        where a styled version exists) for its styled twin. Letters with accents, emoji and punctuation stay as they are.
      </p>
      <h2 className="h-rule">Use it sparingly</h2>
      <ul>
        <li>Styled letters count as <strong>two characters</strong> each on X; check your length with our <Link href="/tools/tweet-character-counter">tweet character counter</Link>.</li>
        <li>Screen readers may not read them properly, so keep them to a word or two.</li>
        <li>They may not match searches, so keep keywords and names in plain text.</li>
      </ul>
      <h2 className="h-rule">Make the words count</h2>
      <p>
        Formatting draws the eye; the words do the work. For posts that get read and shared, see our <Link href="/blog/tweet-ideas">tweet ideas</Link>{" "}
        and <Link href="/blog/twitter-bio-ideas">Twitter bio ideas</Link>, or let the <Link href="/features/ai-tweet-writer">GrowX AI writer</Link>{" "}
        suggest hooks and rewrites on your own computer.
      </p>
    </ToolPage>
  );
}
