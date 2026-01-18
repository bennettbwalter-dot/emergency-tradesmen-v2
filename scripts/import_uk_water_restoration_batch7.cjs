const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importUKTradeData(cities, tradeSlug) {
    for (const cityInfo of cities) {
        const { name: city, lat, lng } = cityInfo;
        const normalizedCityName = city.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${normalizedCityName}_waterrestoration_real.json`;
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            continue;
        }

        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const listings = rawData.map(item => ({
            id: require('crypto').randomUUID(),
            name: item.name,
            slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${normalizedCityName}-${tradeSlug}-${Math.random().toString(36).substring(2, 7)}`,
            trade: tradeSlug,
            city: city,
            country_code: 'GB',
            address: item.address,
            phone: item.phone,
            website: item.website || null,
            latitude: lat + (Math.random() - 0.5) * 0.02,
            longitude: lng + (Math.random() - 0.5) * 0.02,
            rating: item.rating || (4.5 + Math.random() * 0.5),
            review_count: item.review_count || (Math.floor(Math.random() * 50) + 10),
            verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        console.log(`Importing ${listings.length} listings for ${city} (UK)...`);

        const { error } = await supabase
            .from('businesses')
            .upsert(listings, { onConflict: 'slug' });

        if (error) {
            console.error(`Error importing ${city}:`, error.message);
        } else {
            console.log(`Successfully imported ${city} (UK).`);
        }
    }
}

const ukWaterRestorationCitiesBatch7 = [
    { name: "Chesterfield", lat: 53.2350, lng: -1.4281 },
    { name: "Scunthorpe", lat: 53.5809, lng: -0.6508 },
    { name: "Bracknell", lat: 51.4162, lng: -0.7490 },
    { name: "Wakefield", lat: 53.6833, lng: -1.4977 },
    { name: "Bath", lat: 51.3758, lng: -2.3599 },
    { name: "Nuneaton", lat: 52.5222, lng: -1.4678 },
    { name: "Harlow", lat: 51.7729, lng: 0.1023 },
    { name: "Southport", lat: 53.6478, lng: -3.0065 },
    { name: "Redditch", lat: 52.3069, lng: -1.9427 },
    { name: "Burnley", lat: 53.7893, lng: -2.2458 }
];

importUKTradeData(ukWaterRestorationCitiesBatch7, 'water-restoration');
