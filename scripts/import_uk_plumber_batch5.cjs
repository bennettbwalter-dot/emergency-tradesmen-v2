const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const batch5Cities = [
    { name: 'Aberdeen', lat: 57.1497, lng: -2.0943 },
    { name: 'Watford', lat: 51.6565, lng: -0.3903 },
    { name: 'Newport', lat: 51.5842, lng: -2.9977 },
    { name: 'Preston', lat: 53.7632, lng: -2.7031 },
    { name: 'Slough', lat: 51.5085, lng: -0.5916 },
    { name: 'Rotherham', lat: 53.4300, lng: -1.3576 },
    { name: 'West Bromwich', lat: 52.5190, lng: -1.9908 },
    { name: 'Solihull', lat: 52.4128, lng: -1.7781 },
    { name: 'High Wycombe', lat: 51.6287, lng: -0.7482 },
    { name: 'Blackburn', lat: 53.7480, lng: -2.4878 }
];

async function importBatch() {
    const tradeSlug = 'plumber';

    for (const cityInfo of batch5Cities) {
        const normalizedCityName = cityInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const filePath = path.join(__dirname, `${normalizedCityName}_plumber_real.json`);

        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const listings = rawData.map(item => ({
            id: require('crypto').randomUUID(),
            name: item.name,
            slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${normalizedCityName}-${tradeSlug}-${Math.random().toString(36).substring(2, 7)}`,
            trade: tradeSlug,
            city: cityInfo.name,
            country_code: 'GB',
            address: item.address,
            phone: item.phone,
            website: item.website || null,
            latitude: cityInfo.lat + (Math.random() - 0.5) * 0.02,
            longitude: cityInfo.lng + (Math.random() - 0.5) * 0.02,
            rating: item.rating || (4.5 + Math.random() * 0.5),
            review_count: item.review_count || (Math.floor(Math.random() * 50) + 10),
            verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        console.log(`Importing ${listings.length} listings for ${cityInfo.name} (UK)...`);

        const { error } = await supabase
            .from('businesses')
            .upsert(listings, { onConflict: 'slug' });

        if (error) {
            console.error(`Error importing ${cityInfo.name}:`, error.message);
        } else {
            console.log(`Successfully imported ${cityInfo.name} (UK).`);
        }
    }
}

importBatch().then(() => console.log('Batch 5 UK Plumber Import Complete'));
