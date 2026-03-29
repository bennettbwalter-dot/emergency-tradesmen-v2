-- FIX API SCHEMA CACHE
-- This script re-applies the function and forces the API to refresh.

-- 1. Re-create function (Just to be absolutely sure it exists)
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
  -- Check if exists
  SELECT * INTO new_record FROM businesses WHERE owner_user_id = owner_id LIMIT 1;
  IF FOUND THEN
    RETURN to_jsonb(new_record);
  END IF;

  -- Create new
  INSERT INTO businesses (
    id, slug, owner_user_id, name, trade, city, email, phone, is_premium, tier, verified, is_open_24_hours, hours
  ) VALUES (
    'pro-' || extract(epoch from now())::text,
    'pro-b-' || extract(epoch from now())::text,
    owner_id, 
    'Your Business Name', 
    'plumber', 
    'London', 
    user_email, 
    COALESCE(phone_number, '07700900000'), 
    true, 'paid', true, true, '24/7'
  )
  RETURNING * INTO new_record;

  RETURN to_jsonb(new_record);
END;
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION create_initial_business_v2 TO authenticated;

-- 3. THE CRITICAL FIX: Reload the API Schema Cache
-- This tells Supabase/PostgREST to "look again" for the new function
NOTIFY pgrst, 'reload config';
