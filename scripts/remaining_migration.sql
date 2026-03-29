-- Run these remaining migration commands in Supabase SQL Editor:

-- 2. Add country_code to other tables
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';

-- 3. Create performance indices
CREATE INDEX IF NOT EXISTS idx_businesses_country_code ON businesses(country_code);
CREATE INDEX IF NOT EXISTS idx_service_areas_country_code ON service_areas(country_code);

-- 4. Update existing records to GB
UPDATE businesses SET country_code = 'GB' WHERE country_code IS NULL;
UPDATE service_areas SET country_code = 'GB' WHERE country_code IS NULL;
UPDATE bookings SET country_code = 'GB' WHERE country_code IS NULL;
UPDATE reviews SET country_code = 'GB' WHERE country_code IS NULL;

-- 5. Create regional_cities table
CREATE TABLE IF NOT EXISTS regional_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    country_code TEXT NOT NULL DEFAULT 'GB',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slug, country_code)
);

CREATE INDEX IF NOT EXISTS idx_regional_cities_country ON regional_cities(country_code);

-- 6. Seed UK cities
INSERT INTO regional_cities (name, slug, country_code)
VALUES 
('London', 'london', 'GB'),
('Manchester', 'manchester', 'GB'),
('Birmingham', 'birmingham', 'GB'),
('Leeds', 'leeds', 'GB'),
('Glasgow', 'glasgow', 'GB')
ON CONFLICT (slug, country_code) DO NOTHING;

SELECT 'Migration completed!' as result;
