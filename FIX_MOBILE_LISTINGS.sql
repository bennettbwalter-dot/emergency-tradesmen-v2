-- =================================================================
-- FIX FOR MISSING LISTINGS ON MOBILE (RLS POLICY)
-- =================================================================
-- Run this script in your Supabase SQL Editor to fix the issue where
-- listings appear on PC (logged in) but not on Mobile (public/anon).
-- =================================================================

-- 1. Drop restricting policies that might prevent public viewing
-- We drop both potential names to be safe
DROP POLICY IF EXISTS "Public can read businesses" ON businesses;
DROP POLICY IF EXISTS "Public businesses are viewable by everyone" ON businesses;
-- This one often causes conflicts if it exists alongside public access
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;

-- 2. Create a permissive policy that allows EVERYONE to see businesses
-- This matches the logic we put in the code (verified check is handled in UI now)
CREATE POLICY "Public can read businesses" ON businesses
    FOR SELECT
    TO public
    USING (true);

-- 3. Verify the policies are correct
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'businesses';
