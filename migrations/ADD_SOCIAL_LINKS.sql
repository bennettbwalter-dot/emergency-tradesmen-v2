-- Add social_links column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.businesses.social_links IS 'Stores social media URLs {facebook, instagram, twitter, linkedin, tiktok}';

-- Force schema cache reload (optional but good practice)
NOTIFY pgrst, 'reload schema';
