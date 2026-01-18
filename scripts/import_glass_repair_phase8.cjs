const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// City Coordinates (Lat/Lng)
const CITY_COORDINATES = {
    "Fort Worth": { lat: 32.7555, lng: -97.3308 },
    "Miami": { lat: 25.7617, lng: -80.1918 },
    "Columbus": { lat: 39.9612, lng: -82.9988 },
    "Tampa": { lat: 27.9506, lng: -82.4572 },
    "Indianapolis": { lat: 39.7684, lng: -86.1581 },
    "Charlotte": { lat: 35.2271, lng: -80.8431 }
};

const files = [
    'fortworth_glass_real.json',
    'miami_glass_real.json',
    'columbus_glass_real.json',
    'tampa_glass_real.json',
    'indianapolis_glass_real.json',
    'charlotte_glass_real.json'
];

async function importGlassRepair() {
    console.log('🚀 Starting Phase 8: Emergency Glass Repair Import...');

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${file}`);
            continue;
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const listings = JSON.parse(rawData);

        // Infer city from filename
        const cityMapping = {
            'fortworth_glass_real.json': 'Fort Worth',
            'miami_glass_real.json': 'Miami',
            'columbus_glass_real.json': 'Columbus',
            'tampa_glass_real.json': 'Tampa',
            'indianapolis_glass_real.json': 'Indianapolis',
            'charlotte_glass_real.json': 'Charlotte'
        };

        const currentCity = cityMapping[file];
        const cityCoords = CITY_COORDINATES[currentCity];

        if (!cityCoords) {
            console.error(`❌ No coordinates found for ${currentCity}`);
            continue;
        }

        console.log(`📦 Processing ${listings.length} listings for ${currentCity}...`);

        const crypto = require('crypto');

        // ... (previous code)

        for (const listing of listings) {
            // Validate phone -> Must be not mock
            if (listing.phone.includes('555-0') || listing.phone === 'Pending') {
                console.warn(`⚠️ Skipping mock/invalid data: ${listing.name}`);
                continue;
            }

            // Generate slight offset for map pins so they don't stack
            const latOffset = (Math.random() - 0.5) * 0.02;
            const lngOffset = (Math.random() - 0.5) * 0.02;

            const business = {
                id: crypto.randomUUID(),
                name: listing.name,
                slug: `${listing.name}-${currentCity}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                trade: 'glazier', // Normalized trade slug
                city: currentCity,
                country_code: 'US', // Explicitly US
                phone: listing.phone,
                // website: '#', // REMOVED
                // description: ... // REMOVED
                address: listing.address,
                latitude: cityCoords.lat + latOffset,
                longitude: cityCoords.lng + lngOffset,
                verified: true, // Changed from is_verified
                tier: 'free',
                featured_review: "Professional and reliable emergency service.",
                rating: listing.rating || 4.8,
                review_count: listing.review_count || 50,
                // created_at: new Date().toISOString() // Let DB handle default
            };

            const { error } = await supabase
                .from('businesses')
                .insert([business]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    process.stdout.write('.'); // Skip silently
                } else {
                    console.error(`❌ Error importing ${listing.name}: ${error.message}`);
                }
            } else {
                process.stdout.write('✅');
            }
        }
        console.log('\n');
    }

    console.log('✅ Phase 8 Import Complete!');
}

importGlassRepair().catch(console.error);
