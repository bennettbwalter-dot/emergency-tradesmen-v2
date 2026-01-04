-- 1. First, disable RLS temporarily to ensure we can clean up (optional, but good for reset)
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;

-- 2. Drop potential conflicting policies (to avoid "policy already exists" errors or conflicts)
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON businesses;

-- 3. Re-enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 4. Create the INSERT policy (Explicitly allowing auth users to create rows where they are the owner)
CREATE POLICY "Users can create their own business" 
ON businesses 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_user_id);

-- 5. Ensure SELECT/UPDATE policies exist (Idempotent-ish)
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
CREATE POLICY "Users can view their own business" 
ON businesses 
FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
CREATE POLICY "Users can update their own business" 
ON businesses 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_user_id);

-- 6. Grant usage on the sequence (if id is serial, though we use text id, but good practice)
GRANT ALL ON businesses TO authenticated;
