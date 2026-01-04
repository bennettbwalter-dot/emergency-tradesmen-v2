-- Enable RLS (confirming it's on)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT a new business
-- Logic: A user can create a business if the 'owner_user_id' matches their own ID.
CREATE POLICY "Users can create their own business" 
ON businesses 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_user_id);

-- Ensure users can SELECT their own business (often required for the return value of INSERT)
CREATE POLICY "Users can view their own business" 
ON businesses 
FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_user_id);

-- Ensure users can UPDATE their own business
CREATE POLICY "Users can update their own business" 
ON businesses 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);
