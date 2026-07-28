import { describe, expect, it } from "vitest";
import { acceptAnalyticsConsent, hasAnalyticsConsent } from "./trackingConsent";

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

describe("acceptAnalyticsConsent", () => {
  it("persists acceptance before invoking the accepted callback", () => {
    const values = new Map<string, string>();
    let consentSeenByCallback: string | null = null;

    acceptAnalyticsConsent(
      {
        setItem: (key, value) => values.set(key, value),
      },
      () => {
        consentSeenByCallback = values.get("cookieConsent") ?? null;
      },
    );

    expect(consentSeenByCallback).toBe("accepted");
  });
});
