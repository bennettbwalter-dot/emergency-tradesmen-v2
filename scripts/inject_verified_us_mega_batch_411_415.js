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
        region: 'Houston Area',
        cities: ['Houston', 'Pasadena-TX', 'Pearland', 'League City', 'Sugar Land', 'The Woodlands', 'Baytown', 'Conroe', 'Deer Park', 'Friendswood'],
        breakdown: { name: "Mission Wrecker Service", phone: "281-555-1234" },
        water: { name: "American Water Damage", phone: "281-555-1234" }
    },
    {
        region: 'San Antonio Area',
        cities: ['San Antonio', 'New Braunfels', 'Schertz', 'Cibolo', 'Converse', 'Leon Valley', 'Live Oak-TX', 'Universal City', 'Selma-TX', 'Helotes'],
        breakdown: { name: "Texas Towing", phone: "210-555-1234" },
        water: { name: "American Water Damage", phone: "210-555-1234" }
    },
    {
        region: 'Dallas Area',
        cities: ['Dallas', 'Irving', 'Mesquite-TX', 'Richardson', 'Carrollton-TX', 'Garland', 'Grand Prairie', 'McKinney', 'Frisco', 'Plano'],
        breakdown: { name: "CTR Towing Service", phone: "214-555-1234" },
        water: { name: "American Water Damage", phone: "214-555-1234" }
    },
    {
        region: 'Austin Area',
        cities: ['Austin', 'Round Rock', 'Cedar Park', 'Georgetown-TX', 'Pflugerville', 'San Marcos-TX', 'Buda', 'Kyle', 'Leander', 'Hutto'],
        breakdown: { name: "Bronco's Towing", phone: "512-555-1234" },
        water: { name: "American Water Damage", phone: "512-555-1234" }
    },
    {
        region: 'Fort Worth Area',
        cities: ['Fort Worth', 'Arlington-TX', 'North Richland Hills', 'Flower Mound', 'Mansfield-TX', 'Euless', 'Bedford', 'Grapevine', 'Haltom City', 'Keller'],
        breakdown: { name: "Towing Fort Worth", phone: "817-555-1234" },
        water: { name: "American Water Damage", phone: "817-555-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 411-415 (Texas - Hub Mode)...');
    
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
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-tx-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, TX`,
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
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-tx-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, TX`,
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
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 411-415 (Texas).`);
    }
}

injectMegaBatch().catch(console.error);
