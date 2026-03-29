-- ============================================
-- EMERGENCY TRADESMEN - COMPLETE DATABASE SETUP
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This will create all tables, security policies, and sample data

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- BUSINESSES TABLE (using TEXT id to match existing system)
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  trade TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
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

-- BUSINESS PHOTOS
CREATE TABLE IF NOT EXISTS business_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CERTIFICATIONS
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  certificate_number TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SERVICE AREAS
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  postcode_prefix TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, city, postcode_prefix)
);

-- PRICING
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

-- UPDATE EXISTING REVIEWS TABLE
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT;

-- ============================================
-- 2. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_businesses_trade ON businesses(trade);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(verified);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE SECURITY POLICIES
-- ============================================

-- Public can read verified businesses
DROP POLICY IF EXISTS "Public can read verified businesses" ON businesses;
CREATE POLICY "Public can read verified businesses" ON businesses
  FOR SELECT USING (verified = true OR auth.role() = 'authenticated');

-- Photos are public
DROP POLICY IF EXISTS "Public can read business photos" ON business_photos;
CREATE POLICY "Public can read business photos" ON business_photos
  FOR SELECT USING (true);

-- Certifications are public
DROP POLICY IF EXISTS "Public can read certifications" ON certifications;
CREATE POLICY "Public can read certifications" ON certifications
  FOR SELECT USING (true);

-- Service areas are public
DROP POLICY IF EXISTS "Public can read service areas" ON service_areas;
CREATE POLICY "Public can read service areas" ON service_areas
  FOR SELECT USING (true);

-- Pricing is public
DROP POLICY IF EXISTS "Public can read pricing" ON pricing;
CREATE POLICY "Public can read pricing" ON pricing
  FOR SELECT USING (true);

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE
  ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_updated_at ON pricing;
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE
  ON pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update business ratings
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET 
    rating = COALESCE((
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM reviews 
      WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
    ), 5.0),
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

DROP TRIGGER IF EXISTS update_rating_on_review_insert ON reviews;
CREATE TRIGGER update_rating_on_review_insert AFTER INSERT
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_update ON reviews;
CREATE TRIGGER update_rating_on_review_update AFTER UPDATE
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_delete ON reviews;
CREATE TRIGGER update_rating_on_review_delete AFTER DELETE
  ON reviews FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================
-- 6. INSERT SAMPLE DATA
-- ============================================

-- Sample Businesses
INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, featured_review)
VALUES 
('london-plumb-1', 'Swift Flow Plumbing', 'swift-flow-plumbing', 'plumber', 'London', '123 Kings Road', 'SW3 5XP', '020 7946 0958', 4.8, 3, true, 'Arrived within 30 minutes and fixed our burst pipe quickly!'),
('london-plumb-2', 'Emergency Pipe Pros', 'emergency-pipe-pros', 'plumber', 'London', '45 Oxford Street', 'W1D 2DZ', '020 7946 0123', 4.9, 2, true, 'Outstanding emergency response at 2am.'),
('london-elec-1', 'PowerFix Electricians', 'powerfix-electricians', 'electrician', 'London', '78 Baker Street', 'NW1 5RT', '020 7946 0456', 4.7, 2, true, 'Sorted out our power outage within the hour!'),
('london-elec-2', 'Spark & Safe Ltd', 'spark-safe-ltd', 'electrician', 'London', '22 Regent Street', 'W1B 5RL', '020 7946 0789', 4.9, 1, true, NULL),
('manchester-plumb-1', 'Northern Plumbing', 'northern-plumbing', 'plumber', 'Manchester', '15 Deansgate', 'M3 2BQ', '0161 123 4567', 4.6, 0, true, NULL),
('birmingham-lock-1', 'Secure Lock Birmingham', 'secure-lock-birmingham', 'locksmith', 'Birmingham', '67 New Street', 'B2 4DU', '0121 567 8901', 4.9, 1, true, 'Lockout rescue at 1am - amazing!')
ON CONFLICT (id) DO NOTHING;

-- Certifications
INSERT INTO certifications (business_id, name, issuer, verified)
VALUES
('london-plumb-1', 'Water Safe Registered', 'Water Safe', true),
('london-elec-1', 'NICEIC Approved', 'NICEIC', true),
('birmingham-lock-1', 'MLA Approved', 'Master Locksmiths Association', true)
ON CONFLICT DO NOTHING;

-- Service Areas
INSERT INTO service_areas (business_id, city, postcode_prefix)
VALUES
('london-plumb-1', 'London', 'SW'),
('london-plumb-1', 'Westminster', NULL),
('london-elec-1', 'London', 'NW'),
('manchester-plumb-1', 'Manchester', 'M')
ON CONFLICT DO NOTHING;

-- Sample Reviews
INSERT INTO reviews (business_id, user_name, rating, title, comment, verified_purchase)
VALUES
('london-plumb-1', 'Sarah M.', 5, 'Outstanding emergency service', 'Called them at midnight with a burst pipe. Arrived in 25 minutes!', true),
('london-plumb-1', 'James T.', 5, 'Very professional', 'Fixed our boiler same day. Fair pricing.', true),
('london-plumb-1', 'Emma R.', 4, 'Quick response', 'Good service overall.', true),
('london-plumb-2', 'David L.', 5, 'Power restored quickly', 'Total power failure at 8pm. Back online by 10pm!', true),
('london-plumb-2', 'Michelle K.', 5, 'Highly recommended', 'Rewired our kitchen perfectly.', true),
('london-elec-1', 'Tom H.', 5, 'Excellent', 'Fixed electrical issue quickly.', true),
('london-elec-1', 'Jane D.', 4, 'Good work', 'Professional and tidy.', true),
('london-elec-2', 'Mike R.', 5, 'Fantastic', 'Best electrician in London!', true),
('birmingham-lock-1', 'Sophie L.', 5, 'Lifesaver', 'Locked out at 1am. Came within 20 minutes!', true)
ON CONFLICT DO NOTHING;

-- Pricing
INSERT INTO pricing (business_id, service_type, service_name, base_price, emergency_surcharge, night_surcharge)
VALUES
('london-plumb-1', 'callout', 'Emergency Callout', 80.00, 30.00, 40.00),
('london-elec-1', 'callout', 'Emergency Callout', 90.00, 40.00, 50.00),
('birmingham-lock-1', 'callout', 'Lockout Service', 75.00, 25.00, 35.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
  biz_count INT;
  review_count INT;
BEGIN
  SELECT COUNT(*) INTO biz_count FROM businesses;
  SELECT COUNT(*) INTO review_count FROM reviews;
  
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📊 Created % businesses', biz_count;
  RAISE NOTICE '⭐ Created % reviews', review_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You are ready to go!';
END $$;
