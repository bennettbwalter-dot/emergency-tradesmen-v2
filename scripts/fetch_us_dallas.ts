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
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

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

// US City Configuration with dynamic grid coverage
interface CityConfig {
    name: string;
    center: { lat: number; lng: number };
    radius: number; // km - approximate city radius
    gridDensity: number; // cells per 10km
    state: string; // Added state for dynamic city processing
}

const US_CITIES: CityConfig[] = [
    // Large metros - high density coverage
    { name: 'Dallas', center: { lat: 32.7767, lng: -96.7970 }, radius: 25, gridDensity: 8, state: 'TX' }, // ~50+ grid cells
    { name: 'Houston', center: { lat: 29.7604, lng: -95.3698 }, radius: 30, gridDensity: 8, state: 'TX' },
    { name: 'Phoenix', center: { lat: 33.4484, lng: -112.0740 }, radius: 28, gridDensity: 8, state: 'AZ' },

    // Medium cities - moderate density
    { name: 'Austin', center: { lat: 30.2672, lng: -97.7431 }, radius: 20, gridDensity: 6, state: 'TX' },
    { name: 'San Antonio', center: { lat: 29.4241, lng: -98.4936 }, radius: 22, gridDensity: 6, state: 'TX' },

    // Smaller cities - lower density but still comprehensive
    { name: 'Fort Worth', center: { lat: 32.7555, lng: -97.3308 }, radius: 18, gridDensity: 5, state: 'TX' },
];

// Function to generate grid cells dynamically based on city size
function generateGridCells(city: CityConfig): { lat: number; lng: number; name: string }[] {
    const cells: { lat: number; lng: number; name: string }[] = [];

    // Calculate number of rings based on radius and density
    const cellsPerRing = Math.ceil((city.radius / 10) * city.gridDensity);
    const rings = Math.ceil((city.radius / 5)); // 5km per ring

    // Add center point
    cells.push({
        lat: city.center.lat,
        lng: city.center.lng,
        name: `${city.name} Downtown`
    });

    // Generate concentric rings
    for (let ring = 1; ring <= rings; ring++) {
        const ringRadius = ring * 5; // km
        const pointsInRing = cellsPerRing * ring; // More points in outer rings

        for (let i = 0; i < pointsInRing; i++) {
            const angle = (2 * Math.PI * i) / pointsInRing;

            // Convert km to degrees (approximate)
            const latOffset = (ringRadius / 111) * Math.cos(angle);
            const lngOffset = (ringRadius / (111 * Math.cos(city.center.lat * Math.PI / 180))) * Math.sin(angle);

            cells.push({
                lat: city.center.lat + latOffset,
                lng: city.center.lng + lngOffset,
                name: `${city.name} Zone ${ring}-${i + 1}`
            });
        }
    }

    console.log(`📍 Generated ${cells.length} grid cells for ${city.name} (radius: ${city.radius}km, density: ${city.gridDensity})`);
    return cells;
}


// All 7 trades
const TRADES = [
    { query: 'emergency plumber', slug: 'plumber' },
    { query: 'emergency electrician', slug: 'electrician' },
    { query: '24 hour locksmith', slug: 'locksmith' },
    { query: 'emergency gas engineer', slug: 'gas-engineer' },
    { query: 'emergency drain specialist', slug: 'drain-specialist' },
    { query: 'emergency glazier', slug: 'glazier' },
    { query: 'emergency breakdown recovery', slug: 'breakdown' },
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
    geometry?: {
        location: {
            lat: number;
            lng: number;
        }
    };
}

// Fetch places from Google Places API using Nearby Search
async function searchPlaces(query: string, location: { lat: number; lng: number }): Promise<GooglePlacesResult[]> {
    console.log(`  Searching: "${query}" near (${location.lat}, ${location.lng})`);

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&keyword=${encodeURIComponent(query)} Dallas Texas&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`  API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        return [];
    }

    return data.results || [];
}

// Fetch place details
async function getPlaceDetails(placeId: string): Promise<GooglePlacesResult | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,geometry&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
        return null;
    }

    return data.result;
}

// Extract city from address
function extractCity(address: string): string {
    // Simple extraction - look for Dallas or surrounding cities
    const cities = ['Dallas', 'Plano', 'Richardson', 'Irving', 'Carrollton', 'Garland', 'Mesquite', 'Grand Prairie'];
    for (const city of cities) {
        if (address.includes(city)) {
            return city;
        }
    }
    return 'Dallas'; // Default
}

// Main collection function
async function collectData() {
    console.log("🚀 Starting adaptive US data collection...\n");
    console.log(`Strategy: Dynamic grid coverage based on city size`);
    console.log(`Cities: ${US_CITIES.length} | Trades: ${TRADES.length}\n`);

    const allBusinesses: any[] = [];
    const seenPlaceIds = new Set<string>();
    let totalCollected = 0;

    for (const place of places) {
        // Skip duplicates
        if (seenPlaceIds.has(place.place_id)) {
            continue;
        }
        seenPlaceIds.add(place.place_id);

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

        const details = await getPlaceDetails(place.place_id);
        if (!details) continue;

        // Validation: Must have phone number
        const phone = details.formatted_phone_number || details.international_phone_number;
        if (!phone) {
            continue;
        }

        // Generate unique ID
        const uniqueId = `google-us-${details.place_id}`;
        const uuid = toUUID(uniqueId);

        // Generate slug
        const baseSlug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

        // Extract city from address
        const city = extractCity(details.formatted_address);

        // Map to database schema
        const business = {
            id: uuid,
            slug: slug,
            name: details.name,
            trade: trade.slug,
            city: city,
            state: 'TX',
            country_code: 'US', // CRITICAL: Set country_code to US
            address: details.formatted_address,
            phone: phone,
            website: details.website || null,
            latitude: details.geometry?.location.lat || null,
            longitude: details.geometry?.location.lng || null,
            rating: details.rating || 4.5,
            review_count: details.user_ratings_total || 0,
            hours: '24/7 Emergency Service',
            is_open_24_hours: true,
            verified: true,
            tier: 'free',
            priority_score: 0,
            // Insert into Supabase
            if(allBusinesses.length > 0) {
                console.log(`\n📤 Inserting into Supabase...`);

        const BATCH_SIZE = 50;
        let totalInserted = 0;

        for (let i = 0; i < allBusinesses.length; i += BATCH_SIZE) {
            const batch = allBusinesses.slice(i, i + BATCH_SIZE);

            const { error } = await supabase
                .from('businesses')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
            } else {
                totalInserted += batch.length;
                console.log(`  ✅ Batch ${i / BATCH_SIZE + 1}/${Math.ceil(allBusinesses.length / BATCH_SIZE)} (${totalInserted}/${allBusinesses.length})`);
            }

            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`\n🎉 Successfully inserted ${totalInserted} US businesses into Supabase`);
        console.log(`\n📊 Breakdown by trade:`);
        for (const trade of TRADES) {
            const count = allBusinesses.filter(b => b.trade === trade.slug).length;
            console.log(`  ${trade.slug}: ${count}`);
        }
    }
}

collectData().catch(console.error);
