-- RESET EVERYTHING SCRIPT
-- 1. Cleans up old policies
-- 2. Sets up simple, standard permissions for you to create and manage your business.

-- Disable RLS momentarily to clear the slate
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;

-- Drop ALL conflicting policies
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Enable all for auth" ON businesses;

-- Re-enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- CREATE ONE SIMPLE POLICY FOR EVERYTHING (Create, Read, Update, Delete)
-- This allows any authenticated user to do ANYTHING to a business they own.
CREATE POLICY "Users manage their own business"
ON businesses
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- Explicit Grant
GRANT ALL ON businesses TO authenticated;

-- OPTIONAL: Clean up the RPC function if you want it gone (per "Start Fresh")
DROP FUNCTION IF EXISTS create_initial_business_v2;
