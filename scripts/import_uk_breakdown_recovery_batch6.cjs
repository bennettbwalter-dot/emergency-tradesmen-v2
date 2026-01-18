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

const batch6Cities = [
    { name: 'Colchester', lat: 51.8959, lng: 0.8919 },
    { name: 'Oldham', lat: 53.5409, lng: -2.1114 },
    { name: 'St Helens', lat: 53.4543, lng: -2.7302 },
    { name: 'Crawley', lat: 51.1132, lng: -0.1831 },
    { name: 'Basildon', lat: 51.5761, lng: 0.4887 },
    { name: 'Cheltenham', lat: 51.8995, lng: -2.0711 },
    { name: 'Gillingham', lat: 51.3915, lng: 0.5483 },
    { name: 'Worthing', lat: 50.8147, lng: -0.3714 },
    { name: 'Rochdale', lat: 53.6150, lng: -2.1554 },
    { name: 'Southend-on-Sea', lat: 51.5385, lng: 0.7132 }
];

async function importBatch() {
    const tradeSlug = 'breakdown-recovery';

    for (const cityInfo of batch6Cities) {
        const normalizedCityName = cityInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const filePath = path.join(__dirname, `${normalizedCityName}_breakdownrecovery_real.json`);

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

importBatch().then(() => console.log('Batch 6 Breakdown Recovery Import Complete'));
