-- Manual script to create a test business for developer testing
-- Run this in Supabase SQL Editor

-- First, get your user ID (replace the email with yours if different)
DO $$
DECLARE
  user_uuid UUID;
  business_id TEXT;
BEGIN
  -- Get the UUID for bennett.b.walter@gmail.com
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'bennett.b.walter@gmail.com';
  
  -- Generate unique business ID
  business_id := 'dev-business-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- Check if user exists
  IF user_uuid IS NULL THEN
    RAISE NOTICE 'User bennett.b.walter@gmail.com not found. Please register first.';
  ELSE
    -- Insert test business
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
      rating,
      review_count
    ) VALUES (
      business_id,
      'dev-test-business',
      user_uuid,
      'Developer Test Business',
      'electrician',
      'London',
      'bennett.b.walter@gmail.com',
      '07700900000',
      true,
      'paid',
      true,
      '24/7 Emergency Service',
      true,
      5.0,
      0
    )
    ON CONFLICT (slug) DO UPDATE SET
      owner_user_id = user_uuid,
      is_premium = true,
      tier = 'paid',
      verified = true;
    
    RAISE NOTICE 'Business created successfully with ID: %', business_id;
  END IF;
END $$;
