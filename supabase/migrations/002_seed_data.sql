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
('birmingham-lock-1', NULL, 'Tom H.', 5, 'Lockout救星!', 'Locked myself out at 1am. They came within 20 minutes and didnt charge extra for the late hour. Amazing!', true);

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
