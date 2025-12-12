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
