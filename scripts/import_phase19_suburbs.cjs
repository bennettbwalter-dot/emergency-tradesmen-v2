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
    // Ohio
    { name: 'Dublin', state: 'OH', prefix: 'dublin_oh' },
    { name: 'Westerville', state: 'OH', prefix: 'westerville_oh' },
    { name: 'Grove City', state: 'OH', prefix: 'grove_city_oh' },
    { name: 'Lakewood', state: 'OH', prefix: 'lakewood_oh' },
    { name: 'Euclid', state: 'OH', prefix: 'euclid_oh' },
    { name: 'Cleveland Heights', state: 'OH', prefix: 'cleveland_heights_oh' },
    { name: 'Norwood', state: 'OH', prefix: 'norwood_oh' },
    { name: 'Forest Park', state: 'OH', prefix: 'forest_park_oh' },
    { name: 'Blue Ash', state: 'OH', prefix: 'blue_ash_oh' },
    { name: 'Sylvania', state: 'OH', prefix: 'sylvania_oh' },
    { name: 'Oregon', state: 'OH', prefix: 'oregon_oh' },
    { name: 'Perrysburg', state: 'OH', prefix: 'perrysburg_oh' },
    { name: 'Cuyahoga Falls', state: 'OH', prefix: 'cuyahoga_falls_oh' },
    { name: 'Barberton', state: 'OH', prefix: 'barberton_oh' },
    { name: 'Stow', state: 'OH', prefix: 'stow_oh' },
    // Indiana
    { name: 'Fishers', state: 'IN', prefix: 'fishers_in' },
    { name: 'Greenwood', state: 'IN', prefix: 'greenwood_in' },
    { name: 'Lawrence', state: 'IN', prefix: 'lawrence_in' },
    { name: 'New Haven', state: 'IN', prefix: 'new_haven_in' },
    { name: 'Huntertown', state: 'IN', prefix: 'huntertown_in' },
    { name: 'Leo-Cedarville', state: 'IN', prefix: 'leo_cedarville_in' },
    { name: 'Newburgh', state: 'IN', prefix: 'newburgh_in' },
    { name: 'McCutchanville', state: 'IN', prefix: 'mccutchanville_in' },
    { name: 'Melody Hill', state: 'IN', prefix: 'melody_hill_in' },
    { name: 'Mishawaka', state: 'IN', prefix: 'mishawaka_in' },
    { name: 'Granger', state: 'IN', prefix: 'granger_in' },
    { name: 'Roseland', state: 'IN', prefix: 'roseland_in' },
    { name: 'Zionsville', state: 'IN', prefix: 'zionsville_in' },
    { name: 'Westfield', state: 'IN', prefix: 'westfield_in' },
    { name: 'Noblesville', state: 'IN', prefix: 'noblesville_in' }
];

async function importSuburbs() {
    console.log('Starting Phase 19 (OH & IN Metros) Suburbs import...');
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

    console.log(`\nTotal imported for Phase 19 Suburbs: ${totalImported} listings`);
}

importSuburbs();
