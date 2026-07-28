import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("SocialAutomation", () => {
  it("shows account blockers and an approval-first scheduling queue", () => {
    const source = readFileSync("src/pages/admin/SocialAutomation.tsx", "utf8");

    expect(source).toContain("Social Automation");
    expect(source).toContain("Action required");
    expect(source).toContain("Scheduled social drafts");
    expect(source).toContain("Approve &amp; schedule");
    expect(source).toContain("Save draft");
    expect(source).toContain("US accounts are still required");
    expect(source).toContain("Local first-batch review.");
    expect(source).toContain("firstBatchReview");
    expect(source).toContain("Automation alerts");
    expect(source).toContain("Link every publishing platform");
    expect(source).toContain('action: "start"');
    expect(source).toContain('action: "disconnect"');
    expect(source).toContain('action: "select_target"');
    expect(source).toContain('(["GB", "US"] as Market[])');
    expect(source).toContain("definition.active");
    expect(source).toContain("quality_score");
    expect(source).toContain("trend_status");
    expect(source).toContain("publicationData ?? emptyScheduledPublications");
    expect(source).not.toContain("data: publications = []");
  });
});
