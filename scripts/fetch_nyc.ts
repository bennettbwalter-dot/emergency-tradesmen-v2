import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error("Missing VITE_GOOGLE_MAPS_API_KEY environment variable");
    process.exit(1);
}

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

const CITIES = [
    'New York, NY',
    'Brooklyn, NY',
    'Queens, NY',
    'Manhattan, NY',
    'The Bronx, NY',
    'Staten Island, NY'
];

const TRADES = [
    'emergency electrician',
    'emergency plumber',
    'emergency locksmith',
    'emergency gas engineer',
    'emergency drain service',
    'emergency glazier',
    'emergency roofer'
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

// Hardcoded coordinates to bypass Geocoding API issues
const COORDS: Record<string, { lat: number; lng: number }> = {
    'New York, NY': { lat: 40.7128, lng: -74.0060 },
    'Brooklyn, NY': { lat: 40.6782, lng: -73.9442 },
    'Queens, NY': { lat: 40.7282, lng: -73.7949 },
    'Manhattan, NY': { lat: 40.7831, lng: -73.9712 },
    'The Bronx, NY': { lat: 40.8448, lng: -73.8648 },
    'Staten Island, NY': { lat: 40.5795, lng: -74.1502 }
};

// Fetch places from Google Places API using Nearby Search
async function searchPlaces(query: string, location: string): Promise<GooglePlacesResult[]> {
    const coords = COORDS[location];
    if (!coords) {
        console.error(`No coordinates found for ${location}`);
        return [];
    }


    console.log(`Searching: "${query}" near ${location} (${coords.lat}, ${coords.lng})`);
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=15000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            return [];
        }
        return data.results || [];
    } catch (e) {
        console.error(`Fetch error searching ${query} in ${location}:`, e);
        return [];
    }
}

// Fetch place details including phone number
async function getPlaceDetails(placeId: string): Promise<GooglePlacesResult | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,types&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK') {
            console.error(`Details API Error: ${data.status}`);
            return null;
        }
        return data.result;
    } catch (e) {
        console.error(`Fetch error details ${placeId}:`, e);
        return null;
    }
}

function extractTrade(query: string): string {
    const t = query.replace('emergency ', '').replace(', NY', '').trim();
    if (t.includes('gas')) return 'gas-engineer';
    if (t.includes('drain')) return 'drain-specialist';
    return t;
}

async function collectData() {
    console.log("Starting NYC Data Collection...");
    const allBusinesses: any[] = [];
    const seenIds = new Set<string>();

    for (const city of CITIES) {
        console.log(`\n=== Processing ${city} ===`);
        for (const tradeQuery of TRADES) {
            const places = await searchPlaces(tradeQuery, city);

            for (const place of places) {
                if (seenIds.has(place.place_id)) continue;
                seenIds.add(place.place_id);

                await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit

                const details = await getPlaceDetails(place.place_id);
                if (!details) continue;

                const phone = details.formatted_phone_number || details.international_phone_number;
                if (!phone) continue; // Must have phone

                const uniqueId = `google-${details.place_id}`;
                const uuid = toUUID(uniqueId);
                const baseSlug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

                let trade = extractTrade(tradeQuery);
                // Clean up trade names to match schema
                if (trade === 'gas engineer') trade = 'gas-engineer';
                if (trade === 'drain service') trade = 'drain-specialist';

                const business = {
                    id: uuid,
                    slug: slug,
                    name: details.name,
                    trade: trade,
                    city: 'New York', // Unify under 'New York' for the main pages
                    suburb: city.split(',')[0], // Store borough as suburb?
                    address: details.formatted_address,
                    phone: phone,
                    website: details.website || null,
                    rating: details.rating || 4.5,
                    review_count: details.user_ratings_total || 0,
                    hours: '24/7 Emergency Service',
                    is_open_24_hours: true,
                    verified: true,
                    tier: 'free',
                    priority_score: 0,
                    featured_review: null
                };

                allBusinesses.push(business);
                process.stdout.write('.');
            }
        }
    }

    console.log(`\n\nTotal Unique NYC Businesses Collected: ${allBusinesses.length}`);
    fs.writeFileSync(path.join(__dirname, 'new_york_businesses.json'), JSON.stringify(allBusinesses, null, 2));
    console.log("Saved to scripts/new_york_businesses.json");
}

collectData().catch(console.error);
