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
        region: 'Charleston Area',
        cities: ['Charleston', 'South Charleston', 'Dunbar', 'Nitro', 'St. Albans', 'Cross Lanes', 'Belle', 'Marmet', 'Montgomery', 'Elkview'],
        breakdown: { name: "Copley Garage Inc.", phone: "304-555-1234" },
        water: { name: "Clean Slate Restorations", phone: "304-555-1234" }
    },
    {
        region: 'Huntington Area',
        cities: ['Huntington', 'Barboursville', 'Milton', 'Ona', 'Culloden', 'Teays Valley', 'Scott Depot', 'Winfield', 'Hurricane', 'Kenova'],
        breakdown: { name: "Huntington Towing Services", phone: "304-555-1234" },
        water: { name: "Clean Slate Restorations", phone: "304-555-1234" }
    },
    {
        region: 'Morgantown Area',
        cities: ['Morgantown', 'Westover', 'Star City', 'Granville', 'Blacksville', 'Cheat Lake', 'Brookhaven', 'Cassville', 'Osage', 'Pursglove'],
        breakdown: { name: "Summers Towing & Repair", phone: "304-555-1234" },
        water: { name: "Crossroads Property Rescue", phone: "304-555-1234" }
    },
    {
        region: 'Parkersburg Area',
        cities: ['Parkersburg', 'Vienna', 'Williamstown', 'North Hills', 'Belpre-OH', 'Lubeck', 'Mineral Wells', 'Washington-WV', 'Waverly', 'Boaz'],
        breakdown: { name: "Pifer's Service Center", phone: "304-555-1234" },
        water: { name: "Panhandle Cleaning & Restoration", phone: "304-555-1234" }
    },
    {
        region: 'Wheeling Area',
        cities: ['Wheeling', 'Bethlehem', 'Clearview', 'Triadelphia', 'Valley Grove', 'West Liberty', 'Moundsville', 'Glen Dale', 'McMechen', 'Benwood'],
        breakdown: { name: "A-1 Braden's Towing", phone: "304-555-1234" },
        water: { name: "Panhandle Cleaning & Restoration", phone: "304-555-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 436-440 (West Virginia - Hub Mode)...');
    
    let allFormatted = [];
    let slugsToTarget = [];
    let processedSlugs = new Set();

    for (const batch of batches) {
        for (const city of batch.cities) {
            const breakdownSlug = createSlug(batch.breakdown.name, 'breakdown', city);
            const waterSlug = createSlug(batch.water.name, 'water-restoration', city);
            
            if (!processedSlugs.has(breakdownSlug)) {
                slugsToTarget.push(breakdownSlug);
                processedSlugs.add(breakdownSlug);
            }
            if (!processedSlugs.has(waterSlug)) {
                slugsToTarget.push(waterSlug);
                processedSlugs.add(waterSlug);
            }
        }
    }

    // Phase 1: Fetch existing IDs
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
    processedSlugs.clear();
    for (const batch of batches) {
        for (const city of batch.cities) {
            const breakdownSlug = createSlug(batch.breakdown.name, 'breakdown', city);
            const waterSlug = createSlug(batch.water.name, 'water-restoration', city);

            // Breakdown listing
            if (!processedSlugs.has(breakdownSlug)) {
                allFormatted.push({
                    id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-wv-${city}-breakdown-${batch.breakdown.name}`),
                    name: batch.breakdown.name,
                    slug: breakdownSlug,
                    trade: 'breakdown',
                    city: city,
                    address: `${city}, WV`,
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
                processedSlugs.add(breakdownSlug);
            }

            // Water Restoration listing
            if (!processedSlugs.has(waterSlug)) {
                allFormatted.push({
                    id: slugToIdMap.get(waterSlug) || generateUUID(`us-wv-${city}-water-restoration-${batch.water.name}`),
                    name: batch.water.name,
                    slug: waterSlug,
                    trade: 'water-restoration',
                    city: city,
                    address: `${city}, WV`,
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
                processedSlugs.add(waterSlug);
            }
        }
    }

    const { data, error } = await supabase
        .from('businesses')
        .upsert(allFormatted, { onConflict: 'id' });

    if (error) {
        console.error('Upsert Error:', error.message);
    } else {
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 436-440 (West Virginia).`);
    }
}

injectMegaBatch().catch(console.error);
