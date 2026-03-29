-- Enable Owners to Update their own Business (Safe Version)
-- Drops existing policies to avoid "already exists" errors.

-- 1. update policy
DROP POLICY IF EXISTS "Owners can update own business" ON businesses;
CREATE POLICY "Owners can update own business"
ON businesses
FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_user_id
)
WITH CHECK (
  auth.uid() = owner_user_id
);

-- 2. insert policy (for new profiles)
DROP POLICY IF EXISTS "Authenticated can create business" ON businesses;
CREATE POLICY "Authenticated can create business"
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_user_id
);

-- 3. Refresh schema cache
NOTIFY pgrst, 'reload config';
