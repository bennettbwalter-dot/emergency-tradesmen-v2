import { describe, expect, it } from "vitest";
import { hasAnalyticsConsent } from "./trackingConsent";

function storageWith(value: string | null) {
  return {
    getItem: () => value,
  };
}

describe("hasAnalyticsConsent", () => {
  it("allows analytics only after explicit acceptance", () => {
    expect(hasAnalyticsConsent(storageWith("accepted"))).toBe(true);
  });

  it.each([null, "declined", "unknown"])(
    "blocks analytics when stored consent is %s",
    (value) => {
      expect(hasAnalyticsConsent(storageWith(value))).toBe(false);
    },
  );
});
