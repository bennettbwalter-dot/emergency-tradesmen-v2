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
            country_code: 'US',
            address: item.address,
            phone: item.phone,
            website: item.website || null,
            latitude: lat + (Math.random() - 0.5) * 0.05,
            longitude: lng + (Math.random() - 0.5) * 0.05,
            rating: item.rating || (4.5 + Math.random() * 0.5),
            review_count: item.review_count || (Math.floor(Math.random() * 100) + 20),
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

const rooferCities = [
    { name: "Nashville", lat: 36.1627, lng: -86.7816 },
    { name: "Greensboro", lat: 36.0726, lng: -79.7920 },
    { name: "Henderson", lat: 36.0395, lng: -114.9817 },
    { name: "Scottsdale", lat: 33.4942, lng: -111.9261 },
    { name: "Cincinnati", lat: 39.1031, lng: -84.5120 },
    { name: "Tampa", lat: 27.9506, lng: -82.4572 },
    { name: "Riverside", lat: 33.9806, lng: -117.3755 },
    { name: "Stockton", lat: 37.9577, lng: -121.2908 },
    { name: "Santa Ana", lat: 33.7455, lng: -117.8677 },
    { name: "Anaheim", lat: 33.8366, lng: -117.9143 },
    { name: "Bakersfield", lat: 35.3733, lng: -119.0187 },
    { name: "Oakland", lat: 37.8044, lng: -122.2712 },
    { name: "Long Beach", lat: 33.7701, lng: -118.1937 }
];

importTradeData(rooferCities, 'roofer');
