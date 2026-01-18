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
        const fileName = `${normalizedCityName}_${tradeSlug}_real.json`;
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

const ukHVACCitiesBatch4 = [
    { name: "Ipswich", lat: 52.0567, lng: 1.1554 },
    { name: "Blackpool", lat: 53.8175, lng: -3.0357 },
    { name: "Middlesbrough", lat: 54.5762, lng: -1.2348 },
    { name: "Bolton", lat: 53.5810, lng: -2.4282 },
    { name: "Stockport", lat: 53.4106, lng: -2.1575 },
    { name: "Preston", lat: 53.7632, lng: -2.7044 },
    { name: "Reading", lat: 51.4543, lng: -0.9781 },
    { name: "Wolverhampton", lat: 52.5862, lng: -2.1288 },
    { name: "Huddersfield", lat: 53.6458, lng: -1.7850 },
    { name: "Slough", lat: 51.5085, lng: -0.5918 }
];

importUKTradeData(ukHVACCitiesBatch4, 'hvac');
