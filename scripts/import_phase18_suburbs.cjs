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
    { name: 'Portsmouth', state: 'VA', prefix: 'portsmouth_va' },
    { name: 'Suffolk', state: 'VA', prefix: 'suffolk_va' },
    { name: 'Franklin', state: 'VA', prefix: 'franklin_va' },
    { name: 'Midlothian', state: 'VA', prefix: 'midlothian_va' },
    { name: 'Glen Allen', state: 'VA', prefix: 'glen_allen_va' },
    { name: 'Mechanicsville', state: 'VA', prefix: 'mechanicsville_va' },
    { name: 'Hampton', state: 'VA', prefix: 'hampton_va' },
    { name: 'Yorktown', state: 'VA', prefix: 'yorktown_va' },
    { name: 'Poquoson', state: 'VA', prefix: 'poquoson_va' },
    { name: 'Great Bridge', state: 'VA', prefix: 'great_bridge_va' },
    { name: 'Deep Creek', state: 'VA', prefix: 'deep_creek_va' },
    { name: 'Western Branch', state: 'VA', prefix: 'western_branch_va' },
    { name: 'Arlington', state: 'VA', prefix: 'arlington_va' },
    { name: 'McLean', state: 'VA', prefix: 'mclean_va' },
    { name: 'Springfield', state: 'VA', prefix: 'springfield_va' },
    { name: 'South Charleston', state: 'WV', prefix: 'south_charleston_wv' },
    { name: 'Saint Albans', state: 'WV', prefix: 'saint_albans_wv' },
    { name: 'Dunbar', state: 'WV', prefix: 'dunbar_wv' },
    { name: 'Barboursville', state: 'WV', prefix: 'barboursville_wv' },
    { name: 'Milton', state: 'WV', prefix: 'milton_wv' },
    { name: 'Kenova', state: 'WV', prefix: 'kenova_wv' },
    { name: 'Fairmont', state: 'WV', prefix: 'fairmont_wv' },
    { name: 'Clarksburg', state: 'WV', prefix: 'clarksburg_wv' },
    { name: 'Bridgeport', state: 'WV', prefix: 'bridgeport_wv' },
    { name: 'Vienna', state: 'WV', prefix: 'vienna_wv' },
    { name: 'Marietta', state: 'OH', prefix: 'marietta_oh' },
    { name: 'Belpre', state: 'OH', prefix: 'belpre_oh' },
    { name: 'Moundsville', state: 'WV', prefix: 'moundsville_wv' },
    { name: 'Martins Ferry', state: 'OH', prefix: 'martins_ferry_oh' },
    { name: 'Bellaire', state: 'OH', prefix: 'bellaire_oh' }
];

async function importSuburbs() {
    console.log('Starting Phase 18 (VA & WV Metros) Suburbs import...');
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

    console.log(`\nTotal imported for Phase 18 Suburbs: ${totalImported} listings`);
}

importSuburbs();
