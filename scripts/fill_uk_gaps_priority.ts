
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { cityPostcodes } from '../src/lib/cityPostcodes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing required environment variables");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const PROGRESS_FILE = path.join(__dirname, 'uk_gap_fill_progress.json');

const STANDARD_TRADES = [
    "plumber", "electrician", "locksmith", "hvac", "gas-engineer",
    "drain-specialist", "glazier", "roofer", "builder",
    "water-restoration", "breakdown"
];

const SCOTLAND_CITIES = [
    "Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling",
    "Paisley", "East Kilbride", "Livingston", "Hamilton", "Cumbernauld", "Dunfermline",
    "Kirkcaldy", "Ayr", "Dumfries", "Falkirk", "Kilmarnock", "Motherwell",
    "Coatbridge", "Clydebank", "Greenock", "Glenrothes"
];

const WALES_CITIES = [
    "Cardiff", "Swansea", "Newport", "Newport (Wales)", "Wrexham", "Bangor", "Bangor (Wales)",
    "St Asaph", "St Davids", "Llandudno", "Rhyl", "Caerphilly", "Bridgend",
    "Merthyr Tydfil", "Cwmbran", "Barry", "Llanelli", "Neath", "Port Talbot"
];

const NI_CITIES = [
    "Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Coleraine", "Londonderry",
    "Omagh", "Enniskillen", "Bangor"
];

const PRIORITY_CITIES = [
    ...new Set([...SCOTLAND_CITIES, ...WALES_CITIES, ...NI_CITIES])
];

function toUUID(str: string): string {
    const hash = createHash('md5').update(str).digest('hex');
    const chars = hash.split('');
    chars[12] = '3';
    chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);
    return [
        chars.slice(0, 8).join(''),
        chars.slice(8, 12).join(''),
        chars.slice(12, 16).join(''),
        chars.slice(16, 20).join(''),
        chars.slice(20).join('')
    ].join('-');
}

async function searchPlaces(query: string, location: string): Promise<any[]> {
    console.log(`Searching: "${query}" in ${location}`);
    const textQuery = `${query} in ${location}, UK`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(textQuery)}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            const msg = `API Error for ${location}: ${data.status} - ${data.error_message}`;
            console.error(msg);
            if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
                throw new Error(data.status); // Throw to trigger circuit breaker
            }
            return [];
        }
        return data.results || [];
    } catch (e: any) {
        if (e.message === 'REQUEST_DENIED' || e.message === 'OVER_QUERY_LIMIT') throw e;
        console.error(`Fetch error searching ${textQuery}:`, e);
        return [];
    }
}

async function getPlaceDetails(placeId: string): Promise<any | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK') {
            console.error(`Details API Error: ${data.status}`);
            return null;
        }
        return data.result;
    } catch (e) {
        console.error("Fetch error getting details:", e);
        return null;
    }
}

async function processCityTrade(city: string, trade: string): Promise<number> {
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', city)
        .eq('trade', trade)
        .eq('country_code', 'GB');

    if (error) {
        console.error(`Error checking count for ${city}/${trade}:`, error.message);
        return 0;
    }

    const currentCount = count || 0;
    const needed = 5 - currentCount;

    if (needed <= 0) return 0;

    console.log(`\n  ⚠️  ${city} - ${trade}: Found ${currentCount}, need ${needed} more.`);

    const query = `emergency ${trade.replace(/-/g, ' ')}`;
    const places = await searchPlaces(query, city); // Can throw

    let addedForThisTrade = 0;

    for (const place of places) {
        if (addedForThisTrade >= needed) break;
        await new Promise(r => setTimeout(r, 200));

        const details = await getPlaceDetails(place.place_id);
        if (!details) continue;

        const phone = details.formatted_phone_number || details.international_phone_number;
        if (!phone) continue;

        const uniqueId = `google-${details.place_id}`;
        const uuid = toUUID(uniqueId);
        const baseSlug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

        const business = {
            id: uuid,
            slug: slug,
            name: details.name,
            trade: trade,
            city: city,
            address: details.formatted_address,
            phone: phone,
            website: details.website || null,
            rating: details.rating || 5.0,
            review_count: details.user_ratings_total || 0,
            hours: '24/7 Emergency Service',
            is_open_24_hours: true,
            verified: true,
            tier: 'free',
            country_code: 'GB',
            priority_score: 0
        };

        const { error: insertErr } = await supabase
            .from('businesses')
            .upsert(business, { onConflict: 'id', ignoreDuplicates: true });

        if (insertErr) {
            console.error("    Error inserting:", insertErr.message);
        } else {
            console.log(`    ✅ Added: ${details.name}`);
            addedForThisTrade++;
        }
    }

    if (addedForThisTrade === 0) {
        console.log(`    ❌ No suitable new listings found to fill gap.`);
    }

    return addedForThisTrade;
}

function loadProgress(): string[] {
    if (fs.existsSync(PROGRESS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        } catch (e) { console.error("Error reading progress", e); }
    }
    return [];
}

function saveProgress(completedCities: string[]) {
    try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(completedCities, null, 2));
    } catch (e) {
        console.error("Error saving progress:", e);
    }
}

async function fillGaps() {
    console.log("🚀 Starting UK Listing Gap Fill (Resumable)...");

    const allKnownCities = Object.keys(cityPostcodes);
    const sortedCities = [
        ...PRIORITY_CITIES,
        ...allKnownCities.filter(c => !PRIORITY_CITIES.includes(c))
    ].filter((v, i, a) => a.indexOf(v) === i); // unique

    let completed = loadProgress();
    console.log(`Loaded ${completed.length} completed cities from progress file.`);

    let totalFilled = 0;
    let consecutiveErrors = 0;

    for (const city of sortedCities) {
        if (!city || city.trim().length < 2) continue;

        if (completed.includes(city)) {
            // console.log(`Skipping ${city} (already completed)`);
            continue;
        }

        console.log(`\nChecking gaps for ${city.toUpperCase()}...`);

        try {
            for (const trade of STANDARD_TRADES) {
                const added = await processCityTrade(city, trade);
                totalFilled += added;
            }
            // Mark city as done only if no critical error occurred
            completed.push(city);
            saveProgress(completed);
            consecutiveErrors = 0; // Reset on success

        } catch (e: any) {
            console.error(`💥 Critical error processing ${city}:`, e.message);
            consecutiveErrors++;
            if (e.message === 'REQUEST_DENIED' || e.message === 'OVER_QUERY_LIMIT' || consecutiveErrors > 5) {
                console.error("Aborting due to persistent API errors.");
                process.exit(1);
            }
        }
    }

    console.log(`\n🎉 Gap Fill Complete. Total new listings added: ${totalFilled}`);
}

fillGaps().catch(console.error);
