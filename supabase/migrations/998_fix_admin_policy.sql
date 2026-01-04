-- Give Admin explicit permission to DELETE businesses
-- Access by: nicholas.bennett247@gmail.com

-- 1. Drop old policies that might conflict
DROP POLICY IF EXISTS "Admin can delete any business" ON businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can delete own business" ON businesses;

-- 2. Create a clean, powerful policy for the Admin
-- This policy says: "If your email is nicholas.bennett247@gmail.com, you can delete ANYTHING."
CREATE POLICY "Admin force delete" 
ON businesses 
FOR DELETE 
TO authenticated 
USING (
  auth.jwt() ->> 'email' = 'nicholas.bennett247@gmail.com'
);

-- 3. Restore Owner Permission (so regular users can still delete their own stuff)
CREATE POLICY "Owners can delete own business" 
ON businesses 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() = owner_user_id
);
