import { describe, expect, it } from "vitest";
import {
  SOCIAL_PLATFORM_CATALOG,
  SOCIAL_ACCOUNT_TARGETS,
  summarizeSocialAccountReadiness,
} from "./accounts";

describe("social account targets", () => {
  it("registers the five supplied GB accounts without claiming a connection", () => {
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
      expect.objectContaining({
        platform: "pinterest",
        market: "GB",
        handle: "emergencytradesmen",
        profileUrl: "https://uk.pinterest.com/emergencytradesmen/",
        connectionStatus: "action_required",
      }),
      expect.objectContaining({
        platform: "x",
        market: "GB",
        handle: "etemergenc26245",
        profileUrl: "https://x.com/etemergenc26245",
        connectionStatus: "action_required",
      }),
    ]);
  });

  it("reports GB coverage and keeps US coverage explicitly missing", () => {
    const summary = summarizeSocialAccountReadiness(SOCIAL_ACCOUNT_TARGETS);

    expect(summary).toEqual({
      configured: 5,
      connected: 0,
      unverified: 0,
      actionRequired: 5,
      revoked: 0,
      platformsByMarket: {
        GB: ["facebook", "instagram", "tiktok", "pinterest", "x"],
        US: [],
      },
      missingMarkets: ["US"],
    });
  });

  it("offers connection setup for every planned publishing platform", () => {
    expect(SOCIAL_PLATFORM_CATALOG.map(({ platform }) => platform)).toEqual([
      "facebook",
      "instagram",
      "tiktok",
      "pinterest",
      "linkedin",
      "x",
    ]);
    expect(
      SOCIAL_PLATFORM_CATALOG.filter(({ active }) => active).map(
        ({ platform }) => platform,
      ),
    ).toEqual(["facebook", "instagram", "tiktok", "pinterest", "x"]);
  });
});
