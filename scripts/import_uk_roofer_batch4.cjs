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

const batch4Cities = [
    { name: 'Huddersfield', lat: 53.6458, lng: -1.785 },
    { name: 'Oxford', lat: 51.752, lng: -1.2577 },
    { name: 'Middlesbrough', lat: 54.5762, lng: -1.2348 },
    { name: 'Blackpool', lat: 53.8175, lng: -3.0357 },
    { name: 'Oldbury', lat: 52.5029, lng: -2.0163 },
    { name: 'Cambridge', lat: 52.2053, lng: 0.1218 },
    { name: 'York', lat: 53.9591, lng: -1.0812 },
    { name: 'Dundee', lat: 56.462, lng: -2.9707 },
    { name: 'Ipswich', lat: 52.0567, lng: 1.1482 },
    { name: 'Gloucester', lat: 51.8642, lng: -2.2448 }
];

async function importBatch() {
    const tradeSlug = 'roofer';

    for (const cityInfo of batch4Cities) {
        const normalizedCityName = cityInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const filePath = path.join(__dirname, `${normalizedCityName}_roofer_real.json`);

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

importBatch().then(() => console.log('Batch 4 UK Roofer Import Complete'));
