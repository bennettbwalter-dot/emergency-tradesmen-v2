-- Add vehicle_image_url to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS vehicle_image_url text;

-- Comment on column
COMMENT ON COLUMN public.businesses.vehicle_image_url IS 'URL for the premium custom vehicle/representative image';
