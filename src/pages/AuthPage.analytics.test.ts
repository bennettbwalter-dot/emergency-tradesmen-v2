import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("AuthPage analytics boundary", () => {
  it("uses the local consent-gated feature-flag wrapper without direct PostHog imports", async () => {
    const source = await readFile(new URL("./AuthPage.tsx", import.meta.url), "utf8");

    expect(source).not.toMatch(/from\s+["']posthog-js(?:\/react)?["']/);
    expect(source).toMatch(
      /import\s+\{\s*subscribePostHogFeatureFlag\s*\}\s+from\s+["']@\/lib\/posthog["']/,
    );
    expect(source).toMatch(
      /return\s+subscribePostHogFeatureFlag\(\s*["']new-us-signup-flow["']/,
    );
  });
});
