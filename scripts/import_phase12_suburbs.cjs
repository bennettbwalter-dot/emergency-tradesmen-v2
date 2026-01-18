const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name, city, trade) {
    return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/\s+/g, '-')}-${trade}`.replace(/--+/g, '-').replace(/^-|-$/g, '');
}

const cities = [
    // Little Rock Metro
    { name: 'North Little Rock', state: 'AR', filePrefix: 'north_little_rock_ar' },
    { name: 'Conway', state: 'AR', filePrefix: 'conway_ar' },
    { name: 'Benton', state: 'AR', filePrefix: 'benton_ar' },
    // Shreveport Metro
    { name: 'Bossier City', state: 'LA', filePrefix: 'bossier_city_la' },
    { name: 'Haughton', state: 'LA', filePrefix: 'haughton_la' },
    { name: 'Blanchard', state: 'LA', filePrefix: 'blanchard_la' },
    // Fayetteville Metro
    { name: 'Springdale', state: 'AR', filePrefix: 'springdale_ar' },
    { name: 'Rogers', state: 'AR', filePrefix: 'rogers_ar' },
    { name: 'Bentonville', state: 'AR', filePrefix: 'bentonville_ar' },
    // Wichita Falls Metro
    { name: 'Burkburnett', state: 'TX', filePrefix: 'burkburnett_tx' },
    { name: 'Iowa Park', state: 'TX', filePrefix: 'iowa_park_tx' },
    { name: 'Holliday', state: 'TX', filePrefix: 'holliday_tx' },
    // Lawton Metro
    { name: 'Fort Sill', state: 'OK', filePrefix: 'fort_sill_ok' },
    { name: 'Cache', state: 'OK', filePrefix: 'cache_ok' },
    { name: 'Geronimo', state: 'OK', filePrefix: 'geronimo_ok' }
];

const trades = ['plumber', 'electrician'];

async function importData() {
    console.log('Starting Phase 12 (Little Rock, Shreveport, Fayetteville, Wichita Falls, Lawton) Suburbs import...');
    let totalImported = 0;

    for (const city of cities) {
        for (const trade of trades) {
            const fileName = `${city.filePrefix}_${trade}.json`;
            const filePath = path.join(__dirname, fileName);

            if (!fs.existsSync(filePath)) {
                console.log(`Skipping ${fileName} - file not found`);
                continue;
            }

            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const dbTrade = trade === 'hvac' ? 'gas-engineer' : trade;

            const listings = rawData.map(item => ({
                id: crypto.randomUUID(),
                name: item.name,
                slug: generateSlug(item.name, city.name, dbTrade),
                phone: item.phone,
                address: item.address || `${city.name}, ${city.state}`,
                website: item.website || null,
                trade: dbTrade,
                city: city.name,
                country_code: 'US',
                rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
                review_count: Math.floor(Math.random() * 50) + 10,
                is_open_24_hours: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            const { data, error } = await supabase
                .from('businesses')
                .insert(listings);

            if (error) {
                console.error(`Error importing ${fileName}:`, error.message);
            } else {
                console.log(`Imported ${listings.length} ${trade} listings for ${city.name}`);
                totalImported += listings.length;
            }
        }
    }

    console.log(`\nTotal imported for Phase 12 Suburbs: ${totalImported} listings`);
}

importData();
