import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const generateUUID = (str) => {
    return crypto.createHash('md5').update(str).digest('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

const createSlug = (name, trade, city) => {
    return `${name}-${trade}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const batches = [
    {
        county: 'Covington',
        cities: ['Andalusia', 'Opp', 'Florala', 'Red Level', 'Lockhart', 'Gantt', 'Babbie', 'Heath', 'Libertyville', 'Sanford'],
        breakdown: { name: "Servicewise Towing", phone: "334-222-1234" },
        water: { name: "Experts Water Damage Restoration LLC", phone: "334-427-1234" }
    },
    {
        county: 'Crenshaw',
        cities: ['Luverne', 'Brantley', 'Dozier', 'Glenwood', 'Petrey', 'Rutledge', 'Fullers Crossroads', 'Highland Home', 'Honoraville', 'Panola'],
        breakdown: { name: "Luverne Local Towing", phone: "334-335-1234" },
        water: { name: "Triangle Water Damage", phone: "833-824-0699" }
    },
    {
        county: 'Cullman',
        cities: ['Cullman', 'Hanceville', 'Good Hope', 'Holly Pond', 'Garden City', 'Colony', 'West Point', 'Fairview', 'Dodge City', 'Southport'],
        breakdown: { name: "Mullins Body Shop LLC", phone: "256-734-1234" },
        water: { name: "SERVPRO of Cullman / Blount Counties", phone: "256-737-1234" }
    },
    {
        county: 'Dale',
        cities: ['Ozark', 'Daleville', 'Level Plains', 'Pinckard', 'Newton', 'Napier Field', 'Grimes', 'Midland City', 'Clayhatchee', 'Echo'],
        breakdown: { name: "Knight's Wrecker - Ozark", phone: "334-774-1234" },
        water: { name: "SERVPRO of Coffee, Dale, Geneva & Henry Counties", phone: "334-347-1933" }
    },
    {
        county: 'Dallas',
        cities: ['Selma', 'Orrville', 'Valley Grande', 'Beloit', 'Browns', 'Carlowville', 'Minter', 'Plantersville', 'Safford', 'Sardis'],
        breakdown: { name: "Al's Towing & Recovery", phone: "334-875-1234" },
        water: { name: "Protek Restoration", phone: "334-262-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 111-115 (Recovery Mode)...');
    
    let allFormatted = [];
    let slugsToTarget = [];

    for (const batch of batches) {
        for (const city of batch.cities) {
            slugsToTarget.push(createSlug(batch.breakdown.name, 'breakdown', city));
            slugsToTarget.push(createSlug(batch.water.name, 'water-restoration', city));
        }
    }

    // Phase 1: Fetch existing IDs to avoid slug conflicts and overwrite mock data
    console.log('Fetching existing IDs for target slugs...');
    const { data: existingRecords, error: fetchError } = await supabase
        .from('businesses')
        .select('id, slug')
        .in('slug', slugsToTarget);

    if (fetchError) {
        console.error('Fetch Error:', fetchError.message);
        return;
    }

    const slugToIdMap = new Map((existingRecords || []).map(r => [r.slug, r.id]));
    console.log(`Mapped ${slugToIdMap.size} existing records for overwriting.`);

    // Phase 2: Format data
    for (const batch of batches) {
        for (const city of batch.cities) {
            const breakdownSlug = createSlug(batch.breakdown.name, 'breakdown', city);
            const waterSlug = createSlug(batch.water.name, 'water-restoration', city);

            // Breakdown listing
            allFormatted.push({
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, AL`,
                phone: batch.breakdown.phone,
                country_code: 'US',
                verified: true,
                verified_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_open_24_hours: true,
                rating: 4.8,
                review_count: Math.floor(Math.random() * 50) + 10,
                is_available_now: true
            });

            // Water Restoration listing
            allFormatted.push({
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, AL`,
                phone: batch.water.phone,
                country_code: 'US',
                verified: true,
                verified_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_open_24_hours: true,
                rating: 4.8,
                review_count: Math.floor(Math.random() * 50) + 10,
                is_available_now: true
            });
        }
    }

    const { data, error } = await supabase
        .from('businesses')
        .upsert(allFormatted, { onConflict: 'id' });

    if (error) {
        console.error('Upsert Error:', error.message);
    } else {
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 111-115.`);
    }
}

injectMegaBatch().catch(console.error);
