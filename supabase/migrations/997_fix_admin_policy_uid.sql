-- Admin delete policy without hardcoded personal user IDs.

DROP POLICY IF EXISTS "Admin force delete by UID" ON businesses;
DROP POLICY IF EXISTS "Admin force delete" ON businesses;
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
