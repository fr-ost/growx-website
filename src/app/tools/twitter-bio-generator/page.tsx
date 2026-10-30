import Link from "next/link";
import { BioGenerator } from "@/components/tools/bio-generator";
import { ToolPage } from "@/components/tools/tool-page";
import { pageMetadata } from "@/lib/seo";

const PATH = "/tools/twitter-bio-generator";

export const metadata = pageMetadata({
  title: "Twitter Bio Generator: Free X Bio Ideas",
  description: "Free Twitter bio generator: enter what you do, who you help and your topics to get X bio ideas that fit 160 characters. By GrowX, no sign-up needed.",
  path: PATH,
  keywords: ["Twitter bio generator", "X bio generator", "Twitter bio ideas", "bio for Twitter", "Twitter bio examples", "free bio generator"],
});

const faqs = [
  { q: "How long can a Twitter bio be?", a: "An X (Twitter) bio can be up to 160 characters. The generator shows the length of every idea; some emoji may count as more than one character on X, so check the final version in your profile editor." },
  { q: "What should a good Twitter bio include?", a: "Who you are or what you do, who you help or what you post about, a reason to trust you, and optionally a call to action pointing to your link. Clear beats clever." },
  { q: "Does this generator use AI?", a: "No. It builds bios from proven formulas and the words you type, right in your browser. Nothing is sent anywhere, so you can try as many versions as you like." },
  { q: "Should I use emoji in my bio?", a: "A few can help structure a bio and add personality, but too many make it hard to read and harder for screen readers. One or two is usually enough." },
  { q: "How often should I update my bio?", a: "Whenever your focus, offer or proof changes. A bio that matches what you post today converts more profile visitors into followers." },
];

export default function Page() {
  return (
    <ToolPage
      path={PATH}
      name="Twitter bio generator"
      title={<>Twitter bio <span className="text-gradient">generator</span></>}
      lead="Tell it what you do, who you help and what you post about. Get several X bio ideas that fit 160 characters, then copy your favourite."
      tool={<BioGenerator />}
      faqs={faqs}
    >
      <h2>A simple formula for a bio that gets follows</h2>
      <p>
        People decide in seconds whether to follow you. The bio answers three questions: what do you do, what will I get if I follow, and why should I
        believe you. The generator combines your answers in several proven patterns so you can pick the one that sounds most like you, then edit it.
      </p>
      <ul>
        <li><strong>Role:</strong> what you do, in plain words.</li>
        <li><strong>Audience and benefit:</strong> who you help and with what.</li>
        <li><strong>Topics:</strong> what you post about, so the right people follow.</li>
        <li><strong>Proof:</strong> something that earns trust, if you have it.</li>
        <li><strong>Call to action:</strong> where your link goes, if anywhere.</li>
      </ul>
      <h2>Make the rest of your profile match</h2>
      <p>
        A bio works together with your photo, header and pinned post. Read our <Link href="/blog/twitter-bio-ideas">Twitter bio ideas</Link> and{" "}
        <Link href="/blog/pinned-tweet-ideas">pinned tweet ideas</Link>, and add a touch of style with the{" "}
        <Link href="/tools/twitter-bold-text-generator">bold text generator</Link>.
      </p>
      <h2>Turn profile visits into followers</h2>
      <p>
        A strong profile matters most when the right people see it. GrowX brings relevant people to your profile with{" "}
        <Link href="/features/twitter-auto-follow">smart auto follow</Link> and helps you post consistently with the{" "}
        <Link href="/features/twitter-post-scheduler">post scheduler</Link>.
      </p>
    </ToolPage>
  );
}
