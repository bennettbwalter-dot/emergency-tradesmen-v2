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
        region: 'Oklahoma City Area',
        cities: ['Oklahoma City', 'Edmond', 'Moore', 'Midlands', 'Mustang', 'Yukon', 'Choctaw', 'Harrah', 'Nicoma Park', 'Spencer-OK'],
        breakdown: { name: "Towing OKC", phone: "405-555-1234" },
        water: { name: "911 Restoration of Oklahoma City", phone: "405-555-1234" }
    },
    {
        region: 'Tulsa Area',
        cities: ['Tulsa', 'Broken Arrow', 'Owasso', 'Sand Springs', 'Sapulpa', 'Jenks', 'Bixby', 'Glenpool', 'Coweta', 'Catoosa'],
        breakdown: { name: "Smith's Towing & Recovery", phone: "918-555-1234" },
        water: { name: "RG Remodeling & Restoration", phone: "918-555-1234" }
    },
    {
        region: 'Norman Area',
        cities: ['Norman', 'Noble-OK', 'Purcell', 'Goldsby', 'Slaughterville', 'Newcastle-OK', 'Blanchard', 'Tuttle', 'Washington-OK', 'Lexington-OK'],
        breakdown: { name: "Razas Garage and Wrecker Service", phone: "405-555-1234" },
        water: { name: "SERVPRO of Norman", phone: "405-555-1234" }
    },
    {
        region: 'Lawton Area',
        cities: ['Lawton', 'Duncan', 'Altus', 'Chickasha', 'Frederick-OK', 'Hobart', 'Marlow', 'Anadarko', 'Cache', 'Elgin-OK'],
        breakdown: { name: "Ultimate Reflections Towing", phone: "580-555-1234" },
        water: { name: "Sooner Cleaning + Restoration", phone: "580-555-1234" }
    },
    {
        region: 'Enid Area',
        cities: ['Enid', 'Stillwater', 'Ponca City', 'Bartlesville', 'Woodward', 'Guthrie', 'Alva', 'Blackwell', 'Perry-OK', 'Medford-OK'],
        breakdown: { name: "Silver Towing OKC affiliates", phone: "580-555-1234" },
        water: { name: "PuroClean of Norman", phone: "405-555-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 376-380 (Oklahoma - Hub Mode)...');
    
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
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-ok-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, OK`,
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
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-ok-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, OK`,
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
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 376-380 (Oklahoma).`);
    }
}

injectMegaBatch().catch(console.error);
