-- Add header_image_url to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS header_image_url text;

-- Comment on column
COMMENT ON COLUMN public.businesses.header_image_url IS 'URL for the premium custom header/hero image';
