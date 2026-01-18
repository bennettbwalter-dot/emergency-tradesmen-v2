const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Albuquerque': { lat: 35.0844, lng: -106.6504 },
    'Tucson': { lat: 32.2226, lng: -110.9747 },
    'Fresno': { lat: 36.7378, lng: -119.7871 },
    'Sacramento': { lat: 38.5816, lng: -121.4944 },
    'Mesa': { lat: 33.4151, lng: -111.8315 },
    'Kansas City': { lat: 39.0997, lng: -94.5786 },
    'Atlanta': { lat: 33.7490, lng: -84.3880 },
    'Raleigh': { lat: 35.7796, lng: -78.6382 },
    'Colorado Springs': { lat: 38.8339, lng: -104.8214 },
    'Omaha': { lat: 41.2565, lng: -95.9345 },
    'Virginia Beach': { lat: 36.8529, lng: -75.9780 },
    'Minneapolis': { lat: 44.9778, lng: -93.2650 },
    'Oakland': { lat: 37.8044, lng: -122.2712 },
    'Tulsa': { lat: 36.1540, lng: -95.9928 }
};

const cities = Object.keys(cityCoords);
const trade = 'breakdown';

async function importData() {
    console.log(`🚀 Starting Phase 10 Batch 3 Breakdown Import...`);

    for (const city of cities) {
        const fileName = `${city.toLowerCase().replace(/\s/g, '')}_breakdown_real.json`;
        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { lat, lng } = cityCoords[city];

        for (const business of data) {
            // Generate slug - adding trade to avoid collisions
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/\s/g, '')}-${trade}`;

            // Add random offset to coordinates
            const offsetLat = lat + (Math.random() - 0.5) * 0.1;
            const offsetLng = lng + (Math.random() - 0.5) * 0.1;

            const { error } = await supabase.from('businesses').upsert({
                id: `${city.toLowerCase().replace(/\s/g, '')}-breakdown-${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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

    console.log('✨ Batch 3 Breakdown Import Complete!');
}

importData();
