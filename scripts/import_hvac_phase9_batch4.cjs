const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Washington DC': { lat: 38.9072, lng: -77.0369 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'El Paso': { lat: 31.7619, lng: -106.4850 },
    'Nashville': { lat: 36.1627, lng: -86.7816 },
    'Oklahoma City': { lat: 35.4676, lng: -97.5164 }
};

const cities = Object.keys(cityCoords);
const trade = 'hvac';

async function importData() {
    console.log(`🚀 Starting Phase 9 Batch 4 HVAC Import...`);

    for (const city of cities) {
        const filePath = path.join(__dirname, `${city.toLowerCase().replace(/\s/g, '')}_hvac_real.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { lat, lng } = cityCoords[city];

        for (const business of data) {
            // Generate slug - adding trade to avoid collisions
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/\s/g, '-')}-${trade}`;

            // Add random offset to coordinates
            const offsetLat = lat + (Math.random() - 0.5) * 0.1;
            const offsetLng = lng + (Math.random() - 0.5) * 0.1;

            const { error } = await supabase.from('businesses').upsert({
                id: `${city.toLowerCase().replace(/\s/g, '')}-hvac-${business.name.toLowerCase().replace(/[^a-z0-0]/g, '-')}`,
                name: business.name,
                slug: slug,
                trade: trade,
                city: city === 'Washington DC' ? 'Washington, D.C.' : city,
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

    console.log('✨ Batch 4 HVAC Import Complete!');
}

importData();
