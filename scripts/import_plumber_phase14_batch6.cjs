const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Reno': { lat: 39.5296, lng: -119.8138 },
    'Glendale': { lat: 33.5387, lng: -112.1860 },
    'North Las Vegas': { lat: 36.1989, lng: -115.1175 },
    'Scottsdale': { lat: 33.4942, lng: -111.9261 },
    'Winston-Salem': { lat: 36.0999, lng: -80.2442 },
    'Chesapeake': { lat: 36.7682, lng: -76.2875 },
    'Norfolk': { lat: 36.8508, lng: -76.2859 },
    'Fremont': { lat: 37.5485, lng: -121.9886 },
    'Santa Clarita': { lat: 34.3917, lng: -118.5426 },
    'Birmingham': { lat: 33.5186, lng: -86.8104 },
    'Hialeah': { lat: 25.8576, lng: -80.2781 },
    'Richmond': { lat: 37.5407, lng: -77.4360 },
    'Boise': { lat: 43.6150, lng: -116.2023 },
    'Spokane': { lat: 47.6588, lng: -117.4260 },
    'Garland': { lat: 32.9126, lng: -96.6389 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 6 Plumber Import...`);

    for (const city of cities) {
        let fileNameBase = city.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${fileNameBase}_plumber_real.json`;
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Warning: ${fileName} not found. Skipping ${city}.`);
            continue;
        }

        const rawData = fs.readFileSync(filePath);
        const businesses = JSON.parse(rawData);

        for (const biz of businesses) {
            const slug = `${biz.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${trade}`;

            // Random offset for coordinates
            const offsetLat = (Math.random() - 0.5) * 0.05;
            const offsetLng = (Math.random() - 0.5) * 0.05;

            // Generate UUID for new records
            const id = crypto.randomUUID();

            const { error } = await supabase
                .from('businesses')
                .upsert({
                    id: id,
                    name: biz.name,
                    phone: biz.phone,
                    address: biz.address,
                    city: city,
                    trade: trade,
                    slug: slug,
                    rating: biz.rating,
                    review_count: biz.review_count,
                    latitude: cityCoords[city].lat + offsetLat,
                    longitude: cityCoords[city].lng + offsetLng,
                    country_code: 'US',
                    verified: true,
                    created_at: new Date().toISOString()
                }, { onConflict: 'slug' });

            if (error) {
                console.error(`❌ Error importing ${biz.name} in ${city}:`, error.message);
            } else {
                console.log(`✅ Imported: ${biz.name} (${city})`);
            }
        }
    }
    console.log('✨ Batch 6 Plumber Import Complete!');
}

importData();
