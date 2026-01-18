const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Wichita': { lat: 37.6872, lng: -97.3301 },
    'New Orleans': { lat: 29.9511, lng: -90.0715 },
    'Arlington': { lat: 32.7357, lng: -97.1081 },
    'Cleveland': { lat: 41.4993, lng: -81.6944 },
    'Bakersfield': { lat: 35.3733, lng: -119.0187 },
    'Aurora': { lat: 39.7294, lng: -104.8319 },
    'Anaheim': { lat: 33.8366, lng: -117.9143 },
    'Honolulu': { lat: 21.3069, lng: -157.8583 },
    'Santa Ana': { lat: 33.7455, lng: -117.8677 },
    'Riverside': { lat: 33.9533, lng: -117.3961 },
    'Corpus Christi': { lat: 27.8006, lng: -97.3964 },
    'Lexington': { lat: 38.0406, lng: -84.5037 },
    'Stockton': { lat: 37.9577, lng: -121.2908 },
    'Henderson': { lat: 36.0395, lng: -114.9817 },
    'Saint Paul': { lat: 44.9537, lng: -93.0899 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 4 Plumber Import...`);

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
    console.log('✨ Batch 4 Plumber Import Complete!');
}

importData();
