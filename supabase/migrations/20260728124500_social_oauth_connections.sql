-- Secure OAuth connection lifecycle for every supported social platform.
-- Provider tokens are encrypted by the Edge Function before reaching these
-- service-role-only tables. Browser clients never receive or query them.

ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS provider_account_type text,
  ADD COLUMN IF NOT EXISTS connected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS connection_error text,
  ADD COLUMN IF NOT EXISTS connection_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.social_oauth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL
    CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'pinterest', 'linkedin', 'x')),
  market text NOT NULL CHECK (market IN ('GB', 'US')),
  account_id uuid REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  initiated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_hash text NOT NULL UNIQUE,
  code_verifier text,
  requested_scopes text[] NOT NULL DEFAULT '{}',
  return_url text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.social_account_credentials (
  account_id uuid PRIMARY KEY REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text,
  token_type text,
  scopes text[] NOT NULL DEFAULT '{}',
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS social_oauth_sessions_expiry_idx
  ON public.social_oauth_sessions (expires_at)
  WHERE consumed_at IS NULL;

ALTER TABLE public.social_oauth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_account_credentials ENABLE ROW LEVEL SECURITY;

-- Intentionally no authenticated or anonymous policies. The social-oauth and
-- publishing Edge Functions use the service role after validating an admin.
REVOKE ALL ON public.social_oauth_sessions FROM anon, authenticated;
REVOKE ALL ON public.social_account_credentials FROM anon, authenticated;

COMMENT ON TABLE public.social_account_credentials IS
  'Service-role-only encrypted OAuth credentials for connected social accounts.';
