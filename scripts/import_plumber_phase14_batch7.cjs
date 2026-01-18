const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Moreno Valley': { lat: 33.9425, lng: -117.2297 },
    'Santa Rosa': { lat: 38.4404, lng: -122.7141 },
    'Amarillo': { lat: 35.2220, lng: -101.8313 },
    'Yonkers': { lat: 40.9312, lng: -73.8987 },
    'Aurora (IL)': { lat: 41.7606, lng: -88.3201 },
    'Montgomery': { lat: 32.3668, lng: -86.3000 },
    'Akron': { lat: 41.0814, lng: -81.5190 },
    'Little Rock': { lat: 34.7465, lng: -92.2896 },
    'Huntsville': { lat: 34.7304, lng: -86.5861 },
    'Augusta': { lat: 33.4735, lng: -82.0105 },
    'Grand Rapids': { lat: 42.9634, lng: -85.6681 },
    'Shreveport': { lat: 32.5252, lng: -93.7502 },
    'Salt Lake City': { lat: 40.7608, lng: -111.8910 },
    'Mobile': { lat: 30.6954, lng: -88.0399 },
    'Tallahassee': { lat: 30.4383, lng: -84.2807 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 7 Plumber Import...`);

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
                    city: city, // Use exact key from map for consistency
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
    console.log('✨ Batch 7 Plumber Import Complete!');
}

importData();
