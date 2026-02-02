-- Migration: Add Rich Data Enrichment Columns to Businesses
-- Run this in the Supabase SQL Editor

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';

-- Index for country_code to support US/UK separation
CREATE INDEX IF NOT EXISTS idx_businesses_country_code ON businesses(country_code);

-- Comment for clarity
COMMENT ON COLUMN businesses.social_links IS 'Stores social media URLs in JSON format (e.g. {"facebook": "...", "instagram": "..."})';
