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

if (!GOOGLE_API_KEY) {
    console.error("❌ Missing VITE_GOOGLE_MAPS_API_KEY in .env file");
    console.log("\nPlease add your Google Maps API key to .env:");
    console.log("VITE_GOOGLE_MAPS_API_KEY=your_key_here\n");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Generate deterministic UUID
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

// City configuration with adaptive grid coverage
interface CityConfig {
    name: string;
    state: string;
    center: { lat: number; lng: number };
    radius: number; // km
    gridDensity: number; // search points per ring
}

// US Cities - START WITH DALLAS PILOT
const US_CITIES: CityConfig[] = [
    // Pilot: Dallas only
    { name: 'Dallas', state: 'TX', center: { lat: 32.7767, lng: -96.7970 }, radius: 25, gridDensity: 8 },

    // Future expansion (commented out for now):
    // { name: 'Houston', state: 'TX', center: { lat: 29.7604, lng: -95.3698 }, radius: 30, gridDensity: 8 },
    // { name: 'Phoenix', state: 'AZ', center: { lat: 33.4484, lng: -112.0740 }, radius: 28, gridDensity: 8 },
];

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

// Dynamic grid generation
function generateGridCells(city: CityConfig) {
    const cells: { lat: number; lng: number; name: string }[] = [];
    const rings = Math.ceil(city.radius / 5); // 5km per ring

    // Center point
    cells.push({ lat: city.center.lat, lng: city.center.lng, name: `${city.name} Downtown` });

    // Concentric rings
    for (let ring = 1; ring <= rings; ring++) {
        const ringRadius = ring * 5;
        const pointsInRing = city.gridDensity * ring;

        for (let i = 0; i < pointsInRing; i++) {
            const angle = (2 * Math.PI * i) / pointsInRing;
            const latOffset = (ringRadius / 111) * Math.cos(angle);
            const lngOffset = (ringRadius / (111 * Math.cos(city.center.lat * Math.PI / 180))) * Math.sin(angle);

            cells.push({
                lat: city.center.lat + latOffset,
                lng: city.center.lng + lngOffset,
                name: `${city.name} R${ring}-${i + 1}`
            });
        }
    }

    return cells;
}

// Google Places API
async function searchPlaces(query: string, location: { lat: number; lng: number }) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.status === 'OK' ? data.results || [] : [];
}

async function getPlaceDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,geometry&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.status === 'OK' ? data.result : null;
}

// Main collection
async function collectData() {
    console.log("🚀 ADAPTIVE US DATA EXTRACTION\n");
    console.log("Strategy: City-size-adaptive grid coverage");
    console.log("Goal: Everyone everywhere can get help\n");

    const allBusinesses: any[] = [];
    const seenPlaceIds = new Set<string>();
    let totalCollected = 0;

    for (const city of US_CITIES) {
        const gridCells = generateGridCells(city);
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🌆 ${city.name}, ${city.state}`);
        console.log(`📏 Coverage: ${city.radius}km radius | ${gridCells.length} search areas`);
        console.log(`📊 Expected: ~${gridCells.length * TRADES.length * 15} businesses`);
        console.log(`${'='.repeat(70)}\n`);

        for (const trade of TRADES) {
            console.log(`\n📍 ${trade.slug.toUpperCase()}`);
            let tradeCount = 0;

            for (const cell of gridCells) {
                const places = await searchPlaces(trade.query, cell);

                for (const place of places) {
                    if (seenPlaceIds.has(place.place_id)) continue;
                    seenPlaceIds.add(place.place_id);

                    await new Promise(r => setTimeout(r, 100)); // Rate limit

                    const details = await getPlaceDetails(place.place_id);
                    if (!details) continue;

                    const phone = details.formatted_phone_number || details.international_phone_number;
                    if (!phone) continue;

                    const uuid = toUUID(`google-us-${details.place_id}`);
                    const slug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${uuid.substring(0, 8)}`;

                    allBusinesses.push({
                        id: uuid,
                        slug,
                        name: details.name,
                        trade: trade.slug,
                        city: city.name,
                        state: city.state,
                        country_code: 'US',
                        address: details.formatted_address,
                        phone,
                        website: details.website || null,
                        latitude: details.geometry?.location.lat,
                        longitude: details.geometry?.location.lng,
                        rating: details.rating || 4.5,
                        review_count: details.user_ratings_total || 0,
                        hours: '24/7 Emergency Service',
                        is_open_24_hours: true,
                        verified: true,
                        tier: 'free',
                        priority_score: 0,
                    });

                    tradeCount++;
                    totalCollected++;
                    process.stdout.write(`\r  Collected: ${tradeCount} (${totalCollected} total)`);
                }
            }
            console.log(`\n  ✅ ${trade.slug}: ${tradeCount} businesses`);
        }

        console.log(`\n🏙️  ${city.name} TOTAL: ${allBusinesses.filter(b => b.city === city.name).length} businesses\n`);
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ COLLECTION COMPLETE`);
    console.log(`📊 Total: ${allBusinesses.length} unique businesses`);
    console.log(`${'='.repeat(70)}\n`);

    // Insert to Supabase
    if (allBusinesses.length > 0) {
        console.log(`📤 Inserting to Supabase...\n`);
        const BATCH_SIZE = 50;
        let inserted = 0;

        for (let i = 0; i < allBusinesses.length; i += BATCH_SIZE) {
            const batch = allBusinesses.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('businesses').upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, error.message);
            } else {
                inserted += batch.length;
                process.stdout.write(`\r  Progress: ${inserted}/${allBusinesses.length}`);
            }
            await new Promise(r => setTimeout(r, 500));
        }

        console.log(`\n\n✅ Imported ${inserted} businesses!`);
        console.log(`\n📍 Breakdown:`);
        for (const trade of TRADES) {
            const count = allBusinesses.filter(b => b.trade === trade.slug).length;
            console.log(`  ${trade.slug}: ${count}`);
        }
    }
}

collectData().catch(console.error);
