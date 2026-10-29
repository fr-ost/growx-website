import { describe, expect, it } from "vitest";
import { POST_LIMIT, countLinks, splitThread, weightedLength } from "@/lib/tweet-text";

describe("weightedLength (X's character count)", () => {
  it("counts plain Latin text one per character", () => {
    expect(weightedLength("hello world")).toBe(11);
  });
  it("counts any link as 23", () => {
    expect(weightedLength("https://www.growxapp.org/blog/a-very-long-path-that-would-otherwise-count")).toBe(23);
    expect(weightedLength("see growxapp.org")).toBe(4 + 23);
    expect(countLinks("a https://x.com b growxapp.org")).toBe(2);
  });
  it("counts emoji and CJK as 2", () => {
    expect(weightedLength("😀")).toBe(2);
    expect(weightedLength("👍🏽")).toBe(2);
    expect(weightedLength("日本")).toBe(4);
  });
});

describe("splitThread", () => {
  it("keeps a short text as one part", () => {
    expect(splitThread("Just one post.")).toEqual(["Just one post."]);
  });
  it("splits long text into parts that each fit, preferring sentence breaks", () => {
    const text = Array.from({ length: 30 }, (_, i) => `This is sentence number ${i + 1} of a long draft.`).join(" ");
    const parts = splitThread(text);
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) {
      expect(weightedLength(p)).toBeLessThanOrEqual(POST_LIMIT);
      expect(p.endsWith(".")).toBe(true);
    }
  });
  it("starts a new part at a --- line and numbers parts when asked", () => {
    const parts = splitThread("First part\n---\nSecond part", { numbering: true });
    expect(parts).toEqual(["First part 1/2", "Second part 2/2"]);
  });
  it("never produces more than 25 parts", () => {
    expect(splitThread("word ".repeat(20000)).length).toBeLessThanOrEqual(25);
  });
});
