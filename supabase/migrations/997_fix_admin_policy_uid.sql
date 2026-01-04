-- Final "Nuclear" Fix for Admin Delete
-- Uses your User ID directly: 6c7b523d-328a-454d-8496-e87c1d63460d

-- 1. Clear previous attempts
DROP POLICY IF EXISTS "Admin force delete" ON businesses;
DROP POLICY IF EXISTS "Admin force delete by UID" ON businesses;

-- 2. Create policy using your specific User ID
CREATE POLICY "Admin force delete by UID" 
ON businesses 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() = '6c7b523d-328a-454d-8496-e87c1d63460d'::uuid
);

-- 3. Ensure Owners can still delete
DROP POLICY IF EXISTS "Owners can delete own business" ON businesses;
CREATE POLICY "Owners can delete own business" 
ON businesses 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() = owner_user_id
);
