import { describe, expect, it } from "vitest";
import { MARKS, STYLES, markText, styleText } from "@/lib/unicode-text";
import { weightedLength } from "@/lib/tweet-text";
import { engagementRateByFollowers, engagementRateByViews, estimatedFollowingCap, followersNeededFor, parseCount, ratioReport, totalInteractions } from "@/lib/x-math";

const style = (id: string) => STYLES.find((s) => s.id === id)!;

describe("engagement rate", () => {
  const i = { likes: 40, reposts: 5, replies: 3, bookmarks: 2 };
  it("adds every interaction", () => expect(totalInteractions(i)).toBe(50));
  it("is interactions per view in percent", () => expect(engagementRateByViews(i, 2000)).toBeCloseTo(2.5));
  it("can be measured per follower", () => expect(engagementRateByFollowers(i, 1000)).toBeCloseTo(5));
  it("is null without views or followers and ignores bad input", () => {
    expect(engagementRateByViews(i, 0)).toBeNull();
    expect(engagementRateByFollowers(i, Number.NaN)).toBeNull();
    expect(totalInteractions({ likes: -5, reposts: Number.NaN, replies: 1, bookmarks: 0 })).toBe(1);
  });
});

describe("follower ratio and following cap", () => {
  it("everyone can follow 5,000; above that about 10% over followers", () => {
    expect(estimatedFollowingCap(0)).toBe(5000);
    expect(estimatedFollowingCap(4000)).toBe(5000);
    expect(estimatedFollowingCap(10000)).toBe(11000);
  });
  it("followers needed to follow more than 5,000", () => {
    expect(followersNeededFor(5000)).toBe(0);
    expect(followersNeededFor(6600)).toBe(6000);
  });
  it("reports both ratios and room left", () => {
    expect(ratioReport(1000, 1500)).toEqual({ followRatio: 1.5, followerRatio: 1000 / 1500, cap: 5000, roomLeft: 3500 });
    expect(ratioReport(0, 0)).toEqual({ followRatio: null, followerRatio: null, cap: 5000, roomLeft: 5000 });
  });
});

describe("unicode bold text", () => {
  it("maps letters and digits to bold", () => expect(styleText("Hi 1!", style("bold"))).toBe("𝐇𝐢 𝟏!"));
  it("uses Unicode's exceptions for missing letters", () => {
    expect(styleText("h", style("italic"))).toBe("ℎ");
    expect(styleText("BRe", style("script"))).toBe("ℬℛℯ");
    expect(styleText("CR", style("double-struck"))).toBe("ℂℝ");
  });
  it("leaves other characters alone", () => expect(styleText("é-ü 😀", style("sans-bold"))).toBe("é-ü 😀"));
  it("styled letters count as 2 on X", () => expect(weightedLength(styleText("Bold", style("bold")))).toBe(8));
  it("adds combining marks but not to spaces", () => expect(markText("a b", MARKS[0].mark)).toBe("a̶ b̶"));
});

describe("parseCount", () => {
  it("reads plain, comma, k and m numbers", () => {
    expect(parseCount("1200")).toBe(1200);
    expect(parseCount("1,200")).toBe(1200);
    expect(parseCount("1.2k")).toBe(1200);
    expect(parseCount("3M")).toBe(3_000_000);
  });
  it("returns 0 for anything else", () => {
    expect(parseCount("")).toBe(0);
    expect(parseCount("abc")).toBe(0);
    expect(parseCount("-5")).toBe(0);
  });
});
