
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
    console.error("❌ Missing VITE_GOOGLE_MAPS_API_KEY in .env file");
    process.exit(1);
}

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

interface CityConfig {
    name: string;
    state: string;
    center: { lat: number; lng: number };
    radius: number; // km
    gridDensity: number; // search points per ring
}

// Comprehensive list of major US cities
const US_CITIES: CityConfig[] = [
    { name: 'New York', state: 'NY', center: { lat: 40.7128, lng: -74.0060 }, radius: 15, gridDensity: 8 },
    { name: 'Los Angeles', state: 'CA', center: { lat: 34.0522, lng: -118.2437 }, radius: 25, gridDensity: 8 },
    { name: 'San Francisco', state: 'CA', center: { lat: 37.7749, lng: -122.4194 }, radius: 12, gridDensity: 6 },
    { name: 'Chicago', state: 'IL', center: { lat: 41.8781, lng: -87.6298 }, radius: 20, gridDensity: 8 },
    { name: 'Houston', state: 'TX', center: { lat: 29.7604, lng: -95.3698 }, radius: 25, gridDensity: 8 },
    { name: 'Phoenix', state: 'AZ', center: { lat: 33.4484, lng: -112.0740 }, radius: 25, gridDensity: 8 },
    { name: 'Philadelphia', state: 'PA', center: { lat: 39.9526, lng: -75.1652 }, radius: 15, gridDensity: 6 },
    { name: 'San Antonio', state: 'TX', center: { lat: 29.4241, lng: -98.4936 }, radius: 20, gridDensity: 7 },
    { name: 'San Diego', state: 'CA', center: { lat: 32.7157, lng: -117.1611 }, radius: 20, gridDensity: 7 },
    { name: 'Dallas', state: 'TX', center: { lat: 32.7767, lng: -96.7970 }, radius: 20, gridDensity: 8 },
    { name: 'San Jose', state: 'CA', center: { lat: 37.3382, lng: -121.8863 }, radius: 15, gridDensity: 6 },
];

const TRADES = [
    { query: 'emergency plumber', slug: 'plumber' },
    { query: 'emergency electrician', slug: 'electrician' },
    { query: '24 hour locksmith', slug: 'locksmith' },
    { query: 'emergency gas engineer', slug: 'gas-engineer' },
    { query: 'emergency drain specialist', slug: 'drain-specialist' },
    { query: 'emergency glazier', slug: 'glazier' },
    { query: 'emergency breakdown recovery', slug: 'breakdown' },
];

function generateGridCells(city: CityConfig) {
    const cells: { lat: number; lng: number; name: string }[] = [];
    const rings = Math.ceil(city.radius / 5);

    cells.push({ lat: city.center.lat, lng: city.center.lng, name: `${city.name} Downtown` });

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

async function searchPlaces(query: string, location: { lat: number; lng: number }) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error(`\nAPI Error for ${query}: ${data.status} - ${data.error_message}`);
        }
        return data.status === 'OK' ? data.results || [] : [];
    } catch (e) {
        console.error(`Fetch error:`, e);
        return [];
    }
}

async function getPlaceDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,geometry&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.status === 'OK' ? data.result : null;
    } catch (e) {
        console.error(`Details error:`, e);
        return null;
    }
}

async function collectData() {
    console.log("🚀 STARTING NATIONWIDE US DATA COLLECTION\n");
    console.log(`Targets: ${US_CITIES.length} Cities`);
    console.log(`Trades: ${TRADES.map(t => t.slug).join(', ')}\n`);

    for (const city of US_CITIES) {
        const cityBusinesses: any[] = [];
        const seenPlaceIds = new Set<string>();
        console.log(`${'='.repeat(70)}`);
        console.log(`🌆 Processing ${city.name}, ${city.state}`);
        const gridCells = generateGridCells(city);
        console.log(`   Grid: ${gridCells.length} search points`);

        for (const trade of TRADES) {
            process.stdout.write(`   Scanning ${trade.slug.padEnd(16)} `);
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

                    // FILTER OUT MOCK DATA
                    if (phone.includes('555-')) continue;

                    const uuid = toUUID(`google-us-${details.place_id}`);
                    const slug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${uuid.substring(0, 8)}`;

                    cityBusinesses.push({
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
                    process.stdout.write('.');
                }
            }
            console.log(` (${tradeCount} found)`);
        }

        // Save to file
        const filename = `${city.name.toLowerCase().replace(/ /g, '_')}_businesses.json`;
        const filepath = path.join(__dirname, filename);
        fs.writeFileSync(filepath, JSON.stringify(cityBusinesses, null, 2));
        console.log(`✅ Saved ${cityBusinesses.length} businesses to ${filename}\n`);
    }

    console.log("\n🎉 ALL CITIES COMPLETE");
}

collectData().catch(console.error);
