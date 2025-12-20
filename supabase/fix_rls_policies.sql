-- Fix RLS policies to allow premium profile updates
-- Run this in your Supabase SQL Editor

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'businesses';

-- Drop conflicting policies
DROP POLICY IF EXISTS "Business owners can update own business" ON businesses;
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can view own business" ON businesses;

-- Create new, clear policies
-- 1. Anyone can read businesses (for public listings)
CREATE POLICY "Public can read businesses" ON businesses
    FOR SELECT
    USING (true);

-- 2. Authenticated users can insert businesses
CREATE POLICY "Authenticated users can insert businesses" ON businesses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_user_id);

-- 3. Business owners can update their own businesses
CREATE POLICY "Owners can update own business" ON businesses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- 4. Business owners can delete their own businesses  
CREATE POLICY "Owners can delete own business" ON businesses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_user_id);

-- Verify the policies
SELECT 'RLS policies updated successfully!' as result;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'businesses';
