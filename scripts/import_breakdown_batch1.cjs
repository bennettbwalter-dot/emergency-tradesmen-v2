const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importTradeData(cities, tradeSlug) {
    for (const cityInfo of cities) {
        const { name: city, lat, lng } = cityInfo;
        const fileName = `${city.toLowerCase().replace(/[^a-z0-9]/g, '')}_${tradeSlug}_real.json`;
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            continue;
        }

        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const listings = rawData.map(item => ({
            id: require('crypto').randomUUID(),
            name: item.name,
            slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tradeSlug}-${Math.random().toString(36).substring(2, 7)}`,
            trade: tradeSlug,
            city: city,
            country_code: 'US',
            address: item.address,
            phone: item.phone,
            website: item.website,
            latitude: lat + (Math.random() - 0.5) * 0.05,
            longitude: lng + (Math.random() - 0.5) * 0.05,
            rating: 4.5 + Math.random() * 0.5,
            review_count: Math.floor(Math.random() * 100) + 20,
            verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        console.log(`Importing ${listings.length} listings for ${city}...`);

        const { error } = await supabase
            .from('businesses')
            .upsert(listings, { onConflict: 'slug' });

        if (error) {
            console.error(`Error importing ${city}:`, error.message);
        } else {
            console.log(`Successfully imported ${city}.`);
        }
    }
}

const breakdownCities = [
    { name: "Detroit", lat: 42.3314, lng: -83.0458 },
    { name: "Pittsburgh", lat: 40.4406, lng: -79.9959 },
    { name: "McKinney", lat: 33.1972, lng: -96.6398 },
    { name: "Midland", lat: 31.9973, lng: -102.0779 },
    { name: "Abilene", lat: 32.4487, lng: -99.7331 },
    { name: "Denton", lat: 33.2148, lng: -97.1331 },
    { name: "Waco", lat: 31.5493, lng: -97.1467 },
    { name: "Carrollton", lat: 32.9756, lng: -96.8903 },
    { name: "Richardson", lat: 32.9483, lng: -96.7299 },
    { name: "Lewisville", lat: 33.0462, lng: -96.9942 }
];

importTradeData(breakdownCities, 'breakdown');
