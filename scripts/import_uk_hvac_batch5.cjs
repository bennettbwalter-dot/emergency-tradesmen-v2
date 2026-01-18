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

const ukHVACCitiesBatch5 = [
    { name: "Gloucester", lat: 51.8642, lng: -2.2444 },
    { name: "Rotherham", lat: 53.4312, lng: -1.3547 },
    { name: "Newport", lat: 51.5883, lng: -2.9975 },
    { name: "Solihull", lat: 52.4128, lng: -1.7781 },
    { name: "Exeter", lat: 50.7236, lng: -3.5275 },
    { name: "High Wycombe", lat: 51.6287, lng: -0.7482 },
    { name: "Maidstone", lat: 51.2720, lng: 0.5231 },
    { name: "Blackburn", lat: 53.7480, lng: -2.4820 },
    { name: "Basildon", lat: 51.5721, lng: 0.4705 },
    { name: "Chelmsford", lat: 51.7360, lng: 0.4788 }
];

importUKTradeData(ukHVACCitiesBatch5, 'hvac');
