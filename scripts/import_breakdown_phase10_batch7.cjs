const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Richmond': { lat: 37.5407, lng: -77.4360 },
    'Boise': { lat: 43.6150, lng: -116.2023 },
    'Baton Rouge': { lat: 30.4515, lng: -91.1871 },
    'Des Moines': { lat: 41.5868, lng: -93.6250 },
    'Spokane': { lat: 47.6588, lng: -117.4260 },
    'Tacoma': { lat: 47.2529, lng: -122.4443 },
    'Fontana': { lat: 34.0922, lng: -117.4350 },
    'Modesto': { lat: 37.6391, lng: -120.9969 },
    'Moreno Valley': { lat: 33.9333, lng: -117.2295 },
    'Birmingham': { lat: 33.5186, lng: -86.8104 },
    'Oxnard': { lat: 34.1975, lng: -119.1770 },
    'Rochester': { lat: 43.1566, lng: -77.6088 },
    'Fayetteville': { lat: 35.0527, lng: -78.8784 },
    'Huntington Beach': { lat: 33.6599, lng: -117.9990 },
    'Yonkers': { lat: 40.9312, lng: -73.8987 }
};

const cities = Object.keys(cityCoords);
const trade = 'breakdown';

async function importData() {
    console.log(`🚀 Starting Phase 10 Batch 7 Breakdown Import...`);

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

    console.log('✨ Batch 7 Breakdown Import Complete!');
}

importData();
