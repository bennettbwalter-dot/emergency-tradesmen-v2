const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Plano': { lat: 33.0198, lng: -96.6989 },
    'Newark': { lat: 40.7357, lng: -74.1724 },
    'Lincoln': { lat: 40.8136, lng: -96.7026 },
    'Orlando': { lat: 28.5383, lng: -81.3792 },
    'Irvine': { lat: 33.6846, lng: -117.8265 },
    'Fort Wayne': { lat: 41.0793, lng: -85.1394 },
    'Jersey City': { lat: 40.7178, lng: -74.0431 },
    'Durham': { lat: 35.9940, lng: -78.8986 },
    'St. Petersburg': { lat: 27.7676, lng: -82.6333 },
    'Laredo': { lat: 27.5036, lng: -99.5076 },
    'Lubbock': { lat: 33.5779, lng: -101.8552 },
    'Madison': { lat: 43.0731, lng: -89.4012 },
    'Chandler': { lat: 33.3062, lng: -111.8413 },
    'Buffalo': { lat: 42.8864, lng: -78.8784 },
    'Gilbert': { lat: 33.3528, lng: -111.7890 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 5 Plumber Import...`);

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
    console.log('✨ Batch 5 Plumber Import Complete!');
}

importData();
