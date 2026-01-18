const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Reno': { lat: 39.5296, lng: -119.8138 },
    'Toledo': { lat: 41.6528, lng: -83.5379 },
    'Chula Vista': { lat: 32.6401, lng: -117.0842 },
    'Winston-Salem': { lat: 36.0999, lng: -80.2442 },
    'North Las Vegas': { lat: 36.1989, lng: -115.1175 },
    'Irving': { lat: 32.8140, lng: -96.9489 },
    'Chesapeake': { lat: 36.7682, lng: -76.2875 },
    'Scottsdale': { lat: 33.4942, lng: -111.9261 },
    'Glendale': { lat: 33.5387, lng: -112.1860 },
    'Norfolk': { lat: 36.8508, lng: -76.2859 },
    'Fremont': { lat: 37.5485, lng: -121.9886 },
    'Santa Clarita': { lat: 34.3917, lng: -118.5426 },
    'San Bernardino': { lat: 34.1083, lng: -117.2898 },
    'Hialeah': { lat: 25.8576, lng: -80.2781 },
    'Garland': { lat: 32.9126, lng: -96.6389 }
};

const cities = Object.keys(cityCoords);
const trade = 'breakdown';

async function importData() {
    console.log(`🚀 Starting Phase 10 Batch 6 Breakdown Import...`);

    for (const city of cities) {
        const fileName = `${city.toLowerCase().replace(/\s/g, '').replace(/-/g, '')}_breakdown_real.json`;
        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { lat, lng } = cityCoords[city];

        for (const business of data) {
            // Generate slug - adding trade to avoid collisions
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/\s/g, '').replace(/-/g, '')}-${trade}`;

            // Add random offset to coordinates
            const offsetLat = lat + (Math.random() - 0.5) * 0.1;
            const offsetLng = lng + (Math.random() - 0.5) * 0.1;

            const { error } = await supabase.from('businesses').upsert({
                id: `${city.toLowerCase().replace(/\s/g, '').replace(/-/g, '')}-breakdown-${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: business.name,
                slug: slug,
                trade: trade,
                city: city,
                country_code: 'US',
                phone: business.phone,
                address: business.address,
                latitude: offsetLat,
                longitude: offsetLng,
                verified: true,
                tier: 'free',
                rating: business.rating,
                review_count: business.review_count,
                is_available_now: true,
                hours: '24/7'
            });

            if (error) {
                console.error(`❌ Error importing ${business.name} in ${city}:`, error.message);
            } else {
                console.log(`✅ Imported: ${business.name} (${city})`);
            }
        }
    }

    console.log('✨ Batch 6 Breakdown Import Complete!');
}

importData();
