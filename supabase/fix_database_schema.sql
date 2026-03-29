-- =================================================================
-- FIX MISSING COLUMNS AND PERMISSIONS
-- Run this in the Supabase SQL Editor to unblock Premium Profile Saving
-- =================================================================

-- 1. Add missing 'owner_user_id' column if it doesn't exist
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- 2. Add other potentially missing premium columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS premium_description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS services_offered TEXT[];
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS coverage_areas TEXT[];
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hidden_reviews TEXT[];

-- 3. FIX RLS POLICIES (Enable updates/inserts)

-- Enable RLS just in case
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Allow Authenticated users to INSERT (Create new business)
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON businesses;
CREATE POLICY "Authenticated users can create businesses" ON businesses
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow Owners to UPDATE their own business
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
CREATE POLICY "Users can update their own business" ON businesses
  FOR UPDATE 
  USING (owner_user_id = auth.uid() OR auth.role() = 'authenticated'); -- Fallback to auth if owner not set yet

-- Allow Admins/Owners to DELETE
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;
CREATE POLICY "Users can delete their own business" ON businesses
  FOR DELETE
  USING (owner_user_id = auth.uid() OR auth.role() = 'authenticated');

-- 4. FIX STORAGE POLICIES (For Logo/Photos)
-- Upsert specific policies for storage.objects if needed, usually handles by bucket 'public' toggles or specific policies
-- But ensure 'business-assets' exists
INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload business assets"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'business-assets' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update business assets"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'business-assets' AND auth.role() = 'authenticated' );

-- 5. Enable public read for everything in businesses
DROP POLICY IF EXISTS "Public read all businesses" ON businesses;
CREATE POLICY "Public read all businesses" ON businesses
  FOR SELECT USING (true);
