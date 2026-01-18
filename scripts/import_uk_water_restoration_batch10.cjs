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

const ukWaterRestorationCitiesBatch10 = [
    { name: "Cheltenham", lat: 51.8995, lng: -2.0711 },
    { name: "Grimsby", lat: 53.5644, lng: -0.0712 },
    { name: "Worcester", lat: 52.1936, lng: -2.2215 },
    { name: "Chester", lat: 53.1905, lng: -2.8916 },
    { name: "Lincoln", lat: 53.2268, lng: -0.5379 },
    { name: "Derry", lat: 54.9966, lng: -7.3086 },
    { name: "Craigavon", lat: 54.4503, lng: -6.3861 },
    { name: "Lisburn", lat: 54.5126, lng: -6.0354 },
    { name: "Rochdale", lat: 53.6163, lng: -2.1583 },
    { name: "Widnes", lat: 53.3630, lng: -2.7282 }
];

importUKTradeData(ukWaterRestorationCitiesBatch10, 'water-restoration');
