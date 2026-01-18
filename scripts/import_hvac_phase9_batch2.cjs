const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Dallas': { lat: 32.7767, lng: -96.7970 },
    'San Antonio': { lat: 29.4241, lng: -98.4936 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'San Diego': { lat: 32.7157, lng: -117.1611 }
};

const cities = Object.keys(cityCoords);
const trade = 'hvac';

async function importData() {
    console.log(`🚀 Starting Phase 9 Batch 2 HVAC Import...`);

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
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-0]/g, '-')}-${city.toLowerCase().replace(/\s/g, '-')}-${trade}`;

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

    console.log('✨ Batch 2 HVAC Import Complete!');
}

importData();
