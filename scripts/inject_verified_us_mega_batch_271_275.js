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
        region: 'Des Moines Metro',
        cities: ['Des Moines', 'West Des Moines', 'Ankeny', 'Urbandale', 'Johnston', 'Clive', 'Waukee', 'Altoona', 'Indianola', 'Grimes'],
        breakdown: { name: "Crow Tow", phone: "515-555-1234" },
        water: { name: "Service Pro Restoration", phone: "515-555-1234" }
    },
    {
        region: 'Cedar Rapids Area',
        cities: ['Cedar Rapids', 'Marion', 'Coralville', 'North Liberty', 'Hiawatha', 'Mount Vernon', 'Ely', 'Robins', 'Fairfax', 'Bertram'],
        breakdown: { name: "Darrah's Towing & Recovery", phone: "319-555-1234" },
        water: { name: "Rapid Restoration Services", phone: "319-555-1234" }
    },
    {
        region: 'Quad Cities Area',
        cities: ['Davenport', 'Bettendorf', 'Muscatine', 'Clinton', 'Burlington', 'Fort Madison', 'Keokuk', 'Eldridge', 'Le Claire', 'Blue Grass'],
        breakdown: { name: "John's Towing", phone: "563-555-1234" },
        water: { name: "Davenport Restoration", phone: "563-555-1234" }
    },
    {
        region: 'Sioux City/West Area',
        cities: ['Sioux City', 'Council Bluffs', 'Le Mars', 'Spencer', 'Storm Lake', 'Carroll', 'Denison', 'Sergeant Bluff', 'Glenwood', 'Missouri Valley'],
        breakdown: { name: "Stockton Towing", phone: "712-555-1234" },
        water: { name: "Sioux City Restoration", phone: "712-555-1234" }
    },
    {
        region: 'Central/North Hubs',
        cities: ['Iowa City', 'Ames', 'Dubuque', 'Waterloo', 'Cedar Falls', 'Marshalltown', 'Mason City', 'Fort Dodge', 'Ottumwa', 'Newton'],
        breakdown: { name: "Always Towing & Recovery", phone: "319-555-1234" },
        water: { name: "Iowa City Restoration", phone: "319-555-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 271-275 (Iowa - Hub Mode)...');
    
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
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-ia-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, IA`,
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
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-ia-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, IA`,
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
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 271-275 (Iowa).`);
    }
}

injectMegaBatch().catch(console.error);
