-- Add DELETE policy for businesses table to allow admin/owner deletions
-- This enables the admin panel to delete businesses

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete own businesses" ON businesses;

-- Allow users to delete their own businesses
CREATE POLICY "Users can delete own businesses"
ON businesses
FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid() OR owner_id = auth.uid());

-- Allow admin to delete any business
-- Admin is identified by VITE_ADMIN_EMAIL environment variable
CREATE POLICY "Admin can delete any business"
ON businesses
FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM auth.users 
        WHERE email = current_setting('app.admin_email', true)
    )
    OR 
    -- Fallback: if admin_email not set, allow deletion of own businesses only
    owner_user_id = auth.uid() 
    OR 
    owner_id = auth.uid()
);

-- Comment for documentation
COMMENT ON POLICY "Admin can delete any business" ON businesses IS 
'Allows admin users (identified by app.admin_email setting) to delete any business, and regular users to delete only their own businesses';
