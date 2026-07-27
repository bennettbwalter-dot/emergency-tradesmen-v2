# Content Automation Foundation Design

## Decision

Build an approval-first content automation system. Supabase stores durable campaign state, approvals, publications, and account metadata. A later worker performs scheduling and platform API calls. MCP remains a thin authenticated control surface over those durable services.

## This slice

The first slice establishes local foundations only:

- register the supplied Facebook, Instagram, and TikTok profiles as unverified GB targets;
- show their readiness in the existing admin area;
- prevent PostHog from loading or capturing before analytics consent;
- add an idempotent Supabase schema for accounts, campaigns, approvals, and publications;
- add automated tests for the new domain and consent rules.

## Explicitly excluded

- OAuth or access-token exchange;
- storing platform secrets;
- applying migrations to live Supabase;
- scheduling or publishing posts;
- TikTok Direct Post;
- Amazon product discovery or affiliate links;
- deployment.

## Account targets

| Platform | Public target | Market | Initial mode |
|---|---|---|---|
| Facebook | `https://www.facebook.com/profile.php?id=61588024972553` | GB | API after OAuth and Page verification |
| Instagram | `https://www.instagram.com/emergencytradesmen/` | GB | API after Professional-account and Page-link verification |
| TikTok | `https://www.tiktok.com/@emergencytradesmen?lang=en-GB` | GB | Creator-assisted draft/export |

All targets begin in `unverified`. No US social accounts have been supplied, so US coverage remains explicitly missing.

## Safety boundaries

- UK and US campaigns always carry an explicit market.
- Only admins can read or mutate automation tables through Supabase RLS.
- Platform tokens never live in frontend code or general campaign tables.
- Emergency-safety and affiliate campaigns always require human approval.
- TikTok remains creator-assisted until a compliant audited publishing route is proven.
- Analytics vendors must remain disabled until the visitor grants analytics consent.
