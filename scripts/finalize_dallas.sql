-- RUN THIS IN SUPABASE SQL EDITOR TO ACTIVATE DALLAS DATA
-- 1. Reload the schema cache
NOTIFY pgrst, 'reload config';

-- 2. Wait 5 seconds...

-- 3. Update the Dallas businesses to the correct country and verify them
UPDATE businesses 
SET country_code = 'US', verified = true 
WHERE city = 'Dallas' AND country_code = 'GB';

-- 4. Verify the counts
SELECT trade, count(*) 
FROM businesses 
WHERE city = 'Dallas' AND country_code = 'US'
GROUP BY trade;
