-- RUN THIS IN SUPABASE SQL EDITOR
-- This script refines the "Dallas" data by moving businesses to their actual suburbs (lowercase for routing)

-- 1. Update city names to actual suburb from address, stored in lowercase
UPDATE businesses
SET city = LOWER(split_part(split_part(address, ', ', 2), ', ', 1))
WHERE city = 'Dallas' 
  AND country_code = 'US'
  AND address LIKE '%, %, TX %';

-- 2. Verify the new city distribution
SELECT city, count(*) as business_count
FROM businesses
WHERE country_code = 'US'
GROUP BY city
ORDER BY business_count DESC;

-- 3. Check for any "dallas" remaining
SELECT trade, count(*) 
FROM businesses 
WHERE city = 'dallas' AND country_code = 'US'
GROUP BY trade;
