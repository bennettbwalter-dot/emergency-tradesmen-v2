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
    // Buffalo, NY
    { name: 'Amherst', state: 'NY', prefix: 'amherst_ny' },
    { name: 'Cheektowaga', state: 'NY', prefix: 'cheektowaga_ny' },
    { name: 'Tonawanda', state: 'NY', prefix: 'tonawanda_ny' },
    // Rochester, NY
    { name: 'Greece', state: 'NY', prefix: 'greece_ny' },
    { name: 'Irondequoit', state: 'NY', prefix: 'irondequoit_ny' },
    { name: 'Brighton', state: 'NY', prefix: 'brighton_ny' },
    // Syracuse, NY
    { name: 'Clay', state: 'NY', prefix: 'clay_ny' },
    { name: 'Salina', state: 'NY', prefix: 'salina_ny' },
    { name: 'DeWitt', state: 'NY', prefix: 'dewitt_ny' },
    // Yonkers, NY
    { name: 'Mount Vernon', state: 'NY', prefix: 'mount_vernon_ny' },
    { name: 'New Rochelle', state: 'NY', prefix: 'new_rochelle_ny' },
    { name: 'White Plains', state: 'NY', prefix: 'white_plains_ny' },
    // Newark, NJ
    { name: 'East Orange', state: 'NJ', prefix: 'east_orange_nj' },
    { name: 'Irvington', state: 'NJ', prefix: 'irvington_nj' },
    { name: 'Bloomfield', state: 'NJ', prefix: 'bloomfield_nj' },
    // Jersey City, NJ
    { name: 'Hoboken', state: 'NJ', prefix: 'hoboken_nj' },
    { name: 'Bayonne', state: 'NJ', prefix: 'bayonne_nj' },
    { name: 'Union City', state: 'NJ', prefix: 'union_city_nj' },
    // Paterson, NJ
    { name: 'Clifton', state: 'NJ', prefix: 'clifton_nj' },
    { name: 'Passaic', state: 'NJ', prefix: 'passaic_nj' },
    { name: 'Wayne', state: 'NJ', prefix: 'wayne_nj' },
    // Elizabeth, NJ
    { name: 'Linden', state: 'NJ', prefix: 'linden_nj' },
    { name: 'Rahway', state: 'NJ', prefix: 'rahway_nj' },
    { name: 'Union', state: 'NJ', prefix: 'union_nj' }
];

async function importSuburbs() {
    console.log('Starting Phase 22 (NY/NJ Metro Suburbs) import...');
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

    console.log(`\nTotal imported for Phase 22 Suburbs: ${totalImported} listings`);
}

importSuburbs();
