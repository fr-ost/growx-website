import { describe, expect, it } from "vitest";
import { credentialsSchema, safeNextPath } from "@/lib/validation/auth";
import { parseXUsername } from "@/lib/validation/xUsername";
import { getTier, pricingTiers } from "@/config/pricing";

describe("parseXUsername", () => {
  it.each([
    ["Alice_X", "alice_x"],
    ["@Alice_X", "alice_x"],
    ["https://x.com/Alice_X", "alice_x"],
    ["https://twitter.com/@Alice_X?ref=1", "alice_x"],
  ])("accepts %s", (raw, norm) => expect(parseXUsername(raw)?.normalized).toBe(norm));

  it.each(["", "a b", "toolongusername_123", "home", "https://example.com/alice", "<script>", "ali-ce"])("rejects %j", (raw) =>
    expect(parseXUsername(raw)).toBeNull(),
  );
});

describe("safeNextPath", () => {
  it("allows only same-site relative paths", () => {
    expect(safeNextPath("/account")).toBe("/account");
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", null, undefined, 5, "/a\nb"]) {
      expect(safeNextPath(bad)).toBe("/dashboard");
    }
  });
});

describe("credentialsSchema", () => {
  it("normalises email and enforces password length", () => {
    expect(credentialsSchema.parse({ email: " A@B.COM ", password: "12345678" }).email).toBe("a@b.com");
    expect(credentialsSchema.safeParse({ email: "nope", password: "12345678" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ email: "a@b.com", password: "x".repeat(73) }).success).toBe(false);
  });
});

describe("pricing config", () => {
  it("matches the planned prices", () => {
    expect(pricingTiers.map((t) => [t.id, t.priceCents])).toEqual([
      ["FREE", 0],
      ["PRO_MONTHLY", 199],
      ["PRO_YEARLY", 1499],
      ["PRO_LIFETIME", 2999],
      ["EARLY_ADOPTER_LIFETIME", 99],
    ]);
    expect(getTier("EARLY_ADOPTER_LIFETIME").purchaseLimit).toBe(100);
  });
});

import { getGracePolicy } from "@/lib/billing/grace";
import { visibleTiers } from "@/config/pricing";

describe("grace policy config", () => {
  it("defaults to 3 days card / 0 crypto and ignores invalid values", () => {
    expect(getGracePolicy({})).toEqual({ paddle: 3, nowpayments: 0 });
    expect(getGracePolicy({ BILLING_GRACE_DAYS_CARD: "5", BILLING_GRACE_DAYS_CRYPTO: "1" })).toEqual({ paddle: 5, nowpayments: 1 });
    expect(getGracePolicy({ BILLING_GRACE_DAYS_CARD: "-1", BILLING_GRACE_DAYS_CRYPTO: "abc" })).toEqual({ paddle: 3, nowpayments: 0 });
    expect(getGracePolicy({ BILLING_GRACE_DAYS_CARD: "99" }).paddle).toBe(3);
  });
});

describe("early adopter visibility", () => {
  it("is shown while planned/available and hidden when sold out, regular prices remain", () => {
    expect(visibleTiers("unavailable").some((t) => t.id === "EARLY_ADOPTER_LIFETIME")).toBe(true);
    const sold = visibleTiers("sold_out");
    expect(sold.some((t) => t.id === "EARLY_ADOPTER_LIFETIME")).toBe(false);
    expect(sold.map((t) => t.priceLabel)).toEqual(["$0", "$1.99", "$14.99", "$29.99"]);
  });
});
