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
    // Michigan
    { name: 'East Lansing', state: 'MI', prefix: 'east_lansing_mi' },
    { name: 'Okemos', state: 'MI', prefix: 'okemos_mi' },
    { name: 'Haslett', state: 'MI', prefix: 'haslett_mi' },
    { name: 'Ypsilanti', state: 'MI', prefix: 'ypsilanti_mi' },
    { name: 'Saline', state: 'MI', prefix: 'saline_mi' },
    { name: 'Dexter', state: 'MI', prefix: 'dexter_mi' },
    { name: 'Grand Blanc', state: 'MI', prefix: 'grand_blanc_mi' },
    { name: 'Burton', state: 'MI', prefix: 'burton_mi' },
    { name: 'Davison', state: 'MI', prefix: 'davison_mi' },
    // Wisconsin
    { name: 'Middleton', state: 'WI', prefix: 'middleton_wi' },
    { name: 'Sun Prairie', state: 'WI', prefix: 'sun_prairie_wi' },
    { name: 'Fitchburg', state: 'WI', prefix: 'fitchburg_wi' },
    { name: 'De Pere', state: 'WI', prefix: 'de_pere_wi' },
    { name: 'Ashwaubenon', state: 'WI', prefix: 'ashwaubenon_wi' },
    { name: 'Howard', state: 'WI', prefix: 'howard_wi' },
    { name: 'Pleasant Prairie', state: 'WI', prefix: 'pleasant_prairie_wi' },
    { name: 'Somers', state: 'WI', prefix: 'somers_wi' },
    { name: 'Bristol', state: 'WI', prefix: 'bristol_wi' },
    // Illinois
    { name: 'Loves Park', state: 'IL', prefix: 'loves_park_il' },
    { name: 'Machesney Park', state: 'IL', prefix: 'machesney_park_il' },
    { name: 'Belvidere', state: 'IL', prefix: 'belvidere_il' },
    { name: 'Shorewood', state: 'IL', prefix: 'shorewood_il' },
    { name: 'Plainfield', state: 'IL', prefix: 'plainfield_il' },
    { name: 'Crest Hill', state: 'IL', prefix: 'crest_hill_il' },
    // Minnesota
    { name: 'Woodbury', state: 'MN', prefix: 'woodbury_mn' },
    { name: 'Maplewood', state: 'MN', prefix: 'maplewood_mn' },
    { name: 'Oakdale', state: 'MN', prefix: 'oakdale_mn' },
    { name: 'Byron', state: 'MN', prefix: 'byron_mn' },
    { name: 'Kasson', state: 'MN', prefix: 'kasson_mn' },
    { name: 'Stewartville', state: 'MN', prefix: 'stewartville_mn' }
];

async function importSuburbs() {
    console.log('Starting Phase 20 (MI, WI, IL, MN Metros) Suburbs import...');
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

    console.log(`\nTotal imported for Phase 20 Suburbs: ${totalImported} listings`);
}

importSuburbs();
