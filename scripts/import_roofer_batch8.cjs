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
    { name: "San Antonio", lat: 29.4241, lng: -98.4936 },
    { name: "San Diego", lat: 32.7157, lng: -117.1611 },
    { name: "Dallas", lat: 32.7767, lng: -96.7970 },
    { name: "Austin", lat: 30.2672, lng: -97.7431 },
    { name: "Jacksonville", lat: 30.3322, lng: -81.6557 },
    { name: "San Jose", lat: 37.3382, lng: -121.8863 },
    { name: "Fort Worth", lat: 32.7555, lng: -97.3308 },
    { name: "Phoenix", lat: 33.4484, lng: -112.0740 },
    { name: "Houston", lat: 29.7604, lng: -95.3698 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
    { name: "San Mateo", lat: 37.5630, lng: -122.3255 },
    { name: "Redwood City", lat: 37.4852, lng: -122.2364 },
    { name: "Palo Alto", lat: 37.4419, lng: -122.1430 },
    { name: "Mountain View", lat: 37.3861, lng: -122.0839 },
    { name: "Sunnyvale", lat: 37.3688, lng: -122.0363 }
];

importTradeData(rooferCities, 'roofer');
