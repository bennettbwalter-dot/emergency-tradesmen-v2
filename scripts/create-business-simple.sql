-- SIMPLE COPY/PASTE SOLUTION
-- 1. Go to: https://supabase.com/dashboard
-- 2. Open your project
-- 3. Go to SQL Editor
-- 4. Paste this entire script
-- 5. Click RUN

-- Create business for bennett.b.walter@gmail.com
INSERT INTO businesses (
  id,
  slug,
  name,
  trade,
  city,
  owner_user_id,
  is_premium,
  tier
)
SELECT
  'dev-business-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'dev-test-business',
  'Developer Test Business',
  'electrician',
  'London',
  id,
  true,
  'paid'
FROM auth.users
WHERE email = 'bennett.b.walter@gmail.com'
ON CONFLICT (slug) DO UPDATE SET
  owner_user_id = (SELECT id FROM auth.users WHERE email = 'bennett.b.walter@gmail.com'),
  is_premium = true,
  tier = 'paid';

-- Verify it worked
SELECT 'SUCCESS! Business created for ' || email || ' with ID: ' || b.id as result
FROM businesses b
JOIN auth.users u ON b.owner_user_id = u.id
WHERE u.email = 'bennett.b.walter@gmail.com';
