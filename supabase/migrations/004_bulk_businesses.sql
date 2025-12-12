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
