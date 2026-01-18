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
    { name: 'Hoover', state: 'AL', prefix: 'hoover_al' },
    { name: 'Vestavia Hills', state: 'AL', prefix: 'vestavia_hills_al' },
    { name: 'Bessemer', state: 'AL', prefix: 'bessemer_al' },
    { name: 'Madison', state: 'AL', prefix: 'madison_al' },
    { name: 'Athens', state: 'AL', prefix: 'athens_al' },
    { name: 'Decatur', state: 'AL', prefix: 'decatur_al' },
    { name: 'Phenix City', state: 'AL', prefix: 'phenix_city_al' },
    { name: 'Fort Moore', state: 'GA', prefix: 'fort_benning_ga' },
    { name: 'Cusseta', state: 'GA', prefix: 'cusseta_ga' },
    { name: 'Opelika', state: 'AL', prefix: 'opelika_al' },
    { name: 'Valley', state: 'AL', prefix: 'valley_al' },
    { name: 'Lanett', state: 'AL', prefix: 'lanett_al' },
    { name: 'Northport', state: 'AL', prefix: 'northport_al' },
    { name: 'Brookwood', state: 'AL', prefix: 'brookwood_al' },
    { name: 'Cottondale', state: 'AL', prefix: 'cottondale_al' }
];

async function importSuburbs() {
    console.log('Starting Phase 15 (Birmingham, Huntsville, Columbus, Auburn, Tuscaloosa) Suburbs import...');
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

    console.log(`\nTotal imported for Phase 15 Suburbs: ${totalImported} listings`);
}

importSuburbs();
