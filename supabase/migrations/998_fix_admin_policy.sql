-- Admin delete policy using a database setting instead of a hardcoded email.

DROP POLICY IF EXISTS "Admin force delete" ON businesses;
DROP POLICY IF EXISTS "Admin can delete any business" ON businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON businesses;
DROP POLICY IF EXISTS "Owners can delete own business" ON businesses;

CREATE POLICY "Admin can delete any business"
ON businesses
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
);

CREATE POLICY "Owners can delete own business"
ON businesses
FOR DELETE
TO authenticated
USING (
  auth.uid() = owner_user_id
  OR auth.uid() = owner_id
);
