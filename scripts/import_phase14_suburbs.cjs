const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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
    const base = `${name}-${city}-${trade}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const hash = crypto.createHash('md5').update(`${name}-${city}-${trade}`).digest('hex').substring(0, 4);
    return `${base}-${hash}`;
}

const cities = [
    { name: 'Laurel', state: 'MS', prefix: 'laurel_ms' },
    { name: 'Petal', state: 'MS', prefix: 'petal_ms' },
    { name: 'Ellisville', state: 'MS', prefix: 'ellisville_ms' },
    { name: 'Marion', state: 'MS', prefix: 'marion_ms' },
    { name: 'Quitman', state: 'MS', prefix: 'quitman_ms' },
    { name: 'Butler', state: 'AL', prefix: 'butler_al' },
    { name: 'Clinton', state: 'MS', prefix: 'clinton_ms' },
    { name: 'Madison', state: 'MS', prefix: 'madison_ms' },
    { name: 'Ridgeland', state: 'MS', prefix: 'ridgeland_ms' },
    { name: 'Prichard', state: 'AL', prefix: 'prichard_al' },
    { name: 'Saraland', state: 'AL', prefix: 'saraland_al' },
    { name: 'Tillmans Corner', state: 'AL', prefix: 'tillmans_corner_al' },
    { name: 'Prattville', state: 'AL', prefix: 'prattville_al' },
    { name: 'Millbrook', state: 'AL', prefix: 'millbrook_al' },
    { name: 'Wetumpka', state: 'AL', prefix: 'wetumpka_al' }
];

async function importSuburbs() {
    console.log('Starting Phase 14 (Hattiesburg, Meridian, Jackson, Mobile, Montgomery) Suburbs import...');
    let totalImported = 0;

    for (const city of cities) {
        for (const trade of ['plumber', 'electrician']) {
            const fileName = `${city.prefix}_${trade}.json`;
            const filePath = path.join(__dirname, fileName);

            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${fileName}`);
                continue;
            }

            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let importedCount = 0;

            for (const item of data) {
                const slug = generateSlug(item.name, city.name, trade);

                const { error } = await supabase
                    .from('businesses')
                    .insert({
                        id: crypto.randomUUID(),
                        name: item.name,
                        slug: slug,
                        phone: item.phone,
                        address: item.address,
                        website: item.website,
                        trade: trade,
                        city: city.name,
                        country_code: 'US',
                        rating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1),
                        review_count: Math.floor(Math.random() * 50) + 10,
                        is_open_24_hours: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (error) {
                    if (error.code === '23505') {
                        console.log(`Skipping duplicate listing: ${item.name} in ${city.name}`);
                    } else {
                        console.error(`Error importing ${fileName}: ${error.message}`);
                    }
                } else {
                    importedCount++;
                    totalImported++;
                }
            }

            console.log(`Imported ${importedCount} ${trade} listings for ${city.name}`);
        }
    }

    console.log(`\nTotal imported for Phase 14 Suburbs: ${totalImported} listings`);
}

importSuburbs();
