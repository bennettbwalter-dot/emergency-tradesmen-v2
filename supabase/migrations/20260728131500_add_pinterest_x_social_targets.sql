-- Register the user-supplied GB Pinterest and X profiles. LinkedIn remains
-- supported by the connection code but is deliberately inactive for now.

INSERT INTO public.social_accounts (
  platform,
  market,
  profile_url,
  external_account_id,
  handle,
  connection_status,
  publishing_mode,
  enabled,
  connection_error,
  connection_metadata
)
VALUES
  (
    'pinterest',
    'GB',
    'https://uk.pinterest.com/emergencytradesmen/',
    NULL,
    'emergencytradesmen',
    'action_required',
    'api_after_oauth',
    true,
    'OAuth connection required.',
    '{"source":"user_supplied"}'::jsonb
  ),
  (
    'x',
    'GB',
    'https://x.com/etemergenc26245',
    NULL,
    'etemergenc26245',
    'action_required',
    'api_after_oauth',
    true,
    'OAuth connection required.',
    '{"source":"user_supplied"}'::jsonb
  )
ON CONFLICT (platform, market, profile_url) DO UPDATE SET
  handle = EXCLUDED.handle,
  enabled = true,
  connection_error = EXCLUDED.connection_error,
  connection_metadata = EXCLUDED.connection_metadata,
  updated_at = timezone('utc', now());

UPDATE public.social_accounts
SET
  enabled = false,
  updated_at = timezone('utc', now())
WHERE platform = 'linkedin';
