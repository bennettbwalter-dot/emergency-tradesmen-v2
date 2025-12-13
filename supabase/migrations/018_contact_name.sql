-- Add contact_name column to businesses table for premium profiles
-- This stores the name of the main contact person for the business

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Add index for faster lookups (optional, for admin queries)
CREATE INDEX IF NOT EXISTS idx_businesses_contact_name ON businesses (contact_name) WHERE contact_name IS NOT NULL;

COMMENT ON COLUMN businesses.contact_name IS 'Name of the main contact person for this business';
