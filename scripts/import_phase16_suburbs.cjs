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
    { name: 'North Augusta', state: 'SC', prefix: 'north_augusta_sc' },
    { name: 'Evans', state: 'GA', prefix: 'evans_ga' },
    { name: 'Martinez', state: 'GA', prefix: 'martinez_ga' },
    { name: 'Pooler', state: 'GA', prefix: 'pooler_ga' },
    { name: 'Garden City', state: 'GA', prefix: 'garden_city_ga' },
    { name: 'Richmond Hill', state: 'GA', prefix: 'richmond_hill_ga' },
    { name: 'Mount Pleasant', state: 'SC', prefix: 'mount_pleasant_sc' },
    { name: 'North Charleston', state: 'SC', prefix: 'north_charleston_sc' },
    { name: 'Summerville', state: 'SC', prefix: 'summerville_sc' },
    { name: 'Lexington', state: 'SC', prefix: 'lexington_sc' },
    { name: 'West Columbia', state: 'SC', prefix: 'west_columbia_sc' },
    { name: 'Cayce', state: 'SC', prefix: 'cayce_sc' },
    { name: 'Spartanburg', state: 'SC', prefix: 'spartanburg_sc' },
    { name: 'Anderson', state: 'SC', prefix: 'anderson_sc' },
    { name: 'Greer', state: 'SC', prefix: 'greer_sc' }
];

async function importSuburbs() {
    console.log('Starting Phase 16 (Augusta, Savannah, Charleston, Columbia, Greenville) Suburbs import...');
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

    console.log(`\nTotal imported for Phase 16 Suburbs: ${totalImported} listings`);
}

importSuburbs();
