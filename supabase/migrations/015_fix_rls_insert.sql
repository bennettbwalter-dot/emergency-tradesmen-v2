-- Run this in Supabase SQL Editor to fix the RLS issue
-- This adds a policy allowing authenticated users to insert businesses

-- Allow authenticated users to INSERT their own businesses
CREATE POLICY "Authenticated users can insert businesses" ON businesses
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to UPDATE their own businesses  
CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Now you can create your business!
