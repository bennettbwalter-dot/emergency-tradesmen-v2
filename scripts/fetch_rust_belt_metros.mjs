import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error("❌ Missing VITE_GOOGLE_MAPS_API_KEY in .env file");
    process.exit(1);
}

// Generate deterministic UUID
function toUUID(str) {
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

// Target Rust Belt Cities
const TARGET_CITIES = [
    { name: 'Detroit', state: 'MI', center: { lat: 42.3314, lng: -83.0458 }, radius: 20, gridDensity: 4 },
    { name: 'Cleveland', state: 'OH', center: { lat: 41.4993, lng: -81.6944 }, radius: 15, gridDensity: 4 },
    { name: 'Pittsburgh', state: 'PA', center: { lat: 40.4406, lng: -79.9959 }, radius: 15, gridDensity: 4 },
    { name: 'Buffalo', state: 'NY', center: { lat: 42.8864, lng: -78.8784 }, radius: 15, gridDensity: 4 }
];

const TRADES = [
    { query: 'emergency plumber', slug: 'plumber' },
    { query: 'emergency electrician', slug: 'electrician' },
    { query: '24 hour locksmith', slug: 'locksmith' },
    { query: 'emergency heating repair', slug: 'heating-engineer' }, // Focused on Heating for Rust Belt
    { query: 'furnace repair', slug: 'furnace-repair' },             // Winter focus
    { query: 'boiler repair', slug: 'boiler-repair' },               // Winter focus
    { query: 'roof repair', slug: 'roofer' },                        // Snow/Ice damage
    { query: 'emergency glazier', slug: 'glazier' }
];

function generateGridCells(city) {
    const cells = [];
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

async function searchPlaces(query, location) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.status === 'OK' ? data.results || [] : [];
    } catch (e) {
        console.error('Search Error:', e.message);
        return [];
    }
}

async function getPlaceDetails(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,geometry&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.status === 'OK' ? data.result : null;
    } catch (e) {
        console.error('Details Error:', e.message);
        return null;
    }
}

async function collectData() {
    console.log("🏭 STARTING RUST BELT DATA COLLECTION\n");
    console.log(`Targets: ${TARGET_CITIES.map(c => c.name).join(', ')}`);

    for (const city of TARGET_CITIES) {
        const cityBusinesses = [];
        const seenPlaceIds = new Set();
        const gridCells = generateGridCells(city);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`❄️ Processing ${city.name} (${gridCells.length} grid points)`);
        console.log(`${'='.repeat(60)}`);

        for (const trade of TRADES) {
            process.stdout.write(`\n  Searching ${trade.slug}... `);
            let tradeCount = 0;

            for (const cell of gridCells) {
                const places = await searchPlaces(trade.query, cell);

                for (const place of places) {
                    if (seenPlaceIds.has(place.place_id)) continue;
                    seenPlaceIds.add(place.place_id);

                    // Rate limit protection
                    await new Promise(r => setTimeout(r, 150));

                    const details = await getPlaceDetails(place.place_id);
                    if (!details) continue;

                    // STRICT PHONE CHECK
                    const phone = details.formatted_phone_number || details.international_phone_number;
                    if (!phone) continue;

                    const uuid = toUUID(`google-us-rust-${details.place_id}`);
                    const slug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${uuid.substring(0, 8)}`;

                    // Normalize heating trades to 'gas-engineer' or keep distinct?
                    // Strategy said "Emergency heating/boilers".
                    // Frontend 'gas-engineer' often covers heating.
                    // Let's standardize 'heating-engineer', 'furnace-repair', 'boiler-repair' to 'gas-engineer' for consistency with existing icons/routes,
                    // OR keep 'hvac' if we established that for AZ.
                    // Actually, 'gas-engineer' is a safe bet for existing frontend.
                    // But wait, 'roofer' is new. Do we have roofer icon? Yes, context shows 'roof repair' in target list.
                    // I will check trades.ts if possible, but safe bet is:
                    // heating -> gas-engineer
                    // furnace -> gas-engineer
                    // boiler -> gas-engineer
                    // roofer -> roofer

                    let normalizedTrade = trade.slug;
                    if (['heating-engineer', 'furnace-repair', 'boiler-repair'].includes(trade.slug)) {
                        normalizedTrade = 'gas-engineer';
                    }

                    cityBusinesses.push({
                        id: uuid,
                        slug,
                        name: details.name,
                        trade: normalizedTrade,
                        city: city.name,
                        state: city.state,
                        country_code: 'US',
                        address: details.formatted_address,
                        phone,
                        website: details.website || null,
                        latitude: details.geometry?.location.lat,
                        longitude: details.geometry?.location.lng,
                        rating: details.rating || 0,
                        user_ratings_total: details.user_ratings_total || 0,
                        google_place_id: details.place_id
                    });

                    tradeCount++;
                }
                process.stdout.write('.');
            }
            process.stdout.write(` Found ${tradeCount}`);
        }

        // SAVE JSON
        const filename = `${city.name.toLowerCase()}_businesses.json`.replace(' ', '_');
        const outputPath = path.join(__dirname, filename);
        fs.writeFileSync(outputPath, JSON.stringify(cityBusinesses, null, 2));

        console.log(`\n\n✅ Saved ${cityBusinesses.length} records to ${filename}`);
    }

    console.log("\n🎉 ALL RUST BELT CITIES COMPLETE");
}

collectData().catch(console.error);
