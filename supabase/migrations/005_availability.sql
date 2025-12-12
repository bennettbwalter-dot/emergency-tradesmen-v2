-- Add is_available_now column to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_available_now BOOLEAN DEFAULT true;

-- Update existing businesses
UPDATE businesses SET is_available_now = true;
