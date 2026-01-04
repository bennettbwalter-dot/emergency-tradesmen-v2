-- MASTER RESET & FIX v2 (The "Really, really fix it" version)

-- 1. Drop EVERYTHING related to this issue first
DROP FUNCTION IF EXISTS create_initial_business_v2;

-- Drop ALL related policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
-- Specific drop for potential duplicates
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON businesses;


-- 2. Force Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 3. Create the "God Mode" Creation Function (SECURITY DEFINER)
-- This function runs as a Super Admin, bypassing all RLS checks.
CREATE OR REPLACE FUNCTION create_initial_business_v2(
  owner_id UUID,
  user_email TEXT,
  phone_number TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_record businesses;
BEGIN
  -- SAFETY: If a business already exists for this user, return it instead of erroring!
  SELECT * INTO new_record FROM businesses WHERE owner_user_id = owner_id LIMIT 1;
  
  IF FOUND THEN
    RETURN to_jsonb(new_record);
  END IF;

  -- Create new if not found
  INSERT INTO businesses (
    id, slug, owner_user_id, name, trade, city, email, phone, is_premium, tier, verified, hours, is_open_24_hours, created_at, updated_at
  ) VALUES (
    'pro-' || extract(epoch from now())::text,
    'pro-business-' || extract(epoch from now())::text,
    owner_id,
    'Your Business Name',
    'plumber',
    'London',
    user_email,
    COALESCE(phone_number, '07700900000'),
    true,
    'paid',
    true,
    '24/7 Emergency Service',
    true,
    NOW(),
    NOW()
  )
  RETURNING * INTO new_record;

  RETURN to_jsonb(new_record);
END;
$$;

-- 4. Re-create READ/UPDATE policies
-- Now safe to create because we dropped them above
CREATE POLICY "Users can view their own business" 
ON businesses FOR SELECT TO authenticated 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own business" 
ON businesses FOR UPDATE TO authenticated 
USING (auth.uid() = owner_user_id);

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION create_initial_business_v2 TO authenticated;
GRANT ALL ON businesses TO authenticated;
