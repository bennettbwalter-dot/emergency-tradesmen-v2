-- Migration: Add Business Management Tables
-- Run this AFTER schema.sql

-- ============================================
-- BUSINESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY, -- Keep as TEXT to match existing system (e.g., "luton-elec-1")
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  trade TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT DEFAULT '24/7 Emergency Service',
  is_open_24_hours BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  featured_review TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BUSINESS PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CERTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  certificate_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE AREAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  postcode_prefix TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, city, postcode_prefix)
);

-- ============================================
-- PRICING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  service_name TEXT,
  base_price DECIMAL(10,2),
  emergency_surcharge DECIMAL(10,2) DEFAULT 0,
  night_surcharge DECIMAL(10,2) DEFAULT 0,
  weekend_surcharge DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_businesses_trade ON businesses(trade);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(verified);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_business_photos_business_id ON business_photos(business_id);
CREATE INDEX IF NOT EXISTS idx_certifications_business_id ON certifications(business_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_business_id ON service_areas(business_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Public can read verified businesses
CREATE POLICY "Public can read verified businesses" ON businesses
  FOR SELECT USING (verified = true);

-- Authenticated users can read all businesses
CREATE POLICY "Authenticated users can read all businesses" ON businesses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Photos are publicly readable
CREATE POLICY "Public can read business photos" ON business_photos
  FOR SELECT USING (true);

-- Certifications are publicly readable
CREATE POLICY "Public can read certifications" ON certifications
  FOR SELECT USING (true);

-- Service areas are publicly readable
CREATE POLICY "Public can read service areas" ON service_areas
  FOR SELECT USING (true);

-- Pricing is publicly readable
CREATE POLICY "Public can read pricing" ON pricing
  FOR SELECT USING (true);

-- ============================================
-- UPDATE EXISTING REVIEWS TABLE
-- ============================================
-- Add additional columns to existing reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE
  ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE
  ON pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update business rating when reviews change
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ),
    featured_review = (
      SELECT comment
      FROM reviews
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
        AND comment IS NOT NULL
        AND comment != ''
      ORDER BY rating DESC, created_at DESC
      LIMIT 1
    )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_rating_on_review_insert AFTER INSERT
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER update_rating_on_review_update AFTER UPDATE
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

CREATE TRIGGER update_rating_on_review_delete AFTER DELETE
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================
-- ADMIN CHECK FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Add admin emails here
  RETURN user_email IN (
    'admin@example.com'
  );
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

SELECT 'Migration completed successfully!' AS message;
