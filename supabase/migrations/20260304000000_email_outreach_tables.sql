-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'paused', -- 'active', 'paused', 'completed'
  variant text NOT NULL DEFAULT 'hard_sell', -- 'hard_sell', 'soft_sell'
  target_country text NOT NULL DEFAULT 'GB', -- 'GB', 'US'
  target_trade text, -- null means all trades
  eo_list_id text, -- EmailOctopus List ID
  eo_campaign_ids jsonb DEFAULT '[]'::jsonb, -- Array of EO Campaign IDs
  total_sent integer DEFAULT 0,
  batch_size integer DEFAULT 100,
  next_run_at timestamp with time zone,
  last_run_at timestamp with time zone
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can manage campaigns
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com'
  );

-- Create email_campaign_logs table
CREATE TABLE IF NOT EXISTS public.email_campaign_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  status text NOT NULL, -- 'success', 'error'
  contacts_imported integer DEFAULT 0,
  contacts_skipped integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.email_campaign_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view logs
CREATE POLICY "Admins can view email campaign logs" ON public.email_campaign_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com'
  );

-- Admins can insert logs (or edge function with service key)
CREATE POLICY "Admins can insert email campaign logs" ON public.email_campaign_logs
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com'
  );

-- Add last_emailed_at block to businesses to prevent spamming
ALTER TABLE public.businesses ADD COLUMN last_emailed_at timestamp with time zone;
