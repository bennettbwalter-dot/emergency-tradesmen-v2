-- ============================================================================
-- Email Control Centre  —  full outreach/CRM + safe bulk-sending schema
-- Idempotent: safe to run on a fresh DB or one that has the older
-- 20260304000000_email_outreach_tables migration partially applied.
-- ============================================================================

-- Admin gate reused by every policy below.
-- (Edge functions use the service role key, which bypasses RLS entirely.)

-- ---------------------------------------------------------------------------
-- 1. email_campaigns  (create if missing, then add new builder columns)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',          -- draft|paused|scheduled|active|completed|stopped
  variant text NOT NULL DEFAULT 'soft_sell',     -- hard_sell|soft_sell
  target_country text NOT NULL DEFAULT 'US',     -- 'US' | 'GB'
  target_trade text,
  total_sent integer DEFAULT 0,
  batch_size integer DEFAULT 50,
  next_run_at timestamptz,
  last_run_at timestamptz
);

ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS target_city text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS target_state text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS body_html text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS preheader text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS from_name text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS from_email text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS reply_to text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS opt_out_text text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS followup_sequence jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS daily_limit integer;   -- null = use global
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS hourly_limit integer;  -- null = use global
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS cooldown_days integer DEFAULT 14;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_opened integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_clicked integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_replied integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_bounced integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_unsubscribed integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_failed integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_converted integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS cost_total numeric DEFAULT 0;

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');

-- ---------------------------------------------------------------------------
-- 2. email_settings  (singleton — global sender + throttle config)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  from_name text DEFAULT 'Emergency Contractors',
  from_email text DEFAULT 'onboarding@resend.dev',
  reply_to text DEFAULT 'emergencytradesmen@gmail.com',
  sending_domain text,
  domain_verified boolean DEFAULT false,
  business_address text DEFAULT 'Emergency Contractors, USA',
  opt_out_text text DEFAULT 'You are receiving this because your business is publicly listed online. Reply with "unsubscribe" to opt out and we will remove you immediately.',
  daily_limit integer DEFAULT 200,
  hourly_limit integer DEFAULT 50,
  chunk_size integer DEFAULT 10,                 -- emails per chunk
  delay_between_emails_ms integer DEFAULT 2000,  -- pause between each send
  delay_between_chunks_ms integer DEFAULT 120000,-- longer break between chunks
  warmup_enabled boolean DEFAULT true,
  warmup_start_daily integer DEFAULT 20,         -- day-1 cap when warming up
  warmup_increment integer DEFAULT 10,           -- +per day
  max_consecutive_errors integer DEFAULT 5,      -- auto-pause threshold
  max_error_rate numeric DEFAULT 0.25,           -- auto-pause if batch error rate above this
  updated_at timestamptz DEFAULT timezone('utc', now())
);

INSERT INTO public.email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage email settings" ON public.email_settings;
CREATE POLICY "Admins manage email settings" ON public.email_settings
  FOR ALL USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');

-- ---------------------------------------------------------------------------
-- 3. email_contacts  (outreach CRM — seeded from businesses, supports import)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  business_id text,                              -- link back to businesses (text id)
  business_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text,
  website text,
  trade text,
  city text,
  state text,
  country_code text DEFAULT 'US',
  listing_url text,
  source text DEFAULT 'directory',               -- directory|import|manual
  status text DEFAULT 'new',                      -- new|queued|contacted|replied|bounced|unsubscribed|converted
  email_valid boolean DEFAULT true,
  replied boolean DEFAULT false,
  unsubscribed boolean DEFAULT false,
  bounced boolean DEFAULT false,
  sequence_step integer DEFAULT 0,
  last_emailed_at timestamptz,
  next_follow_up_at timestamptz,
  notes text
);

-- Dedup / duplicate-prevention: one row per email address.
CREATE UNIQUE INDEX IF NOT EXISTS email_contacts_email_unique ON public.email_contacts (lower(email));
CREATE INDEX IF NOT EXISTS email_contacts_sendable_idx
  ON public.email_contacts (country_code, trade, city, last_emailed_at)
  WHERE email_valid AND NOT unsubscribed AND NOT bounced AND NOT replied;

ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage email contacts" ON public.email_contacts;
CREATE POLICY "Admins manage email contacts" ON public.email_contacts
  FOR ALL USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');

-- ---------------------------------------------------------------------------
-- 4. email_suppression  (global do-not-email list — survives contact deletes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_suppression (
  email text PRIMARY KEY,                         -- always stored lower-case
  reason text NOT NULL DEFAULT 'manual',          -- unsubscribe|bounce|complaint|replied_no|manual
  source_campaign_id uuid,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.email_suppression ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage suppression" ON public.email_suppression;
CREATE POLICY "Admins manage suppression" ON public.email_suppression
  FOR ALL USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');

-- ---------------------------------------------------------------------------
-- 5. email_send_log  (per-recipient send + engagement tracking)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.email_contacts(id) ON DELETE SET NULL,
  email text NOT NULL,
  subject text,
  sequence_step integer DEFAULT 0,
  status text NOT NULL DEFAULT 'sent',            -- sent|failed|bounced|complained
  resend_id text,
  error text,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  bounced_at timestamptz
);
CREATE INDEX IF NOT EXISTS email_send_log_campaign_idx ON public.email_send_log (campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS email_send_log_email_idx ON public.email_send_log (lower(email));
CREATE INDEX IF NOT EXISTS email_send_log_resend_idx ON public.email_send_log (resend_id);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read send log" ON public.email_send_log;
CREATE POLICY "Admins read send log" ON public.email_send_log
  FOR SELECT USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');

-- ---------------------------------------------------------------------------
-- 6. email_campaign_logs  (batch-level orchestrator log — keep existing shape)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_campaign_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  status text NOT NULL,
  contacts_imported integer DEFAULT 0,
  contacts_skipped integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.email_campaign_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email campaign logs" ON public.email_campaign_logs;
CREATE POLICY "Admins can view email campaign logs" ON public.email_campaign_logs
  FOR SELECT USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');

-- ---------------------------------------------------------------------------
-- 7. email_orchestrator_state  (singleton — live state + terminal log feed)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_orchestrator_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  state text NOT NULL DEFAULT 'idle',             -- idle|checking|sending|paused|completed|failed|rate_limited|setup_required
  current_campaign_id uuid,
  message text,
  progress_current integer DEFAULT 0,
  progress_total integer DEFAULT 0,
  sent_today integer DEFAULT 0,
  log jsonb DEFAULT '[]'::jsonb,                  -- [{ts,level,line}] capped to last 200
  last_run_at timestamptz,
  updated_at timestamptz DEFAULT timezone('utc', now())
);
INSERT INTO public.email_orchestrator_state (id, state) VALUES (1, 'idle') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.email_orchestrator_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read orchestrator state" ON public.email_orchestrator_state;
CREATE POLICY "Admins read orchestrator state" ON public.email_orchestrator_state
  FOR SELECT USING (auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com');
