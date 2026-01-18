const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cityCoords = {
    'Indianapolis': { lat: 39.7684, lng: -86.1581 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Washington DC': { lat: 38.9072, lng: -77.0369 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'El Paso': { lat: 31.7619, lng: -106.4850 },
    'Nashville': { lat: 36.1627, lng: -86.7816 },
    'Oklahoma City': { lat: 35.4676, lng: -97.5164 },
    'Las Vegas': { lat: 36.1699, lng: -115.1398 },
    'Portland': { lat: 45.5152, lng: -122.6784 },
    'Louisville': { lat: 38.2527, lng: -85.7585 },
    'Milwaukee': { lat: 43.0389, lng: -87.9065 },
    'Baltimore': { lat: 39.2904, lng: -76.6122 },
    'Albuquerque': { lat: 35.0844, lng: -106.6504 }
};

const cities = Object.keys(cityCoords);
const trade = 'plumber';

async function importData() {
    console.log(`🚀 Starting Phase 14 Batch 2 Plumber Import...`);

    for (const city of cities) {
        let fileNameBase = city.toLowerCase().replace(/\s/g, '');
        // Handle special cases if any
        if (city === 'Washington DC') fileNameBase = 'washingtondc';

        const fileName = `${fileNameBase}_plumber_real.json`;
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
                id: `${city.toLowerCase().replace(/\s/g, '')}-plumber-${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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

    console.log('✨ Batch 2 Plumber Import Complete!');
}

importData();
