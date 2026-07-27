# Content Automation Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a tested, local-only foundation for social account readiness, consent-safe analytics, durable campaign records, and an admin readiness screen.

**Architecture:** Public account metadata and readiness rules live in a small typed frontend domain module. Supabase receives admin-only durable tables for accounts, campaigns, approvals, and publications, while platform credentials remain outside these tables. The existing admin shell displays readiness but cannot connect or publish in this slice.

**Tech Stack:** React 18, TypeScript, Vite 8, Vitest 4.1.10, Supabase/PostgreSQL, existing Tailwind and Lucide components.

## Global Constraints

- Work only on branch `codex/content-automation-phase0` in `C:\tmp\emergency-tradesmen-content-automation`; do not alter the dirty `main` checkout.
- Do not connect OAuth, request platform credentials, store tokens, apply migrations to live Supabase, publish social posts, deploy, or add Amazon integration in this slice.
- Register the supplied Facebook, Instagram, and TikTok targets as market `GB` and status `unverified`.
- Keep US social coverage explicitly missing until the user supplies separate US accounts.
- TikTok publishing mode is `creator_assisted`; do not imply unattended Direct Post.
- Every campaign and account record has an explicit `GB` or `US` market.
- Supabase automation tables use `public.is_admin()` for RLS and expose no public policies.
- PostHog must not load, initialize, capture a page view, or capture an event unless `cookieConsent` equals `accepted`.
- New behavior follows test-first development: write the test, watch the expected failure, then add the minimum implementation.
- Repository-wide lint has four pre-existing errors in email orchestration files. New files must pass targeted ESLint; TypeScript and production build must remain green.

---

### Task 1: Test harness and social account readiness domain

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/features/social-automation/accounts.ts`
- Create: `src/features/social-automation/accounts.test.ts`

**Interfaces:**
- Produces: `SocialPlatform`, `Market`, `ConnectionStatus`, `PublishingMode`, `SocialAccountTarget`, `SOCIAL_ACCOUNT_TARGETS`, and `summarizeSocialAccountReadiness`.
- `summarizeSocialAccountReadiness(targets)` returns `{ configured, connected, unverified, platformsByMarket, missingMarkets }`.

- [ ] **Step 1: Install the test runner and add the scoped test script**

Run:

```powershell
npm.cmd install --save-dev vitest@4.1.10
```

Add this script to `package.json`:

```json
"test:social": "vitest run"
```

Expected: `vitest` is present in `devDependencies`, and the lockfile records the exact compatible package.

- [ ] **Step 2: Write the failing account-registry tests**

Create `src/features/social-automation/accounts.test.ts`:

```ts
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
        connectionStatus: "unverified",
        publishingMode: "api_after_oauth",
      }),
      expect.objectContaining({
        platform: "instagram",
        market: "GB",
        handle: "emergencytradesmen",
        connectionStatus: "unverified",
        publishingMode: "api_after_meta_link",
      }),
      expect.objectContaining({
        platform: "tiktok",
        market: "GB",
        handle: "emergencytradesmen",
        connectionStatus: "unverified",
        publishingMode: "creator_assisted",
      }),
    ]);
  });

  it("reports GB coverage and keeps US coverage explicitly missing", () => {
    const summary = summarizeSocialAccountReadiness(SOCIAL_ACCOUNT_TARGETS);

    expect(summary).toEqual({
      configured: 3,
      connected: 0,
      unverified: 3,
      platformsByMarket: {
        GB: ["facebook", "instagram", "tiktok"],
        US: [],
      },
      missingMarkets: ["US"],
    });
  });
});
```

- [ ] **Step 3: Run the account tests and verify RED**

Run:

```powershell
npm.cmd run test:social -- accounts.test.ts
```

Expected: FAIL because `./accounts` does not exist.

- [ ] **Step 4: Implement the minimum typed registry and summary**

Create `src/features/social-automation/accounts.ts`:

```ts
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
```

- [ ] **Step 5: Run the account tests and verify GREEN**

Run:

```powershell
npm.cmd run test:social -- accounts.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 6: Run targeted checks and commit**

Run:

```powershell
npm.cmd exec eslint -- src/features/social-automation/accounts.ts src/features/social-automation/accounts.test.ts
npm.cmd exec tsc -- --noEmit
git add package.json package-lock.json src/features/social-automation/accounts.ts src/features/social-automation/accounts.test.ts
git commit -m "test: add social account readiness foundation"
```

Expected: targeted lint and typecheck pass; commit contains only Task 1 files.

---

### Task 2: Consent-safe PostHog boundary

**Files:**
- Create: `src/lib/trackingConsent.ts`
- Create: `src/lib/trackingConsent.test.ts`
- Modify: `src/lib/posthog.ts`
- Modify: `src/components/CookieConsent.tsx`

**Interfaces:**
- Produces: `ANALYTICS_CONSENT_KEY`, `AnalyticsConsentStorage`, and `hasAnalyticsConsent(storage)`.
- `posthog.ts` consumes `hasAnalyticsConsent(window.localStorage)` before loading or capturing.
- `CookieConsent` calls `initPostHog()` only after storing `accepted`.

- [ ] **Step 1: Write the failing consent tests**

Create `src/lib/trackingConsent.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the consent test and verify RED**

Run:

```powershell
npm.cmd run test:social -- trackingConsent.test.ts
```

Expected: FAIL because `./trackingConsent` does not exist.

- [ ] **Step 3: Implement the consent helper**

Create `src/lib/trackingConsent.ts`:

```ts
export const ANALYTICS_CONSENT_KEY = "cookieConsent";

export interface AnalyticsConsentStorage {
  getItem(key: string): string | null;
}

export function hasAnalyticsConsent(storage: AnalyticsConsentStorage | null | undefined) {
  return storage?.getItem(ANALYTICS_CONSENT_KEY) === "accepted";
}
```

- [ ] **Step 4: Verify the helper is GREEN**

Run:

```powershell
npm.cmd run test:social -- trackingConsent.test.ts
```

Expected: 4 cases pass.

- [ ] **Step 5: Wire the tested boundary into PostHog**

In `src/lib/posthog.ts`, add:

```ts
import { hasAnalyticsConsent } from "@/lib/trackingConsent";

const analyticsConsentGranted = () =>
  typeof window !== "undefined" && hasAnalyticsConsent(window.localStorage);
```

Require `analyticsConsentGranted()` in `initializePostHogNow`, `initPostHog`, and `withPostHog` before loading or initializing the client:

```ts
if (isInitialized || !POSTHOG_KEY || !analyticsConsentGranted()) return posthogClient;
```

```ts
if (
  typeof window === "undefined"
  || isInitialized
  || !POSTHOG_KEY
  || !analyticsConsentGranted()
) {
  return;
}
```

```ts
if (!POSTHOG_KEY || typeof window === "undefined" || !analyticsConsentGranted()) return;
```

Also gate the already-initialized fast paths before any capture:

```ts
export const trackPostHogPageView = (url: string) => {
    if (!analyticsConsentGranted()) return;
    if (isInitialized && posthogClient) {
        posthogClient.capture('$pageview', { $current_url: url });
        return;
    }
    withPostHog((posthog) => posthog.capture('$pageview', { $current_url: url }));
};

export const trackPostHogEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsConsentGranted()) return;
    if (isInitialized && posthogClient) {
        posthogClient.capture(eventName, properties);
        return;
    }
    withPostHog((posthog) => posthog.capture(eventName, properties));
};
```

In `src/components/CookieConsent.tsx`, import `initPostHog` and invoke it after acceptance:

```ts
import { initPostHog } from "@/lib/posthog";
```

```ts
localStorage.setItem("cookieConsent", "accepted");
updateGoogleConsent(true);
initPostHog();
setShowBanner(false);
```

- [ ] **Step 6: Run tests and targeted validation**

Run:

```powershell
npm.cmd run test:social -- trackingConsent.test.ts
npm.cmd exec eslint -- src/lib/trackingConsent.ts src/lib/trackingConsent.test.ts src/lib/posthog.ts src/components/CookieConsent.tsx
npm.cmd exec tsc -- --noEmit
npm.cmd run build
```

Expected: consent tests, targeted lint, typecheck, and production build pass.

- [ ] **Step 7: Commit**

Run:

```powershell
git add src/lib/trackingConsent.ts src/lib/trackingConsent.test.ts src/lib/posthog.ts src/components/CookieConsent.tsx
git commit -m "fix: require consent before PostHog tracking"
```

---

### Task 3: Durable Supabase automation foundation

**Files:**
- Create: `supabase/migrations/20260727000000_social_automation_foundation.sql`
- Create: `tests/social-automation/social-automation-migration.test.ts`

**Interfaces:**
- Produces tables `social_accounts`, `social_campaigns`, `social_publications`, and `social_approval_events`.
- `social_campaigns.source_post_id` references `public.posts(id)`.
- All four tables are admin-only through `public.is_admin()`.
- The migration seeds only public identifiers for the three unverified GB targets.

- [ ] **Step 1: Write the failing migration contract test**

Create `tests/social-automation/social-automation-migration.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath =
  "supabase/migrations/20260727000000_social_automation_foundation.sql";

describe("social automation migration", () => {
  it("creates the four durable admin-only tables", () => {
    const sql = readFileSync(migrationPath, "utf8");

    for (const table of [
      "social_accounts",
      "social_campaigns",
      "social_publications",
      "social_approval_events",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    }

    expect(sql.match(/public\.is_admin\(\)/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("enforces market, platform, workflow, and idempotency boundaries", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("market IN ('GB', 'US')");
    expect(sql).toContain("platform IN ('facebook', 'instagram', 'tiktok')");
    expect(sql).toContain("publishing_mode IN ('api_after_oauth', 'api_after_meta_link', 'creator_assisted')");
    expect(sql).toContain("state IN ('detected', 'researched', 'drafted', 'review_required', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')");
    expect(sql).toContain("idempotency_key text NOT NULL UNIQUE");
    expect(sql).toContain("UNIQUE (campaign_id, account_id)");
  });

  it("seeds only public identifiers and never stores access tokens", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("61588024972553");
    expect(sql).toContain("emergencytradesmen");
    expect(sql).toContain("'unverified'");
    expect(sql).not.toMatch(/access_token|refresh_token|client_secret/i);
  });
});
```

- [ ] **Step 2: Run the migration tests and verify RED**

Run:

```powershell
npm.cmd run test:social -- social-automation-migration.test.ts
```

Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Create the idempotent migration**

Create `supabase/migrations/20260727000000_social_automation_foundation.sql`:

```sql
-- Approval-first social content automation foundation.
-- Public profile identifiers only. Platform credentials belong in a
-- separate server-side secret store and are intentionally absent here.

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  market text NOT NULL CHECK (market IN ('GB', 'US')),
  profile_url text NOT NULL,
  external_account_id text,
  handle text,
  connection_status text NOT NULL DEFAULT 'unverified'
    CHECK (connection_status IN ('unverified', 'connected', 'action_required', 'revoked')),
  publishing_mode text NOT NULL
    CHECK (publishing_mode IN ('api_after_oauth', 'api_after_meta_link', 'creator_assisted')),
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (platform, market, profile_url)
);

CREATE TABLE IF NOT EXISTS public.social_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE RESTRICT,
  market text NOT NULL CHECK (market IN ('GB', 'US')),
  state text NOT NULL DEFAULT 'detected'
    CHECK (state IN ('detected', 'researched', 'drafted', 'review_required', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  idempotency_key text NOT NULL UNIQUE,
  trend_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  safety_review_required boolean NOT NULL DEFAULT true,
  affiliate_review_required boolean NOT NULL DEFAULT false,
  scheduled_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.social_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.social_campaigns(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.social_accounts(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled', 'creator_action_required')),
  platform_post_id text,
  destination_url text,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (campaign_id, account_id)
);

CREATE TABLE IF NOT EXISTS public.social_approval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.social_campaigns(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decision text NOT NULL CHECK (decision IN ('requested', 'approved', 'rejected', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS social_campaigns_source_post_idx
  ON public.social_campaigns (source_post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS social_campaigns_state_schedule_idx
  ON public.social_campaigns (state, scheduled_at);
CREATE INDEX IF NOT EXISTS social_publications_status_idx
  ON public.social_publications (status, created_at);
CREATE INDEX IF NOT EXISTS social_approval_events_campaign_idx
  ON public.social_approval_events (campaign_id, created_at DESC);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_approval_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage social accounts" ON public.social_accounts;
CREATE POLICY "Admins manage social accounts" ON public.social_accounts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage social campaigns" ON public.social_campaigns;
CREATE POLICY "Admins manage social campaigns" ON public.social_campaigns
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage social publications" ON public.social_publications;
CREATE POLICY "Admins manage social publications" ON public.social_publications
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage social approval events" ON public.social_approval_events;
CREATE POLICY "Admins manage social approval events" ON public.social_approval_events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.social_accounts (
  platform,
  market,
  profile_url,
  external_account_id,
  handle,
  connection_status,
  publishing_mode
)
VALUES
  (
    'facebook',
    'GB',
    'https://www.facebook.com/profile.php?id=61588024972553',
    '61588024972553',
    NULL,
    'unverified',
    'api_after_oauth'
  ),
  (
    'instagram',
    'GB',
    'https://www.instagram.com/emergencytradesmen/',
    NULL,
    'emergencytradesmen',
    'unverified',
    'api_after_meta_link'
  ),
  (
    'tiktok',
    'GB',
    'https://www.tiktok.com/@emergencytradesmen?lang=en-GB',
    NULL,
    'emergencytradesmen',
    'unverified',
    'creator_assisted'
  )
ON CONFLICT (platform, market, profile_url) DO UPDATE SET
  external_account_id = EXCLUDED.external_account_id,
  handle = EXCLUDED.handle,
  publishing_mode = EXCLUDED.publishing_mode,
  updated_at = timezone('utc', now());
```

- [ ] **Step 4: Run the migration tests and verify GREEN**

Run:

```powershell
npm.cmd run test:social -- social-automation-migration.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Run targeted checks and commit**

Run:

```powershell
npm.cmd run test:social
npm.cmd exec tsc -- --noEmit
git add supabase/migrations/20260727000000_social_automation_foundation.sql tests/social-automation/social-automation-migration.test.ts
git commit -m "feat: add social automation database foundation"
```

Expected: all scoped tests and typecheck pass; no live database mutation occurs.

---

### Task 4: Read-only admin readiness screen

**Files:**
- Create: `src/pages/admin/SocialAutomation.tsx`
- Create: `src/pages/admin/SocialAutomation.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/admin/AdminLayout.tsx`

**Interfaces:**
- Consumes: `SOCIAL_ACCOUNT_TARGETS` and `summarizeSocialAccountReadiness`.
- Produces: lazy route `/admin/social-automation` and sidebar item `Social Automation`.
- The page is display-only; it has no connect, approve, schedule, or publish mutation.

- [ ] **Step 1: Write the failing server-render test**

Create `src/pages/admin/SocialAutomation.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SocialAutomation from "./SocialAutomation";

describe("SocialAutomation", () => {
  it("shows the supplied targets without claiming they are connected", () => {
    const markup = renderToStaticMarkup(<SocialAutomation />);

    expect(markup).toContain("Social Automation");
    expect(markup).toContain("61588024972553");
    expect(markup).toContain("@emergencytradesmen");
    expect(markup).toContain("Unverified");
    expect(markup).toContain("US accounts are still required");
    expect(markup).not.toContain("Connected and ready");
  });
});
```

- [ ] **Step 2: Run the screen test and verify RED**

Run:

```powershell
npm.cmd run test:social -- SocialAutomation.test.tsx
```

Expected: FAIL because `./SocialAutomation` does not exist.

- [ ] **Step 3: Implement the display-only page**

Create `src/pages/admin/SocialAutomation.tsx`:

```tsx
import { ExternalLink, ShieldCheck } from "lucide-react";
import {
  SOCIAL_ACCOUNT_TARGETS,
  summarizeSocialAccountReadiness,
} from "@/features/social-automation/accounts";

const platformLabels = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
} as const;

export default function SocialAutomation() {
  const summary = summarizeSocialAccountReadiness(SOCIAL_ACCOUNT_TARGETS);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-gold">Content operations</p>
        <h1 className="mt-1 text-3xl font-display text-foreground">Social Automation</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Account targets are registered for readiness checks. No account is connected,
          and nothing can publish from this screen.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Configured targets</p>
          <p className="mt-2 text-3xl font-semibold">{summary.configured}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Connected</p>
          <p className="mt-2 text-3xl font-semibold">{summary.connected}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Awaiting verification</p>
          <p className="mt-2 text-3xl font-semibold">{summary.unverified}</p>
        </div>
      </div>

      <div className="space-y-3">
        {SOCIAL_ACCOUNT_TARGETS.map((target) => (
          <article
            key={`${target.market}-${target.platform}`}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {platformLabels[target.platform]}
                  </h2>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                    Unverified
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                    {target.market}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {target.externalAccountId
                    ? `Account ID ${target.externalAccountId}`
                    : `@${target.handle}`}
                </p>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {target.verificationNote}
                </p>
              </div>
              <a
                href={target.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
              >
                Open profile
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <h2 className="font-semibold">Regional coverage</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The supplied profiles cover the GB brand. US accounts are still required
            before EmergencyContractors campaigns can be enabled.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify the page test is GREEN**

Run:

```powershell
npm.cmd run test:social -- SocialAutomation.test.tsx
```

Expected: 1 test passes.

- [ ] **Step 5: Add the lazy route and navigation item**

In `src/App.tsx`, add:

```ts
const SocialAutomation = lazy(() => import("./pages/admin/SocialAutomation"));
```

Inside the existing `/admin` route:

```tsx
<Route path="social-automation" element={<SocialAutomation />} />
```

In `src/components/admin/AdminLayout.tsx`, import `Share2` from `lucide-react` and add:

```ts
{ path: "/admin/social-automation", icon: Share2, label: "Social Automation" },
```

immediately after the Email Campaigns navigation item.

- [ ] **Step 6: Run all scoped and build checks**

Run:

```powershell
npm.cmd run test:social
npm.cmd exec eslint -- src/features/social-automation/accounts.ts src/features/social-automation/accounts.test.ts src/lib/trackingConsent.ts src/lib/trackingConsent.test.ts src/lib/posthog.ts src/components/CookieConsent.tsx src/pages/admin/SocialAutomation.tsx src/pages/admin/SocialAutomation.test.tsx src/App.tsx src/components/admin/AdminLayout.tsx
npm.cmd exec tsc -- --noEmit
npm.cmd run build
git diff --check
```

Expected: all new tests, targeted lint, typecheck, production build, and whitespace checks pass.

- [ ] **Step 7: Commit**

Run:

```powershell
git add src/pages/admin/SocialAutomation.tsx src/pages/admin/SocialAutomation.test.tsx src/App.tsx src/components/admin/AdminLayout.tsx
git commit -m "feat: add social automation readiness screen"
```

---

### Task 5: Final local verification and handoff

**Files:**
- Modify only if review finds a defect in Task 1–4 files.

**Interfaces:**
- Consumes: all Task 1–4 deliverables.
- Produces: a reviewed, local-only branch ready for account authorization planning.

- [ ] **Step 1: Confirm scope and working tree**

Run:

```powershell
git status --short
git log --oneline --decorate -5
git diff main...HEAD --stat
```

Expected: only planned foundation files differ from `main`.

- [ ] **Step 2: Run the final local gate**

Run:

```powershell
npm.cmd run test:social
npm.cmd exec tsc -- --noEmit
npm.cmd run build
git diff --check main...HEAD
```

Expected: all commands pass. Repository-wide lint remains separately blocked only by the recorded pre-existing email-orchestration errors.

- [ ] **Step 3: Review security boundaries**

Confirm from the diff:

- no access token, refresh token, app secret, password, or service-role key was added;
- no live Supabase command, platform API call, publish call, or deployment command exists;
- all three supplied targets remain `unverified`;
- TikTok remains `creator_assisted`;
- every database RLS policy uses `public.is_admin()`;
- PostHog refuses to load before explicit consent.

- [ ] **Step 4: Stop before external authorization**

Report the local foundation and request the user’s participation only when an official Meta or TikTok authorization screen is ready. Never ask the user to paste a password or token into chat.

