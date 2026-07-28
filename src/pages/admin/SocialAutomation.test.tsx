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
  });
});
