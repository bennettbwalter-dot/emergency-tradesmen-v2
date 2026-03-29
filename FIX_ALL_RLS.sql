-- =================================================================
-- MASTER FIX FOR MOBILE LISTINGS (RLS ON ALL TABLES)
-- =================================================================
-- It is likely that RLS was fixed on 'businesses' but 'business_photos'
-- is still blocking access, or the previous script didn't fully apply.
-- Run this ENTIRE script to fix everything.
-- =================================================================

BEGIN; -- Start transaction

-- 1. Businesses Table (Public Read Access)
DROP POLICY IF EXISTS "Public can read businesses" ON businesses;
DROP POLICY IF EXISTS "Public businesses are viewable by everyone" ON businesses;
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
DROP POLICY IF EXISTS "Allow public read access" ON businesses;

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read businesses" 
ON businesses FOR SELECT 
TO public 
USING (true);

-- 2. Business Photos Table (Public Read Access)
-- If this table is locked, the join might fail or return incomplete data
DROP POLICY IF EXISTS "Public can read business_photos" ON business_photos;
DROP POLICY IF EXISTS "Public photos are viewable by everyone" ON business_photos;

ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read business_photos" 
ON business_photos FOR SELECT 
TO public 
USING (true);

-- 3. Verify
SELECT tablename, policyname, roles, qual 
FROM pg_policies 
WHERE tablename IN ('businesses', 'business_photos');

COMMIT; -- Commit changes
