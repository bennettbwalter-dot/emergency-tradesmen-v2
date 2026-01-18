const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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
    'St. Petersburg': { lat: 27.7676, lng: -82.6403 },
    'Laredo': { lat: 27.5306, lng: -99.4803 },
    'Lubbock': { lat: 33.5779, lng: -101.8552 },
    'Madison': { lat: 43.0731, lng: -89.4012 },
    'Chandler': { lat: 33.3062, lng: -111.8413 },
    'Buffalo': { lat: 42.8864, lng: -78.8784 },
    'Gilbert': { lat: 33.3528, lng: -111.7890 }
};

const cities = Object.keys(cityCoords);
const trade = 'breakdown';

async function importData() {
    console.log(`🚀 Starting Phase 10 Batch 5 Breakdown Import...`);

    for (const city of cities) {
        const fileName = `${city.toLowerCase().replace(/\s/g, '').replace(/\./g, '')}_breakdown_real.json`;
        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { lat, lng } = cityCoords[city];

        for (const business of data) {
            // Generate slug - adding trade to avoid collisions
            const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${city.toLowerCase().replace(/\s/g, '').replace(/\./g, '')}-${trade}`;

            // Add random offset to coordinates
            const offsetLat = lat + (Math.random() - 0.5) * 0.1;
            const offsetLng = lng + (Math.random() - 0.5) * 0.1;

            const { error } = await supabase.from('businesses').upsert({
                id: `${city.toLowerCase().replace(/\s/g, '').replace(/\./g, '')}-breakdown-${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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

    console.log('✨ Batch 5 Breakdown Import Complete!');
}

importData();
