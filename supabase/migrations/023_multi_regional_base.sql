-- Migration: Multi-Regional Infrastructure (Phase 1)
-- Add country_code to support multiple regions (GB, US, etc.)

-- 1. Update businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';

-- 2. Update service_areas table
ALTER TABLE service_areas
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';

-- 3. Update bookings table (for future cross-region tracking)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';

-- 4. Update reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GB';

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_businesses_country_code ON businesses(country_code);
CREATE INDEX IF NOT EXISTS idx_service_areas_country_code ON service_areas(country_code);

-- Update existing records explicitly (redundant but safe)
UPDATE businesses SET country_code = 'GB' WHERE country_code IS NULL;
UPDATE service_areas SET country_code = 'GB' WHERE country_code IS NULL;
UPDATE bookings SET country_code = 'GB' WHERE country_code IS NULL;
UPDATE reviews SET country_code = 'GB' WHERE country_code IS NULL;

-- Optional: Create a cities table to manage regional cities dynamically
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

-- Seed regional_cities with current UK cities from trades.ts
-- (This is just a few examples, the full list can be imported later)
INSERT INTO regional_cities (name, slug, country_code)
VALUES 
('London', 'london', 'GB'),
('Manchester', 'manchester', 'GB'),
('Birmingham', 'birmingham', 'GB'),
('Leeds', 'leeds', 'GB'),
('Glasgow', 'glasgow', 'GB')
ON CONFLICT (slug, country_code) DO NOTHING;

SELECT 'Multi-Regional Phase 1 migration applied successfully!' as result;
