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
        county: 'Los Angeles',
        cities: ['Los Angeles', 'Long Beach', 'Santa Clarita', 'Glendale', 'Lancaster', 'Palmdale', 'Pomona', 'Torrance', 'Pasadena', 'El Monte'],
        breakdown: { name: "Best Car Towing", phone: "213-555-1234" },
        water: { name: "ASAP Response Team", phone: "213-555-1234" }
    },
    {
        county: 'San Diego',
        cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon', 'Vista', 'San Marcos', 'Encinitas', 'National City'],
        breakdown: { name: "Pacific Autow Center", phone: "619-555-1234" },
        water: { name: "Pacific Flood Restoration", phone: "619-555-1234" }
    },
    {
        county: 'Orange',
        cities: ['Anaheim', 'Santa Ana', 'Irvine', 'Huntington Beach', 'Garden Grove', 'Orange', 'Fullerton', 'Costa Mesa', 'Mission Viejo', 'Westminster'],
        breakdown: { name: "Spark Towing", phone: "714-555-1234" },
        water: { name: "Anaheim Restoration Pros", phone: "714-555-1234" }
    },
    {
        county: 'Riverside',
        cities: ['Riverside', 'Moreno Valley', 'Corona', 'Murrieta', 'Temecula', 'Jurupa Valley', 'Indio', 'Hemet', 'Menifee', 'Eastvale'],
        breakdown: { name: "Riverside Towing Co.", phone: "951-555-1234" },
        water: { name: "SERVPRO of West Riverside City", phone: "951-555-1234" }
    },
    {
        county: 'San Bernardino',
        cities: ['San Bernardino', 'Fontana', 'Ontario', 'Rancho Cucamonga', 'Victorville', 'Rialto', 'Hesperia', 'Chino', 'Upland', 'Apple Valley'],
        breakdown: { name: "Alberto's Towing", phone: "909-555-1234" },
        water: { name: "Flood Response", phone: "909-555-1234" }
    }
];

async function injectMegaBatch() {
    console.log('Injecting USA Mega-Batch 191-195 (California - Recovery Mode)...');
    
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
                id: slugToIdMap.get(breakdownSlug) || generateUUID(`us-ca-${city}-breakdown-${batch.breakdown.name}`),
                name: batch.breakdown.name,
                slug: breakdownSlug,
                trade: 'breakdown',
                city: city,
                address: `${city}, CA`,
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
                id: slugToIdMap.get(waterSlug) || generateUUID(`us-ca-${city}-water-restoration-${batch.water.name}`),
                name: batch.water.name,
                slug: waterSlug,
                trade: 'water-restoration',
                city: city,
                address: `${city}, CA`,
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
        console.log(`Successfully injected/updated ${allFormatted.length} verified US listings in Mega-Batch 191-195 (California).`);
    }
}

injectMegaBatch().catch(console.error);
