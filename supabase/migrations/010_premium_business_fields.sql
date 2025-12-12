-- Migration: Add premium subscriber fields to businesses table
-- Run this in Supabase SQL Editor

-- Add premium-specific columns to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS premium_description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS services_offered TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS coverage_areas TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- Create index for premium listings
CREATE INDEX IF NOT EXISTS idx_businesses_is_premium ON businesses(is_premium);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_user_id);

-- Update RLS to allow owners to edit their business
DROP POLICY IF EXISTS "Business owners can update own business" ON businesses;
CREATE POLICY "Business owners can update own business" ON businesses 
    FOR UPDATE USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Business owners can view own business" ON businesses;
CREATE POLICY "Business owners can view own business" ON businesses 
    FOR SELECT USING (auth.uid() = owner_user_id OR true); -- Public read, owner has full access

SELECT 'Premium fields added to businesses table!' as result;
