-- Create a function that runs with SECURITY DEFINER (admin privileges)
-- This allows us to bypass RLS policies for the creation step, ensuring 100% success rate for authenticated users.

CREATE OR REPLACE FUNCTION create_initial_business_v2(
  owner_id UUID,
  user_email TEXT,
  phone_number TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This is the magic line that bypasses RLS
AS $$
DECLARE
  new_id TEXT;
  new_record businesses;
BEGIN
  -- Generate a simplified ID
  new_id := 'pro-' || extract(epoch from now())::text;
  
  INSERT INTO businesses (
    id,
    slug,
    owner_user_id,
    name,
    trade,
    city,
    email,
    phone,
    is_premium,
    tier,
    verified,
    hours,
    is_open_24_hours,
    created_at,
    updated_at
  ) VALUES (
    new_id,
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
