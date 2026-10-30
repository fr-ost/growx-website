import Link from "next/link";
import { TemplateLibrary } from "@/components/tools/template-library";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/tweet-templates";

export const metadata = pageMetadata({
  title: "52 Tweet Templates: Free Fill-In Templates for X",
  description: "52 free tweet templates for X (Twitter): hooks, threads, lists, stories, questions, build in public and replies. Fill in the blanks and copy. By GrowX.",
  path: PATH,
  keywords: ["tweet templates", "Twitter templates", "X post templates", "thread templates", "tweet hooks", "build in public templates", "Twitter content templates"],
});

const faqs = [
  { q: "How do I use these tweet templates?", a: "Pick a template, press Fill in, and type your own words into each field. The finished post updates as you type, with X's character count for every part. Copy it when every field is filled." },
  { q: "What does --- mean in a template?", a: "A line with three dashes marks the start of the next post in a thread. The fill-in view shows each post separately and counts its characters." },
  { q: "Will templates make my posts sound generic?", a: "Only if you leave them generic. Use a template as structure, then add your own example, numbers you are comfortable sharing and your voice." },
  { q: "Can I schedule posts made from these templates?", a: "Yes. The same 52 templates are built into the GrowX Chrome extension's composer, which can post now, schedule or add the post to your queue slots." },
  { q: "Are the templates free to use?", a: "Yes. Copy and adapt them for your own posts. Nothing you type is stored or sent anywhere." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Tweet templates"
      title={<>52 free <span className="text-gradient">tweet templates</span></>}
      lead="Proven formats for hooks, threads, lists, stories, questions, build in public and replies. Pick one, fill in the blanks and copy."
      tool={<TemplateLibrary />}
      faqs={faqs}
    >
      <h2>Why templates work</h2>
      <p>
        Most posts that get read share a few structures: a hook that makes a promise, a list that is easy to save, a story with a turning point, a
        question that invites replies. Templates give you that structure, so you can spend your energy on the part only you can add: the insight.
      </p>
      <h2>Which template to use when</h2>
      <ul>
        <li><strong>Hooks</strong> for the first line of any post or thread.</li>
        <li><strong>Threads and lists</strong> for teaching something step by step.</li>
        <li><strong>Stories and lessons</strong> to build trust and a personal brand.</li>
        <li><strong>Questions</strong> to start conversations and earn replies.</li>
        <li><strong>Build in public</strong> for progress updates and launches.</li>
        <li><strong>Replies</strong> as starters when you reply to bigger accounts.</li>
      </ul>
      <h2>Go further</h2>
      <p>
        Need ideas, not just structure? See our <Link href="/blog/tweet-ideas">60 tweet ideas</Link> and{" "}
        <Link href="/blog/how-to-write-a-twitter-thread">how to write a Twitter thread</Link>. In the GrowX extension, these templates sit next to the{" "}
        <Link href="/features/ai-tweet-writer">GrowX AI writer</Link> and the <Link href="/features/twitter-post-scheduler">post scheduler</Link>.
      </p>
    </ToolPage>
  );
}
