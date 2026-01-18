const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Tucson': { lat: 32.2226, lng: -110.9747 },
    'Fresno': { lat: 36.7378, lng: -119.7871 },
    'Sacramento': { lat: 38.5816, lng: -121.4944 },
    'Kansas City': { lat: 39.0997, lng: -94.5786 },
    'Long Beach': { lat: 33.7701, lng: -118.1937 },
    'Mesa': { lat: 33.4152, lng: -111.8315 },
    'Atlanta': { lat: 33.7490, lng: -84.3880 },
    'Colorado Springs': { lat: 38.8339, lng: -104.8214 },
    'Virginia Beach': { lat: 36.8529, lng: -75.9780 },
    'Raleigh': { lat: 35.7796, lng: -78.6382 },
    'Omaha': { lat: 41.2565, lng: -95.9345 },
    'Miami': { lat: 25.7617, lng: -80.1918 },
    'Oakland': { lat: 37.8044, lng: -122.2712 },
    'Tulsa': { lat: 36.1540, lng: -95.9928 },
    'Minneapolis': { lat: 44.9778, lng: -93.2650 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 3 Plumber Import (UUID Fix Applied)...`);

    for (const city of cities) {
        let fileNameBase = city.toLowerCase().replace(/\s/g, '');
        const fileName = `${fileNameBase}_plumber_real.json`;
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Warning: ${fileName} not found. Skipping ${city}.`);
            continue;
        }

        const rawData = fs.readFileSync(filePath);
        const businesses = JSON.parse(rawData);

        for (const biz of businesses) {
            const slug = `${biz.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/\s/g, '-')}-${trade}`;

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
    console.log('✨ Batch 3 Plumber Import Complete!');
}

importData();
