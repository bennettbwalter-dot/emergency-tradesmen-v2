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
    { name: 'Jersey City', state: 'NJ', filePrefix: 'jerseycity_nj' }
];

const trades = ['plumber', 'electrician', 'locksmith', 'hvac', 'roofer', 'glazier'];

async function importData() {
    console.log('Starting Jersey City, NJ import...');
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

    console.log(`\nTotal imported for Jersey City, NJ: ${totalImported} listings`);
}

importData();
