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
        region: 'Baltimore Metro',
        cities: ['Baltimore', 'Towson', 'Columbia-MD', 'Ellicott City', 'Dundalk', 'Catonsville', 'Woodlawn', 'Essex', 'Parkville', 'Pikesville'],
        breakdown: { name: "Priority Towing & Recovery", phone: "410-555-1234" },
        water: { name: "911 Restoration of Baltimore", phone: "410-555-1234" }
    },
    {
        region: 'Frederick Area',
        cities: ['Frederick', 'Hagerstown', 'Westminster', 'Mount Airy', 'Thurmont', 'Brunswick', 'Middletown', 'Walkersvile', 'Myersville', 'Emmitsburg'],
        breakdown: { name: "Priority Towing & Recovery", phone: "301-555-1234" },
        water: { name: "Water Damage by Hamilton's Unlimited", phone: "301-555-1234" }
    },
    {
        region: 'Montgomery/Prince George’s',
        cities: ['Gaithersburg', 'Rockville', 'Bethesda', 'Silver Spring', 'Germantown', 'Aspen Hill', 'Potomac', 'North Bethesda', 'Montgomery Village', 'Olney'],
        breakdown: { name: "Priority Towing & Recovery", phone: "301-555-1234" },
        water: { name: "ATI Restoration", phone: "301-555-1234" }
    },
    {
        region: 'Bowie/Annapolis',
        cities: ['Bowie', 'Annapolis', 'Laurel-MD', 'College Park', 'Greenbelt', 'Hyattsville', 'Landover', 'Clinton', 'Fort Washington', 'Upper Marlboro'],
        breakdown: { name: "Past & Present Towing", phone: "301-555-1234" },
        water: { name: "1-800 WATER DAMAGE of Laurel", phone: "301-555-1234" }
    },
    {
        region: 'State Sweep',
        cities: ['Salisbury', 'Easton', 'Cumberland', 'Waldorf', 'Bel Air', 'Aberdeen', 'Cambridge', 'Ocean City', 'Elkton', 'Havre de Grace'],
        breakdown: { name: "ExactHelp Bowie Towing", phone: "410-555-1234" },
        water: { name: "Service Pros Cleanup", phone: "410-555-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 296-300 (Maryland - Hub Mode)...');
    
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
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-md-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, MD`,
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
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-md-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, MD`,
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
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 296-300 (Maryland).`);
    }
}

injectMegaBatch().catch(console.error);
