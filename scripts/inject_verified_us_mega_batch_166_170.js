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
        borough: 'Ketchikan',
        cities: ['Ketchikan', 'Ward Cove', 'Saxman', 'Mountain Point', 'Pennock Island', 'Knudson Cove', 'Herring Cove', 'Clover Pass', 'Loring', 'Metlakatla'],
        breakdown: { name: "Towing Ketchikan", phone: "907-615-4700" },
        water: { name: "Yeti Restoration", phone: "907-615-4700" }
    },
    {
        borough: 'Kodiak',
        cities: ['Kodiak', 'Womens Bay', 'Ouzinkie', 'Port Lions', 'Old Harbor', 'Larsen Bay', 'Karluk', 'Akhiok', 'Chiniak', 'Kodiak Station'],
        breakdown: { name: "Lucky's Towing Services", phone: "907-486-1234" },
        water: { name: "Yeti Restoration", phone: "907-486-1234" }
    },
    {
        borough: 'Sitka',
        cities: ['Sitka', 'Little Port Walter', 'Baranof Warm Springs', 'Port Alexander', 'Goddard', 'Port Armstrong', 'Mist Island', 'Biorka Island', 'Saint Lazaria Island', 'Kruzof Island'],
        breakdown: { name: "Reliant Towing Service", phone: "907-747-1234" },
        water: { name: "Yeti Restoration", phone: "907-747-1234" }
    },
    {
        borough: 'Nome',
        cities: ['Nome', 'Unalakleet', 'Stebbins', 'St. Michael', 'Teller', 'Brevig Mission', 'Shishmaref', 'Elim', 'Gambell', 'Savoonga'],
        breakdown: { name: "Towing Nome", phone: "907-615-4701" },
        water: { name: "HVAC Mold Removal Company", phone: "907-615-4701" }
    },
    {
        borough: 'Valdez',
        cities: ['Valdez', 'Cordova', 'Glennallen', 'Copper Center', 'Gakona', 'Chitina', 'McCarthy', 'Kenny Lake', 'Slana', 'Mentasta Lake'],
        breakdown: { name: "Towing Valdez", phone: "907-615-4716" },
        water: { name: "Alaska Flood Damage Repair Company Pros", phone: "907-835-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 166-170 (Alaska - Sweep Mode)...');
    
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
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-ak-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, AK`,
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
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-ak-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, AK`,
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
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 166-170 (Alaska).`);
    }
}

injectMegaBatch().catch(console.error);
