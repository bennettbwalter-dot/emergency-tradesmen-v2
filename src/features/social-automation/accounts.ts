export type SocialPlatform = "facebook" | "instagram" | "tiktok";
export type Market = "GB" | "US";
export type ConnectionStatus = "unverified" | "connected" | "action_required";
export type PublishingMode =
  | "api_after_oauth"
  | "api_after_meta_link"
  | "creator_assisted";

export interface SocialAccountTarget {
  platform: SocialPlatform;
  market: Market;
  profileUrl: string;
  externalAccountId: string | null;
  handle: string | null;
  connectionStatus: ConnectionStatus;
  publishingMode: PublishingMode;
  verificationNote: string;
}

export const SOCIAL_ACCOUNT_TARGETS: SocialAccountTarget[] = [
  {
    platform: "facebook",
    market: "GB",
    profileUrl: "https://www.facebook.com/profile.php?id=61588024972553",
    externalAccountId: "61588024972553",
    handle: null,
    connectionStatus: "unverified",
    publishingMode: "api_after_oauth",
    verificationNote: "Confirm this is a Page and that the authorizing user has Page access.",
  },
  {
    platform: "instagram",
    market: "GB",
    profileUrl: "https://www.instagram.com/emergencytradesmen/",
    externalAccountId: null,
    handle: "emergencytradesmen",
    connectionStatus: "unverified",
    publishingMode: "api_after_meta_link",
    verificationNote: "Confirm a Professional account linked to the verified Facebook Page.",
  },
  {
    platform: "tiktok",
    market: "GB",
    profileUrl: "https://www.tiktok.com/@emergencytradesmen?lang=en-GB",
    externalAccountId: null,
    handle: "emergencytradesmen",
    connectionStatus: "unverified",
    publishingMode: "creator_assisted",
    verificationNote: "Use creator-assisted drafts until an audited public-posting route is approved.",
  },
];

export function summarizeSocialAccountReadiness(targets: SocialAccountTarget[]) {
  const platformsByMarket: Record<Market, SocialPlatform[]> = { GB: [], US: [] };

  for (const target of targets) {
    if (!platformsByMarket[target.market].includes(target.platform)) {
      platformsByMarket[target.market].push(target.platform);
    }
  }

  return {
    configured: targets.length,
    connected: targets.filter((target) => target.connectionStatus === "connected").length,
    unverified: targets.filter((target) => target.connectionStatus === "unverified").length,
    platformsByMarket,
    missingMarkets: (["GB", "US"] as Market[]).filter(
      (market) => platformsByMarket[market].length === 0,
    ),
  };
}
