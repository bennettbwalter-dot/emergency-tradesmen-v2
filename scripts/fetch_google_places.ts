import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

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

// Generate deterministic UUID from string
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

// Configuration
const REGIONS = {
    wales: ['Cardiff', 'Swansea'],
    scotland: ['Edinburgh', 'Glasgow'],
    devon: ['Exeter', 'Plymouth']
};

const TRADES = [
    'emergency electrician',
    'emergency plumber',
    'emergency locksmith',
    'emergency gas engineer',
    'emergency heating engineer',
    'emergency boiler repair'
];

interface GooglePlacesResult {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    rating?: number;
    user_ratings_total?: number;
    website?: string;
    types: string[];
}

// Geocode city to get coordinates
async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ', UK')}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results[0]) {
        console.error(`Geocoding error for ${city}: ${data.status}`);
        return null;
    }

    return data.results[0].geometry.location;
}

// Fetch places from Google Places API using Nearby Search
async function searchPlaces(query: string, location: string): Promise<GooglePlacesResult[]> {
    // Get coordinates for the city
    const coords = await geocodeCity(location);
    if (!coords) {
        console.error(`Could not geocode ${location}`);
        return [];
    }

    console.log(`Searching: "${query}" near ${location} (${coords.lat}, ${coords.lng})`);

    // Use Nearby Search with keyword
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=25000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        return [];
    }

    return data.results || [];
}

// Fetch place details including phone number
async function getPlaceDetails(placeId: string): Promise<GooglePlacesResult | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,types&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
        console.error(`Details API Error: ${data.status}`);
        return null;
    }

    return data.result;
}

// Extract trade from query
function extractTrade(query: string): string {
    return query.replace('emergency ', '').trim();
}

// Main collection function
async function collectData() {
    console.log("Starting Google Places data collection...\n");

    const allBusinesses: any[] = [];
    let totalCollected = 0;
    let totalInserted = 0;

    for (const [region, cities] of Object.entries(REGIONS)) {
        console.log(`\n=== ${region.toUpperCase()} ===`);

        for (const city of cities) {
            console.log(`\n--- ${city} ---`);

            for (const tradeQuery of TRADES) {
                const trade = extractTrade(tradeQuery);

                // Search for places
                const places = await searchPlaces(tradeQuery, city);
                console.log(`  Found ${places.length} results for ${trade}`);

                // Get details for each place
                for (const place of places) {
                    // Add delay to respect API rate limits
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const details = await getPlaceDetails(place.place_id);
                    if (!details) continue;

                    // Validation: Must have phone number
                    const phone = details.formatted_phone_number || details.international_phone_number;
                    if (!phone) {
                        console.log(`    ⚠️  Skipping ${details.name} (no phone number)`);
                        continue;
                    }

                    // Generate unique ID
                    const uniqueId = `google-${details.place_id}`;
                    const uuid = toUUID(uniqueId);

                    // Generate slug
                    const baseSlug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

                    // Map to database schema
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
                        priority_score: 0,
                        featured_review: null
                    };

                    allBusinesses.push(business);
                    totalCollected++;
                    console.log(`    ✅ ${details.name} - ${phone}`);
                }

                console.log(`  Collected: ${totalCollected} total businesses so far`);
            }
        }
    }

    console.log(`\n\n=== COLLECTION COMPLETE ===`);
    console.log(`Total businesses collected: ${totalCollected}`);

    // Insert into Supabase
    if (allBusinesses.length > 0) {
        console.log(`\nInserting into Supabase...`);

        const BATCH_SIZE = 50;
        for (let i = 0; i < allBusinesses.length; i += BATCH_SIZE) {
            const batch = allBusinesses.slice(i, i + BATCH_SIZE);

            const { error } = await supabase
                .from('businesses')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
            } else {
                totalInserted += batch.length;
                console.log(`  Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(allBusinesses.length / BATCH_SIZE)} (${totalInserted}/${allBusinesses.length})`);
            }
        }

        console.log(`\n✅ Successfully inserted ${totalInserted} businesses into Supabase`);
    }
}

collectData().catch(console.error);
