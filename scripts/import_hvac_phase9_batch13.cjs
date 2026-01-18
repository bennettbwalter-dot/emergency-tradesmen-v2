const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Lubbock': { lat: 33.5779, lng: -101.8552 },
    'Laredo': { lat: 27.5306, lng: -99.4803 },
    'Amarillo': { lat: 35.2220, lng: -101.8313 },
    'Midland': { lat: 31.9973, lng: -102.0779 },
    'Abilene': { lat: 32.4487, lng: -99.7331 },
    'Denton': { lat: 33.2148, lng: -97.1331 }
};

const cities = Object.keys(cityCoords);
const trade = 'hvac';

async function importData() {
    console.log(`🚀 Starting Phase 9 Batch 13 HVAC Import...`);

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
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/\s/g, '')}-${trade}`;

            // Add random offset to coordinates
            const offsetLat = lat + (Math.random() - 0.5) * 0.1;
            const offsetLng = lng + (Math.random() - 0.5) * 0.1;

            const { error } = await supabase.from('businesses').upsert({
                id: `${city.toLowerCase().replace(/\s/g, '')}-hvac-${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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

    console.log('✨ Batch 13 HVAC Import Complete!');
}

importData();
