const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Grand Prairie': { lat: 32.7460, lng: -96.9978 },
    'Overland Park': { lat: 38.9822, lng: -94.6708 },
    'Knoxville': { lat: 35.9606, lng: -83.9207 },
    'Port St. Lucie': { lat: 27.2730, lng: -80.3582 },
    'Worcester': { lat: 42.2626, lng: -71.8023 },
    'Brownsville': { lat: 25.9017, lng: -97.4975 },
    'Tempe': { lat: 33.4255, lng: -111.9400 },
    'Providence': { lat: 41.8240, lng: -71.4128 },
    'Cape Coral': { lat: 26.5629, lng: -81.9495 },
    'Chattanooga': { lat: 35.0456, lng: -85.3097 },
    'Jackson': { lat: 32.2988, lng: -90.1848 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 8 (FINAL) Plumber Import...`);

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
    console.log('✨ Batch 8 Plumber Import Complete! Expansion finished!');
}

importData();
