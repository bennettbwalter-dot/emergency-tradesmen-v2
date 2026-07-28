-- Approval-first social content automation foundation.
-- Public profile identifiers only. Platform credentials belong in a
-- separate server-side secret store and are intentionally absent here.

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  market text NOT NULL CHECK (market IN ('GB', 'US')),
  profile_url text NOT NULL CHECK (profile_url ~ '^https://'),
  external_account_id text,
  handle text,
  connection_status text NOT NULL DEFAULT 'unverified'
    CHECK (connection_status IN ('unverified', 'connected', 'action_required', 'revoked')),
  publishing_mode text NOT NULL
    CHECK (publishing_mode IN ('api_after_oauth', 'api_after_meta_link', 'creator_assisted')),
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT social_accounts_public_identifier_check
    CHECK (external_account_id IS NOT NULL OR handle IS NOT NULL),
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
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT social_campaigns_approved_state_check CHECK (
    state NOT IN ('approved', 'scheduled', 'publishing', 'published')
    OR approved_at IS NOT NULL
  )
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
CREATE POLICY "Admins manage social accounts"
ON public.social_accounts
FOR ALL
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins manage social campaigns" ON public.social_campaigns;
CREATE POLICY "Admins manage social campaigns"
ON public.social_campaigns
FOR ALL
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins manage social publications" ON public.social_publications;
CREATE POLICY "Admins manage social publications"
ON public.social_publications
FOR ALL
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins manage social approval events" ON public.social_approval_events;
CREATE POLICY "Admins manage social approval events"
ON public.social_approval_events
FOR ALL
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_publications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_approval_events TO authenticated;

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
