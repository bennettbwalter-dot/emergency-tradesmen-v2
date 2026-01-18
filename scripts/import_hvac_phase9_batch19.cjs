const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Oceanside': { lat: 33.1959, lng: -117.3795 },
    'Rancho Cucamonga': { lat: 34.1064, lng: -117.5931 },
    'Huntington Beach': { lat: 33.6599, lng: -117.9992 },
    'Glendale': { lat: 34.1425, lng: -118.2551 },
    'Santa Rosa': { lat: 38.4404, lng: -122.7141 },
    'Ontario': { lat: 34.0633, lng: -117.6509 },
    'Elk Grove': { lat: 38.4088, lng: -121.3658 },
    'Garden Grove': { lat: 33.7739, lng: -117.9415 }
};

const cities = Object.keys(cityCoords);
const trade = 'hvac';

async function importData() {
    console.log(`🚀 Starting Phase 9 Batch 19 HVAC Import...`);

    for (const city of cities) {
        const fileName = `${city.toLowerCase().replace(/\s/g, '')}_hvac_real.json`;
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

    console.log('✨ Batch 19 HVAC Import Complete!');
}

importData();
