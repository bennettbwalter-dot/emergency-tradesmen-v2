# Social Account Connections

The Social Automation admin page can start, complete, reconnect and remove
OAuth connections for Facebook, Instagram, TikTok, Pinterest, LinkedIn and X
in both the GB and US markets.

## Callback

Register this exact HTTPS callback in every provider developer application:

`https://antqstrspkchkoylysqa.supabase.co/functions/v1/social-oauth/callback`

The callback validates a hashed, single-use state value with a ten-minute
expiry. X and TikTok also use PKCE. Provider access and refresh tokens are
encrypted with AES-GCM before they are stored in a service-role-only table.

## Required Supabase Edge Function secrets

- `SOCIAL_TOKEN_ENCRYPTION_KEY`: at least 32 random characters.
- `META_APP_ID` and `META_APP_SECRET`.
- `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`.
- `PINTEREST_APP_ID` and `PINTEREST_APP_SECRET`.
- `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.
- `X_CLIENT_ID` and `X_CLIENT_SECRET`.
- Optional `META_GRAPH_VERSION`; the local default is `v23.0`.
- Optional comma-separated `SOCIAL_OAUTH_ALLOWED_ORIGINS`.

Do not put these values in the repository, browser environment or database
account rows.

## Provider approval gates

- Facebook publishing requires a Page. A professional-mode personal profile is
  not treated as a Page.
- Instagram publishing requires a Professional account connected to an
  eligible Facebook Page.
- TikTok requires Login Kit plus approval for `video.publish`. Direct posts
  from unaudited clients remain restricted by TikTok.
- Pinterest requires an approved application and Pins write access.
- LinkedIn member posting requires the app product that grants
  `w_member_social`. Organisation posting requires the relevant organisation
  product and administrator permissions.
- X requires an OAuth 2.0 application with write access. Media publishing also
  requests `media.write`.

If Meta returns more than one eligible Page or Instagram account, the admin
screen presents a selector. Selecting an account replaces the temporary user
token with the chosen Page publishing token.

Connecting an account does not approve a social campaign. The first batch
remains held until it is approved separately.
