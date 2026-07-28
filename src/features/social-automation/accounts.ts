export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "pinterest"
  | "linkedin"
  | "x";
export type Market = "GB" | "US";
export type ConnectionStatus =
  | "unverified"
  | "connected"
  | "action_required"
  | "revoked";
export type PublishingMode =
  | "api_after_oauth"
  | "api_after_meta_link"
  | "creator_assisted";

export interface SocialAccountTarget {
  id?: string;
  platform: SocialPlatform;
  market: Market;
  profileUrl: string;
  externalAccountId: string | null;
  handle: string | null;
  connectionStatus: ConnectionStatus;
  publishingMode: PublishingMode;
  verificationNote: string;
  enabled?: boolean;
  connectionMetadata?: {
    available_accounts?: Array<{
      external_account_id: string;
      handle: string | null;
      profile_url: string;
      display_name: string | null;
      account_type: string | null;
    }>;
    [key: string]: unknown;
  };
}

export interface SocialPlatformDefinition {
  platform: SocialPlatform;
  label: string;
  developerUrl: string;
  connectionSummary: string;
  active: boolean;
}

export const SOCIAL_PLATFORM_CATALOG: SocialPlatformDefinition[] = [
  {
    platform: "facebook",
    label: "Facebook",
    active: true,
    developerUrl: "https://developers.facebook.com/apps/",
    connectionSummary: "Connect a Facebook Page with Page publishing permission.",
  },
  {
    platform: "instagram",
    label: "Instagram",
    active: true,
    developerUrl: "https://developers.facebook.com/apps/",
    connectionSummary:
      "Connect a Professional Instagram account linked to a Facebook Page.",
  },
  {
    platform: "tiktok",
    label: "TikTok",
    active: true,
    developerUrl: "https://developers.tiktok.com/apps/",
    connectionSummary:
      "Connect through Login Kit with an approved Content Posting API app.",
  },
  {
    platform: "pinterest",
    label: "Pinterest",
    active: true,
    developerUrl: "https://developers.pinterest.com/apps/",
    connectionSummary: "Connect with Pinterest OAuth and Pins write access.",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    active: false,
    developerUrl: "https://www.linkedin.com/developers/apps/",
    connectionSummary:
      "Connect a member or approved organisation publishing identity.",
  },
  {
    platform: "x",
    label: "X",
    active: true,
    developerUrl: "https://developer.x.com/en/portal/dashboard",
    connectionSummary: "Connect with OAuth 2.0 PKCE and post write access.",
  },
];

export const PLATFORM_LABELS = Object.fromEntries(
  SOCIAL_PLATFORM_CATALOG.map(({ platform, label }) => [platform, label]),
) as Record<SocialPlatform, string>;

export const SOCIAL_ACCOUNT_TARGETS: SocialAccountTarget[] = [
  {
    platform: "facebook",
    market: "GB",
    profileUrl: "https://www.facebook.com/profile.php?id=61588024972553",
    externalAccountId: "61588024972553",
    handle: null,
    connectionStatus: "action_required",
    publishingMode: "creator_assisted",
    verificationNote:
      "Verified as a professional-mode profile, not a Facebook Page. Create or nominate a Page before API publishing can be enabled.",
  },
  {
    platform: "instagram",
    market: "GB",
    profileUrl: "https://www.instagram.com/emergencytradesmen/",
    externalAccountId: null,
    handle: "emergencytradesmen",
    connectionStatus: "action_required",
    publishingMode: "api_after_meta_link",
    verificationNote:
      "Profile exists, but login is required to confirm it is Professional and link it to a verified Facebook Page.",
  },
  {
    platform: "tiktok",
    market: "GB",
    profileUrl: "https://www.tiktok.com/@emergencytradesmen?lang=en-GB",
    externalAccountId: null,
    handle: "emergencytradesmen",
    connectionStatus: "action_required",
    publishingMode: "creator_assisted",
    verificationNote:
      "Profile exists. Log in and use creator-assisted drafts until an audited public-posting route is approved.",
  },
  {
    platform: "pinterest",
    market: "GB",
    profileUrl: "https://uk.pinterest.com/emergencytradesmen/",
    externalAccountId: null,
    handle: "emergencytradesmen",
    connectionStatus: "action_required",
    publishingMode: "api_after_oauth",
    verificationNote:
      "Profile supplied. Connect the approved Pinterest developer app before scheduled Pins can publish.",
  },
  {
    platform: "x",
    market: "GB",
    profileUrl: "https://x.com/etemergenc26245",
    externalAccountId: null,
    handle: "etemergenc26245",
    connectionStatus: "action_required",
    publishingMode: "api_after_oauth",
    verificationNote:
      "Profile supplied. Connect the X developer app with post and media write access before publishing.",
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
    actionRequired: targets.filter(
      (target) => target.connectionStatus === "action_required",
    ).length,
    revoked: targets.filter((target) => target.connectionStatus === "revoked").length,
    platformsByMarket,
    missingMarkets: (["GB", "US"] as Market[]).filter(
      (market) => platformsByMarket[market].length === 0,
    ),
  };
}
