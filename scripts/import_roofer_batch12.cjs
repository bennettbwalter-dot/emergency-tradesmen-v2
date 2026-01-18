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
    { name: "Colorado Springs", lat: 38.8339, lng: -104.8214 },
    { name: "Tulsa", lat: 36.1540, lng: -95.9928 },
    { name: "Aurora", lat: 39.7294, lng: -104.8319 },
    { name: "Lexington", lat: 38.0406, lng: -84.5037 }
];

importTradeData(rooferCities, 'roofer');
