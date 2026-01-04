-- MASTER RESET SCRIPT
-- RUN THIS TO FIX EVERYTHING

-- 1. Drop existing functions/policies to clear the slate
DROP FUNCTION IF EXISTS create_initial_business_v2;
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;

-- 2. Force Enable RLS (Good practice)
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
    true, 'paid', true, '24/7 Emergency Service', true, NOW(), NOW()
  )
  RETURNING * INTO new_record;

  RETURN to_jsonb(new_record);
END;
$$;

-- 4. Ensure authenticated users can READ/UPDATE their own business
-- (We use separate policies for this regular usage)
CREATE POLICY "Users can view their own business" 
ON businesses FOR SELECT TO authenticated 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own business" 
ON businesses FOR UPDATE TO authenticated 
USING (auth.uid() = owner_user_id);

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION create_initial_business_v2 TO authenticated;
GRANT ALL ON businesses TO authenticated;
