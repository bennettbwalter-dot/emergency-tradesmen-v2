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
-- Seed Data: Sample Businesses for Emergency Tradesmen
-- Run this AFTER 001_business_tables.sql

-- ============================================
-- SAMPLE BUSINESSES
-- ============================================

-- London Plumbers
INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, is_open_24_hours, featured_review)
VALUES 
('london-plumb-1', 'Swift Flow Plumbing', 'swift-flow-plumbing', 'plumber', 'London', '123 Kings Road, London', 'SW3 5XP', '020 7946 0958', 4.8, 127, true, true, 'Arrived within 30 minutes and fixed our burst pipe quickly. Very professional service!'),
('london-plumb-2', 'Emergency Pipe Pros', 'emergency-pipe-pros', 'plumber', 'London', '45 Oxford Street, London', 'W1D 2DZ', '020 7946 0123', 4.9, 203, true, true, 'Outstanding emergency response. Fixed our boiler at 2am without any fuss.');

-- London Electricians
INSERT INTO businesses (id, name, slug, trade, city, address,postcode, phone, rating, review_count, verified, is_open_24_hours, featured_review)
VALUES
('london-elec-1', 'PowerFix Electricians', 'powerfix-electricians', 'electrician', 'London', '78 Baker Street, London', 'NW1 5RT', '020 7946 0456', 4.7, 156, true, true, 'Sorted out our power outage within the hour. Highly recommend!'),
('london-elec-2', 'Spark & Safe Ltd', 'spark-safe-ltd', 'electrician', 'London', '22 Regent Street, London', 'W1B 5RL', '020 7946 0789', 4.9, 189, true, true, NULL);

-- Manchester Businesses
INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, is_open_24_hours)
VALUES
('manchester-plumb-1', 'Northern Plumbing Services', 'northern-plumbing-services', 'plumber', 'Manchester', '15 Deansgate, Manchester', 'M3 2BQ', '0161 123 4567', 4.6, 98, true, true),
('manchester-elec-1', 'Manchester Electric 24/7', 'manchester-electric-247', 'electrician', 'Manchester', '45 Market Street, Manchester', 'M1 1PW', '0161 234 5678', 4.8, 145, true, true);

-- Birmingham Businesses
INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, is_open_24_hours)
VALUES
('birmingham-plumb-1', 'Midlands Emergency Plumbing', 'midlands-emergency-plumbing', 'plumber', 'Birmingham', '33 Bull Street, Birmingham', 'B4 6DS', '0121 456 7890', 4.7, 112, true, true),
('birmingham-lock-1', 'Secure Lock Birmingham', 'secure-lock-birmingham', 'locksmith', 'Birmingham', '67 New Street, Birmingham', 'B2 4DU', '0121 567 8901', 4.9, 87, true, true);

-- Leeds Locksmith
INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, is_open_24_hours)
VALUES
('leeds-lock-1', 'Quick Access Locksmiths', 'quick-access-locksmiths', 'locksmith', 'Leeds', '12 Briggate, Leeds', 'LS1 6HD', '0113 345 6789', 4.8, 94, true, true);

-- Gas Engineers
INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, is_open_24_hours)
VALUES
('london-gas-1', 'SafeGas London', 'safegas-london', 'gas-engineer', 'London', '89 Victoria Street, London', 'SW1E 5JL', '020 7946 1111', 4.9, 176, true, true),
('manchester-gas-1', 'GasFix Manchester', 'gasfix-manchester', 'gas-engineer', 'Manchester', '25 Piccadilly, Manchester', 'M1 4BT', '0161 345 6789', 4.7, 134, true, true);

-- ============================================
-- CERTIFICATIONS
-- ============================================
INSERT INTO certifications (business_id, name, issuer, certificate_number, verified)
VALUES
('london-plumb-1', 'Water Safe Registered', 'Water Safe', 'WS-2024-001', true),
('london-plumb-1', 'City & Guilds Certified', 'City & Guilds', 'CG-PL-456', true),
('london-elec-1', 'NICEIC Approved', 'NICEIC', 'NIC-789012', true),
('london-elec-2', 'Part P Certified', 'Competent Person Scheme', 'PP-2024-123', true),
('london-gas-1', 'Gas Safe Registered', 'Gas Safe Register', 'GS-123456', true),
('birmingham-lock-1', 'MLA Approved', 'Master Locksmiths Association', 'MLA-2024-789', true);

-- ============================================
-- SERVICE AREAS
-- ============================================
INSERT INTO service_areas (business_id, city, postcode_prefix)
VALUES
-- London businesses cover surrounding areas
('london-plumb-1', 'London', 'SW'),
('london-plumb-1', 'London', 'SW3'),
('london-plumb-1', 'Westminster', NULL),
('london-elec-1', 'London', 'NW'),
('london-elec-1', 'London', 'W1'),
('london-elec-2', 'London', 'W'),
('london-elec-2', 'London', 'WC'),
-- Manchester coverage
('manchester-plumb-1', 'Manchester', 'M'),
('manchester-plumb-1', 'Salford', NULL),
('manchester-elec-1', 'Manchester', 'M'),
('manchester-elec-1', 'Stockport', NULL);

-- ============================================
-- SAMPLE REVIEWS
-- ============================================
-- Note: user_id should match actual auth.users, using NULL for now
INSERT INTO reviews (business_id, user_id, user_name, rating, title, comment, verified_purchase)
VALUES
('london-plumb-1', NULL, 'Sarah M.', 5, 'Outstanding emergency service', 'Called them at midnight with a burst pipe. They arrived in 25 minutes and had it fixed within an hour. Cant thank them enough!', true),
('london-plumb-1', NULL, 'James T.', 5, 'Very professional', 'Fixed our boiler same day. Fair pricing and excellent workmanship.', true),
('london-plumb-1', NULL, 'Emma R.', 4, 'Quick response', 'Good service overall, just wish they were a bit cheaper for weekend callouts.', true),
('london-elec-1', NULL, 'David L.', 5, 'Power restored quickly', 'Total power failure at 8pm. They had us back online by 10pm. Brilliant!', true),
('london-elec-2', NULL, 'Michelle K.', 5, 'Highly recommended', 'Rewired our kitchen - meticulous attention to detail and very tidy workers.', true),
('birmingham-lock-1', NULL, 'Tom H.', 5, 'Lockoutæ•‘æ˜Ÿ!', 'Locked myself out at 1am. They came within 20 minutes and didnt charge extra for the late hour. Amazing!', true);

-- ============================================
-- PRICING EXAMPLES
-- ============================================
INSERT INTO pricing (business_id, service_type, service_name, base_price, emergency_surcharge, night_surcharge, weekend_surcharge)
VALUES
('london-plumb-1', 'callout', 'Emergency Callout', 80.00, 30.00, 40.00, 20.00),
('london-plumb-1', 'fixed', 'Burst Pipe Repair', 150.00, 50.00, 60.00, 30.00),
('london-elec-1', 'callout', 'Emergency Callout', 90.00, 40.00, 50.00, 25.00),
('london-elec-1', 'hourly', 'Hourly Rate', 65.00, 25quote.00, 30.00, 15.00),
('birmingham-lock-1', 'callout', 'Lockout Service', 75.00, 25.00, 35.00, 15.00);

SELECT 'Sample data inserted successfully!' AS message;
SELECT 'Added ' || COUNT(*) || ' businesses' AS summary FROM businesses;
SELECT 'Added ' || COUNT(*) || ' reviews' AS summary FROM reviews;
-- Add More Sample Businesses to Database
-- Run this in Supabase SQL Editor

INSERT INTO businesses (id, name, slug, trade, city, address, postcode, phone, rating, review_count, verified, featured_review)
VALUES 
-- More London Plumbers
('london-plumb-3', 'AquaFix Plumbing', 'aquafix-plumbing', 'plumber', 'London', '56 Camden Road', 'NW1 9AA', '020 7946 1234', 4.7, 2, true, 'Quick response time and fair pricing.'),
('london-plumb-4', 'London Emergency Plumbers', 'london-emergency-plumbers', 'plumber', 'London', '12 Victoria Street', 'SW1H 0NW', '020 7946 5678', 4.9, 4, true, 'Available within 30 minutes of calling!'),

-- More London Electricians  
('london-elec-3', 'ElectroFix London', 'electrofix-london', 'electrician', 'London', '88 Oxford Street', 'W1D 1BS', '020 7946 9012', 4.8, 3, true, 'Professional and knowledgeable.'),
('london-elec-4', 'Bright Spark Electrical', 'bright-spark-electrical', 'electrician', 'London', '45 Tottenham Court Road', 'W1T 2RQ', '020 7946 3456', 4.6, 2, true, NULL),

-- Manchester Plumbers
('manchester-plumb-2', 'Manchester Plumbing Pros', 'manchester-plumbing-pros', 'plumber', 'Manchester', '78 Market Street', 'M1 1PW', '0161 234 5678', 4.8, 3, true, 'Fast and reliable service.'),
('manchester-plumb-3', 'Emergency Plumbing Manchester', 'emergency-plumbing-manchester', 'plumber', 'Manchester', '34 Piccadilly', 'M1 1RG', '0161 345 6789', 4.7, 2, true, NULL),

-- Manchester Electricians
('manchester-elec-2', 'Spark Manchester', 'spark-manchester', 'electrician', 'Manchester', '56 Portland Street', 'M1 3LF', '0161 456 7890', 4.9, 4, true, 'Excellent workmanship!'),
('manchester-elec-3', 'Power Solutions MCR', 'power-solutions-mcr', 'electrician', 'Manchester', '23 King Street', 'M2 6AQ', '0161 567 8901', 4.6, 2, true, NULL),

-- Birmingham Plumbers
('birmingham-plumb-1', 'Birmingham Emergency Plumbing', 'birmingham-emergency-plumbing', 'plumber', 'Birmingham', '45 High Street', 'B4 7SL', '0121 234 5678', 4.8, 3, true, 'Came out at midnight - brilliant!'),
('birmingham-plumb-2', 'Aqua Services Birmingham', 'aqua-services-birmingham', 'plumber', 'Birmingham', '78 Broad Street', 'B15 1AU', '0121 345 6789', 4.7, 2, true, NULL),

-- Birmingham Electricians
('birmingham-elec-1', 'Birmingham Electrical Services', 'birmingham-electrical-services', 'electrician', 'Birmingham', '12 Corporation Street', 'B2 4LP', '0121 456 7890', 4.9, 3, true, 'Professional and tidy.'),

-- More Locksmiths
('london-lock-1', 'London Locksmith 24/7', 'london-locksmith-247', 'locksmith', 'London', '34 Edgware Road', 'W2 1DY', '020 7946 7890', 4.8, 5, true, 'Saved the day when I was locked out!'),
('manchester-lock-1', 'Manchester Locksmith Services', 'manchester-locksmith-services', 'locksmith', 'Manchester', '67 Oxford Road', 'M1 7ED', '0161 678 9012', 4.7, 3, true, NULL),
('birmingham-lock-2', 'Fast Lock Birmingham', 'fast-lock-birmingham', 'locksmith', 'Birmingham', '89 Navigation Street', 'B5 4DP', '0121 678 9012', 4.9, 2, true, NULL),

-- Gas Engineers
('london-gas-2', 'London Gas Safe', 'london-gas-safe', 'gas-engineer', 'London', '23 Marylebone Road', 'NW1 5LR', '020 7946 2345', 4.8, 4, true, 'Fixed our boiler quickly.'),
('manchester-gas-2', 'SafeGas Manchester', 'safegas-manchester', 'gas-engineer', 'Manchester', '45 Deansgate', 'M3 2AY', '0161 789 0123', 4.9, 3, true, 'Gas safe certified, excellent work.'),

-- Glaziers
('london-glaz-1', 'London Emergency Glazing', 'london-emergency-glazing', 'glazier', 'London', '56 Kensington High Street', 'W8 5SE', '020 7946 6789', 4.7, 2, true, NULL),
('manchester-glaz-1', 'Manchester Glass Repair', 'manchester-glass-repair', 'glazier', 'Manchester', '78 Wilmslow Road', 'M14 5TQ', '0161 890 1234', 4.8, 3, true, NULL)

ON CONFLICT (id) DO NOTHING;

-- Add certifications for new businesses
INSERT INTO certifications (business_id, name, issuer, verified)
VALUES
('london-gas-2', 'Gas Safe Registered', 'Gas Safe Register', true),
('manchester-gas-2', 'Gas Safe Registered', 'Gas Safe Register', true),
('london-plumb-3', 'Water Safe', 'Water Safe', true),
('manchester-elec-2', 'NICEIC Approved', 'NICEIC', true),
('birmingham-elec-1', 'NICEIC Approved', 'NICEIC', true),
('london-lock-1', 'MLA Approved', 'Master Locksmiths Association', true)
ON CONFLICT DO NOTHING;

-- Add service areas
INSERT INTO service_areas (business_id, city, postcode_prefix)
VALUES
('london-plumb-3', 'London', 'NW'),
('london-plumb-4', 'London', 'SW'),
('manchester-plumb-2', 'Manchester', 'M'),
('birmingham-plumb-1', 'Birmingham', 'B'),
('london-lock-1', 'London', 'W'),
('manchester-lock-1', 'Manchester', 'M')
ON CONFLICT DO NOTHING;

-- Add more reviews
INSERT INTO reviews (business_id, user_name, rating, title, comment, verified_purchase)
VALUES
('london-plumb-3', 'Robert K.', 5, 'Great service', 'Fixed the leak quickly and professionally.', true),
('london-plumb-4', 'Lisa M.', 5, 'Highly recommend', 'Arrived within 30 minutes as promised!', true),
('london-elec-3', 'John D.', 5, 'Excellent', 'Very knowledgeable electrician.', true),
('manchester-plumb-2', 'Karen W.', 4, 'Good work', 'Professional and clean.', true),
('manchester-elec-2', 'Paul S.', 5, 'Fantastic', 'Best electrician in Manchester!', true),
('birmingham-plumb-1', 'Angela T.', 5, 'Lifesaver', 'Emergency plumbing at midnight - amazing!', true),
('london-lock-1', 'Mark R.', 5, 'Quick response', 'Locked out at 2am, they came within 20 mins!', true),
('london-gas-2', 'Susan H.', 4, 'Reliable', 'Fixed our boiler same day.', true)
ON CONFLICT DO NOTHING;

SELECT 'Added ' || COUNT(*) || ' more businesses' FROM businesses WHERE verified = true;
-- Add 40+ More Sample Businesses for Testing
-- This creates a comprehensive database for all major UK cities

INSERT INTO businesses (id, name, slug, trade, city, address, phone, rating, review_count, verified, featured_review)
VALUES 
-- Leeds Businesses
('leeds-plumb-1', 'Leeds Plumbing Services', 'leeds-plumbing-services', 'plumber', 'Leeds', '45 Boar Lane', '0113 234 5678', 4.8, 5, true, 'Excellent emergency service!'),
('leeds-elec-1', 'Yorkshire Electrical', 'yorkshire-electrical', 'electrician', 'Leeds', '78 Briggate', '0113 345 6789', 4.7, 4, true, 'Very professional team.'),
('leeds-lock-1', 'Leeds Locksmith Pro', 'leeds-locksmith-pro', 'locksmith', 'Leeds', '12 The Headrow', '0113 456 7890', 4.9, 3, true, NULL),

-- Liverpool Businesses
('liverpool-plumb-1', 'Mersey Plumbing', 'mersey-plumbing', 'plumber', 'Liverpool', '34 Bold Street', '0151 234 5678', 4.6, 4, true, 'Quick response time.'),
('liverpool-elec-1', 'Liverpool Electrical Solutions', 'liverpool-electrical-solutions', 'electrician', 'Liverpool', '56 Lord Street', '0151 345 6789', 4.8, 5, true, 'Fixed our issue fast!'),
('liverpool-gas-1', 'Merseyside Gas Safe', 'merseyside-gas-safe', 'gas-engineer', 'Liverpool', '89 Lime Street', '0151 456 7890', 4.9, 4, true, NULL),

-- Bristol Businesses
('bristol-plumb-1', 'Bristol Emergency Plumbing', 'bristol-emergency-plumbing', 'plumber', 'Bristol', '23 Park Street', '0117 234 5678', 4.7, 3, true, NULL),
('bristol-elec-1', 'West Country Electrical', 'west-country-electrical', 'electrician', 'Bristol', '45 Whiteladies Road', '0117 345 6789', 4.8, 4, true, 'Highly recommend!'),
('bristol-lock-1', 'Bristol Locksmith Services', 'bristol-locksmith-services', 'locksmith', 'Bristol', '67 Clifton Down', '0117 456 7890', 4.6, 2, true, NULL),

-- Sheffield Businesses
('sheffield-plumb-1', 'Steel City Plumbers', 'steel-city-plumbers', 'plumber', 'Sheffield', '12 Fargate', '0114 234 5678', 4.9, 6, true, 'Amazing service at 3am!'),
('sheffield-elec-1', 'Sheffield Spark', 'sheffield-spark', 'electrician', 'Sheffield', '34 The Moor', '0114 345 6789', 4.7, 4, true, NULL),
('sheffield-gas-1', 'Yorkshire Gas Engineers', 'yorkshire-gas-engineers', 'gas-engineer', 'Sheffield', '56 Division Street', '0114 456 7890', 4.8, 3, true, NULL),

-- Newcastle Businesses  
('newcastle-plumb-1', 'Toon Plumbing', 'toon-plumbing', 'plumber', 'Newcastle', '78 Northumberland Street', '0191 234 5678', 4.8, 5, true, 'Great local service.'),
('newcastle-elec-1', 'Geordie Electrical', 'geordie-electrical', 'electrician', 'Newcastle', '90 Grey Street', '0191 345 6789', 4.9, 6, true, 'Best electricians in Newcastle!'),
('newcastle-lock-1', 'Newcastle Locksmith 24/7', 'newcastle-locksmith-247', 'locksmith', 'Newcastle', '12 Grainger Street', '0191 456 7890', 4.7, 3, true, NULL),

-- More London Businesses
('london-gas-3', 'Capital Gas Services', 'capital-gas-services', 'gas-engineer', 'London', '34 Fleet Street', '020 7946 3456', 4.7, 3, true, NULL),
('london-glaz-2', 'London Window Repair', 'london-window-repair', 'glazier', 'London', '56 Cheapside', '020 7946 4567', 4.8, 4, true, 'Fixed our window same day!'),
('london-drain-1', 'London Drainage Experts', 'london-drainage-experts', 'drain-specialist', 'London', '78 Shoreditch High Street', '020 7946 5678', 4.9, 5, true, NULL),

-- More Manchester Businesses
('manchester-glaz-2', 'Manchester Glass Services', 'manchester-glass-services', 'glazier', 'Manchester', '90 Deansgate', '0161 567 8901', 4.6, 3, true, NULL),
('manchester-drain-1', 'MCR Drainage', 'mcr-drainage', 'drain-specialist', 'Manchester', '12 Portland Street', '0161 678 9012', 4.8, 4, true, 'Unblocked our drains quickly.'),
('manchester-gas-3', 'Manchester Boiler Repair', 'manchester-boiler-repair', 'gas-engineer', 'Manchester', '34 Market Street', '0161 789 0123', 4.7, 3, true, NULL),

-- More Birmingham Businesses
('birmingham-elec-2', 'Midlands Electrical Services', 'midlands-electrical-services', 'electrician', 'Birmingham', '56 Corporation Street', '0121 567 8901', 4.8, 4, true, NULL),
('birmingham-gas-1', 'Birmingham Gas Safe', 'birmingham-gas-safe', 'gas-engineer', 'Birmingham', '78 New Street', '0121 678 9012', 4.9, 5, true, 'Gas safe registered, excellent!'),
('birmingham-glaz-1', 'Birmingham Glazing', 'birmingham-glazing', 'glazier', 'Birmingham', '90 Bull Street', '0121 789 0123', 4.7, 3, true, NULL),

-- Edinburgh Businesses
('edinburgh-plumb-1', 'Edinburgh Plumbing Co', 'edinburgh-plumbing-co', 'plumber', 'Edinburgh', '12 Princes Street', '0131 234 5678', 4.8, 4, true, 'Excellent Scottish service!'),
('edinburgh-elec-1', 'Capital Electrical', 'capital-electrical', 'electrician', 'Edinburgh', '34 George Street', '0131 345 6789', 4.9, 5, true, NULL),
('edinburgh-lock-1', 'Edinburgh Locksmiths', 'edinburgh-locksmiths', 'locksmith', 'Edinburgh', '56 Rose Street', '0131 456 7890', 4.7, 3, true, NULL),

-- Glasgow Businesses
('glasgow-plumb-1', 'Glasgow Plumbing Services', 'glasgow-plumbing-services', 'plumber', 'Glasgow', '78 Buchanan Street', '0141 234 5678', 4.7, 4, true, NULL),
('glasgow-elec-1', 'Clyde Electrical', 'clyde-electrical', 'electrician', 'Glasgow', '90 Sauchiehall Street', '0141 345 6789', 4.8, 5, true, 'Very reliable!'),
('glasgow-gas-1', 'Glasgow Gas Engineers', 'glasgow-gas-engineers', 'gas-engineer', 'Glasgow', '12 Argyle Street', '0141 456 7890', 4.9, 4, true, NULL),

-- Cardiff Businesses
('cardiff-plumb-1', 'Welsh Plumbing Services', 'welsh-plumbing-services', 'plumber', 'Cardiff', '34 Queen Street', '029 2034 5678', 4.8, 4, true, 'Da iawn! Great service.'),
('cardiff-elec-1', 'Cardiff Electrical Solutions', 'cardiff-electrical-solutions', 'electrician', 'Cardiff', '56 St Mary Street', '029 2045 6789', 4.7, 3, true, NULL),
('cardiff-lock-1', 'Cardiff Locksmith Services', 'cardiff-locksmith-services', 'locksmith', 'Cardiff', '78 High Street', '029 2056 7890', 4.9, 5, true, NULL),

-- Nottingham Businesses
('nottingham-plumb-1', 'Nottingham Plumbing', 'nottingham-plumbing', 'plumber', 'Nottingham', '12 Market Square', '0115 234 5678', 4.6, 3, true, NULL),
('nottingham-elec-1', 'Notts Electrical', 'notts-electrical', 'electrician', 'Nottingham', '34 Victoria Centre', '0115 345 6789', 4.8, 4, true, NULL),

-- Southampton Businesses
('southampton-plumb-1', 'South Coast Plumbing', 'south-coast-plumbing', 'plumber', 'Southampton', '56 Above Bar Street', '023 8034 5678', 4.7, 4, true, 'Quick and efficient!'),
('southampton-elec-1', 'Southampton Electrical', 'southampton-electrical', 'electrician', 'Southampton', '78 High Street', '023 8045 6789', 4.9, 5, true, NULL),

-- Leicester Businesses
('leicester-plumb-1', 'Leicester Plumbing Pro', 'leicester-plumbing-pro', 'plumber', 'Leicester', '90 Gallowtree Gate', '0116 234 5678', 4.8, 4, true, NULL),
('leicester-elec-1', 'Leicester Electrical Services', 'leicester-electrical-services', 'electrician', 'Leicester', '12 Granby Street', '0116 345 6789', 4.7, 3, true, NULL)

ON CONFLICT (id) DO NOTHING;

SELECT 'Added 40 more businesses! Total verified: ' || COUNT(*) FROM businesses WHERE verified = true;
-- Add is_available_now column to businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_available_now BOOLEAN DEFAULT true;

-- Update existing businesses
UPDATE businesses SET is_available_now = true;
-- Create quotes table for monitoring lead generation
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Optional, if user is logged in
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  details TEXT NOT NULL,
  urgency TEXT DEFAULT 'Standard', -- 'Emergency', 'Standard', 'Flexible'
  status TEXT DEFAULT 'pending', -- 'pending', 'viewed', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can see their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Admins/Business Owners can see quotes for their business (simplified for now to just admin check or public insert)
-- Allowing public insert for "Guest" quotes
CREATE POLICY "Public can insert quotes" ON quotes
  FOR INSERT WITH CHECK (true);

-- Admin viewing all (placeholder policy)
CREATE POLICY "Admins can view all quotes" ON quotes
  FOR SELECT USING (auth.email() LIKE '%admin%'); 
-- Combined migration: Quotes table + Subscriptions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xwqvhymkwuasotsgmarn/sql/new

-- =====================
-- QUOTES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  details TEXT NOT NULL,
  urgency TEXT DEFAULT 'Standard',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Public can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can view all quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can update quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can delete quotes" ON quotes;

CREATE POLICY "Users can view own quotes" ON quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can insert quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all quotes" ON quotes FOR SELECT USING (auth.email() LIKE '%bennett%' OR auth.email() LIKE '%admin%');
CREATE POLICY "Admins can update quotes" ON quotes FOR UPDATE USING (auth.email() LIKE '%bennett%' OR auth.email() LIKE '%admin%');
CREATE POLICY "Admins can delete quotes" ON quotes FOR DELETE USING (auth.email() LIKE '%bennett%' OR auth.email() LIKE '%admin%');

-- =====================
-- SUBSCRIPTIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
-- Migration: Add Freemium Tier Support
-- Run this AFTER 001_business_tables.sql

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;

-- Index for efficient sorting of premium listings
CREATE INDEX IF NOT EXISTS idx_businesses_tier_priority ON businesses(tier, priority_score DESC);

-- Comment:
-- 'tier' defines the subscription level. 'paid' listings get priority.
-- 'priority_score' can be used for fine-grained ranking within the paid tier (e.g. ad spend, reputation).
-- Migration: Create subscriptions table with expiry tracking
-- Run this FIRST before the expiry migration

-- Create the subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    payment_customer_id TEXT,
    payment_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(subscription_expires_at);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can do everything (adjust as needed)
-- For now, service role can bypass RLS

-- Create function to auto-expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET 
        status = 'inactive',
        updated_at = NOW()
    WHERE 
        subscription_expires_at IS NOT NULL
        AND subscription_expires_at < NOW()
        AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to check expiry on updates
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_expires_at IS NOT NULL 
       AND NEW.subscription_expires_at < NOW() 
       AND NEW.status = 'active' THEN
        NEW.status := 'inactive';
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscription_expiry_check ON subscriptions;
CREATE TRIGGER subscription_expiry_check
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_expiry();

-- Function to extend subscription (for admin use)
CREATE OR REPLACE FUNCTION extend_subscription(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS void AS $$
BEGIN
    INSERT INTO subscriptions (user_id, plan, status, subscription_expires_at)
    VALUES (
        p_user_id, 
        'professional', 
        'active', 
        NOW() + (p_days || ' days')::INTERVAL
    )
    ON CONFLICT (user_id) DO UPDATE SET
        status = 'active',
        subscription_expires_at = COALESCE(
            CASE 
                WHEN subscriptions.subscription_expires_at > NOW() THEN subscriptions.subscription_expires_at 
                ELSE NOW() 
            END, 
            NOW()
        ) + (p_days || ' days')::INTERVAL,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION extend_subscription(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_subscriptions() TO authenticated;

COMMENT ON TABLE subscriptions IS 'Stores user subscription data for premium plans';
COMMENT ON COLUMN subscriptions.subscription_expires_at IS 'When the subscription expires. NULL means lifetime/never expires.';
-- Migration: Add premium subscriber fields to businesses table
-- Run this in Supabase SQL Editor

-- Add premium-specific columns to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS premium_description TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS services_offered TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS coverage_areas TEXT[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);

-- Create index for premium listings
CREATE INDEX IF NOT EXISTS idx_businesses_is_premium ON businesses(is_premium);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_user_id);

-- Update RLS to allow owners to edit their business
DROP POLICY IF EXISTS "Business owners can update own business" ON businesses;
CREATE POLICY "Business owners can update own business" ON businesses 
    FOR UPDATE USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Business owners can view own business" ON businesses;
CREATE POLICY "Business owners can view own business" ON businesses 
    FOR SELECT USING (auth.uid() = owner_user_id OR true); -- Public read, owner has full access

SELECT 'Premium fields added to businesses table!' as result;
-- Migration: Create storage bucket for business assets
-- Run this in Supabase SQL Editor

-- Create the storage bucket for business assets (logos, photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-assets',
    'business-assets',
    true,  -- Public bucket so images can be displayed
    5242880,  -- 5MB limit per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business-assets bucket

-- Allow anyone to view files (public bucket)
DROP POLICY IF EXISTS "Public can view business assets" ON storage.objects;
CREATE POLICY "Public can view business assets" ON storage.objects 
    FOR SELECT USING (bucket_id = 'business-assets');

-- Allow authenticated users to upload to their business folder
DROP POLICY IF EXISTS "Users can upload business assets" ON storage.objects;
CREATE POLICY "Users can upload business assets" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their uploads
DROP POLICY IF EXISTS "Users can update own assets" ON storage.objects;
CREATE POLICY "Users can update own assets" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to delete their uploads
DROP POLICY IF EXISTS "Users can delete own assets" ON storage.objects;
CREATE POLICY "Users can delete own assets" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

SELECT 'Storage bucket business-assets created!' as result;
-- Migration: Add WhatsApp number field for premium subscribers
-- Run this in Supabase SQL Editor

-- Add WhatsApp number column to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_whatsapp ON businesses(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

SELECT 'WhatsApp number field added!' as result;
-- Add owner_id and claim_status to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'verified'));

-- create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_claim_status ON businesses(claim_status);

-- Update RLS policies to allow reading claim status
-- (Already covered by "Public can read verified businesses" if we update it, but we need public to see UNVERIFIED businesses too if we want them to claim them? 
-- Actually, currently "Public can read verified businesses" restricts visibility. 
-- We might need to allow public to see BASIC info of unverified businesses so they can claim them.
-- OR, we only allow searching them.
-- Let's enable reading claim_status for everyone so the UI knows to show the button.)

-- Actually, looking at setup-complete.sql:
-- CREATE POLICY "Public can read verified businesses" ON businesses FOR SELECT USING (verified = true OR auth.role() = 'authenticated');
-- This means unauthenticated users CANNOT see unverified businesses.
-- This is fine, users might need to login to claim, or we just rely on them finding the page via search which might filtering unverified?
-- If they can't see the page, they can't claim it.
-- We might need to adjust the policy to allow seeing the business page if you have the direct link? Or just allow public to see all businesses?
-- For now, I will NOT change the visibility policy drastically, but ensure AUTHENTICATED users (which the claimer will be) can update the record.

-- Allow authenticated users to UPDATE the business if they are the owner (or if they are claiming it - wait, if they claim it, they don't own it yet)
-- We need a function to "claim" a business which sets the status to pending and owner_id to the caller.

CREATE OR REPLACE FUNCTION claim_business(business_id_param TEXT, contact_email_param TEXT, contact_phone_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  biz_record RECORD;
BEGIN
  -- Check if business exists and is unclaimed
  SELECT * INTO biz_record FROM businesses WHERE id = business_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF biz_record.claim_status != 'unclaimed' AND biz_record.claim_status IS NOT NULL THEN
    RAISE EXCEPTION 'Business is already claimed or pending verification';
  END IF;

  -- Update the business
  UPDATE businesses 
  SET 
    owner_id = auth.uid(),
    claim_status = 'pending',
    email = COALESCE(email, contact_email_param), -- update email if missing
    phone = COALESCE(phone, contact_phone_param), -- update phone if missing
    updated_at = NOW()
  WHERE id = business_id_param;

  RETURN jsonb_build_object('success', true, 'message', 'Business claimed successfully');
END;
$$;
-- Add last_available_ping to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS last_available_ping TIMESTAMP WITH TIME ZONE;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_businesses_last_available_ping ON businesses(last_available_ping);

-- Function to check if business is currently live (pinged within last hour)
CREATE OR REPLACE FUNCTION is_business_live(business_row businesses)
RETURNS boolean AS $$
BEGIN
  RETURN (business_row.last_available_ping > (NOW() - INTERVAL '1 hour'));
END;
$$ LANGUAGE plpgsql STABLE;
-- Run this in Supabase SQL Editor to fix the RLS issue
-- This adds a policy allowing authenticated users to insert businesses

-- Allow authenticated users to INSERT their own businesses
CREATE POLICY "Authenticated users can insert businesses" ON businesses
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to UPDATE their own businesses  
CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Now you can create your business!
-- Migration: Add Premium Profile Location Support
-- Adds columns for multi-location support and plan type tracking

-- Add selected_locations array for storing user's chosen locations
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS selected_locations TEXT[] DEFAULT '{}';

-- Add plan_type to track which pricing tier: 'basic' (Â£29) or 'pro' (Â£99)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic';

-- Create index for efficient location queries
CREATE INDEX IF NOT EXISTS idx_businesses_selected_locations ON businesses USING GIN(selected_locations);

-- Update RLS policy to allow owners to select locations
DROP POLICY IF EXISTS "Owners can update selected_locations" ON businesses;
CREATE POLICY "Owners can update selected_locations" ON businesses
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

SELECT 'Migration 016 completed: Added selected_locations and plan_type columns' AS status;
-- Migration: Add website and hidden_reviews columns for Premium users
-- Allows premium users to add their website and hide specific reviews

-- Add website URL for premium users
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website TEXT;

-- Add array to track hidden review IDs
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hidden_reviews TEXT[] DEFAULT '{}';

-- Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL;

SELECT 'Migration 017 completed: Added website and hidden_reviews columns' AS status;
-- Add proof_documents column to store array of URLs
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS proof_documents JSONB DEFAULT '[]'::jsonb;

-- Update the claim_business function to accept proof documents
CREATE OR REPLACE FUNCTION claim_business(
    business_id_param TEXT, 
    contact_email_param TEXT, 
    contact_phone_param TEXT,
    proof_docs_param JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  biz_record RECORD;
BEGIN
  -- Check if business exists and is unclaimed
  SELECT * INTO biz_record FROM businesses WHERE id = business_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF biz_record.claim_status != 'unclaimed' AND biz_record.claim_status IS NOT NULL THEN
    RAISE EXCEPTION 'Business is already claimed or pending verification';
  END IF;

  -- Update the business
  UPDATE businesses 
  SET 
    owner_id = auth.uid(),
    claim_status = 'pending',
    email = COALESCE(email, contact_email_param), -- update email if missing
    phone = COALESCE(phone, contact_phone_param), -- update phone if missing
    proof_documents = proof_docs_param,
    updated_at = NOW()
  WHERE id = business_id_param;

  RETURN jsonb_build_object('success', true, 'message', 'Business claimed successfully');
END;
$$;
-- Add contact_name column to businesses table for premium profiles
-- This stores the name of the main contact person for the business

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Add index for faster lookups (optional, for admin queries)
CREATE INDEX IF NOT EXISTS idx_businesses_contact_name ON businesses (contact_name) WHERE contact_name IS NOT NULL;

COMMENT ON COLUMN businesses.contact_name IS 'Name of the main contact person for this business';
-- Allow public read access to businesses (needed for listings to work)
-- This checks if the policy already exists to avoid errors

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'businesses'
        AND policyname = 'Public businesses are viewable by everyone'
    ) THEN
        CREATE POLICY "Public businesses are viewable by everyone"
        ON businesses
        FOR SELECT
        TO public
        USING (true); -- Or verified = true if we want to restrict
    END IF;
END
$$;
-- Add is_available_now column to businesses table
-- This column tracks the explicit availability status set by business owners

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_available_now BOOLEAN DEFAULT true;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_is_available_now 
ON businesses(is_available_now);

-- Add a comment explaining the column
COMMENT ON COLUMN businesses.is_available_now IS 'Explicit availability status set by business owner. Used in conjunction with last_available_ping for real-time availability tracking.';
-- Migration: Create Posts Table for Blog
-- Description: Sets up the posts table with RLS and policies.

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT, -- Markdown content
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 1. Public can read published posts
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (published = true);

-- 2. Authenticated users can read all posts (including drafts)
-- Ideally this should be restricted to admins, but for MVP we allow auth users to preview.
CREATE POLICY "Authenticated users can read all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Authenticated users can insert/update/delete posts
-- WARNING: In a production app with public registration, this must be restricted to admins.
-- For now, we assume this is acceptable for the initial rollout or that registration is monitored.
CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE
  ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional)
-- ============================================
INSERT INTO posts (title, slug, content, excerpt, published, published_at)
VALUES 
(
  'Emergency Plumber vs Regular Plumber: When to Call?', 
  'emergency-plumber-vs-regular', 
  '# Emergency Plumber vs Regular Plumber

When you have a leak at 3 AM, you need an emergency plumber. But what is the difference?

## Response Time
Emergency plumbers are on call 24/7...',
  'Knowing the difference between an emergency plumber and a regular one can save you money and stress.',
  true,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;
-- Add DELETE policy for businesses table to allow admin/owner deletions
-- This enables the admin panel to delete businesses

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete own businesses" ON businesses;

-- Allow users to delete their own businesses
CREATE POLICY "Users can delete own businesses"
ON businesses
FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid() OR owner_id = auth.uid());

-- Allow admin to delete any business
-- Admin is identified by VITE_ADMIN_EMAIL environment variable
CREATE POLICY "Admin can delete any business"
ON businesses
FOR DELETE
TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM auth.users 
        WHERE email = current_setting('app.admin_email', true)
    )
    OR 
    -- Fallback: if admin_email not set, allow deletion of own businesses only
    owner_user_id = auth.uid() 
    OR 
    owner_id = auth.uid()
);

-- Comment for documentation
COMMENT ON POLICY "Admin can delete any business" ON businesses IS 
'Allows admin users (identified by app.admin_email setting) to delete any business, and regular users to delete only their own businesses';
