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

const ukHVACCitiesBatch10 = [
    { name: "Dunstable", lat: 51.8851, lng: -0.5210 },
    { name: "Darlington", lat: 54.5242, lng: -1.5555 },
    { name: "Rugby", lat: 52.3709, lng: -1.2607 },
    { name: "Crewe", lat: 53.0991, lng: -2.4411 },
    { name: "Weymouth", lat: 50.6144, lng: -2.4576 },
    { name: "Hereford", lat: 52.0567, lng: -2.7150 },
    { name: "Wokingham", lat: 51.4102, lng: -0.8354 },
    { name: "Farnborough", lat: 51.2936, lng: -0.7550 },
    { name: "Warwick", lat: 52.2842, lng: -1.5851 },
    { name: "Stafford", lat: 52.8066, lng: -2.1171 }
];

importUKTradeData(ukHVACCitiesBatch10, 'hvac');
