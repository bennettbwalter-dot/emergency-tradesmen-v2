-- Add hierarchy slugs for US data structure
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city_slug TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state_slug TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_city_slug ON businesses(city_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_state_slug ON businesses(state_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_country_code ON businesses(country_code);

-- Update RLS policies if necessary (optional, but good practice)
-- Ensure checks for country_code are possible
