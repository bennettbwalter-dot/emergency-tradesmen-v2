import { describe, expect, it } from "vitest";
import {
  SOCIAL_ACCOUNT_TARGETS,
  summarizeSocialAccountReadiness,
} from "./accounts";

describe("social account targets", () => {
  it("registers the three supplied GB accounts without claiming a connection", () => {
    expect(SOCIAL_ACCOUNT_TARGETS).toEqual([
      expect.objectContaining({
        platform: "facebook",
        market: "GB",
        externalAccountId: "61588024972553",
        connectionStatus: "action_required",
        publishingMode: "creator_assisted",
      }),
      expect.objectContaining({
        platform: "instagram",
        market: "GB",
        handle: "emergencytradesmen",
        connectionStatus: "action_required",
        publishingMode: "api_after_meta_link",
      }),
      expect.objectContaining({
        platform: "tiktok",
        market: "GB",
        handle: "emergencytradesmen",
        connectionStatus: "action_required",
        publishingMode: "creator_assisted",
      }),
    ]);
  });

  it("reports GB coverage and keeps US coverage explicitly missing", () => {
    const summary = summarizeSocialAccountReadiness(SOCIAL_ACCOUNT_TARGETS);

    expect(summary).toEqual({
      configured: 3,
      connected: 0,
      unverified: 0,
      actionRequired: 3,
      platformsByMarket: {
        GB: ["facebook", "instagram", "tiktok"],
        US: [],
      },
      missingMarkets: ["US"],
    });
  });
});
