-- =================================================================
-- THE "NUCLEAR" FIX FOR MOBILE ACCESS
-- =================================================================
-- If this doesn't work, nothing will.
-- This script completely DISABLES the security checks for these tables.
-- This effectively makes them Public Read-Only for everyone.
-- =================================================================

BEGIN;

-- 1. DISABLE Row Level Security (RLS) entirely
-- This means "No policies apply, everyone can see everything"
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_photos DISABLE ROW LEVEL SECURITY;

-- 2. Explicitly GRANT usage/select to the anonymous (public) role
-- Even if RLS is off, the role needs basic permission to "see" the table
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Also grant to authenticated (just in case)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

COMMIT;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('businesses', 'business_photos');
-- Should say rowsecurity = false
