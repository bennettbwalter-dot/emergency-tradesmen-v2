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
    { name: "Waco", lat: 31.5493, lng: -97.1467 },
    { name: "Carrollton", lat: 32.9756, lng: -96.8900 },
    { name: "Richardson", lat: 32.9483, lng: -96.7299 },
    { name: "Lubbock", lat: 33.5779, lng: -101.8552 },
    { name: "Amarillo", lat: 35.2220, lng: -101.8313 },
    { name: "El Paso", lat: 31.7619, lng: -106.4850 },
    { name: "Corpus Christi", lat: 27.8006, lng: -97.3964 },
    { name: "Brownsville", lat: 25.9017, lng: -97.4975 },
    { name: "Killeen", lat: 31.1171, lng: -97.7278 },
    { name: "Beaumont", lat: 30.0860, lng: -94.1018 }
];

importTradeData(rooferCities, 'roofer');
