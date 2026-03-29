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

// Target Dallas Suburbs
const TARGET_SUBURBS = [
    { name: 'Plano', state: 'TX', center: { lat: 33.0198, lng: -96.6989 }, radius: 15, gridDensity: 4 },
    { name: 'Frisco', state: 'TX', center: { lat: 33.1507, lng: -96.8236 }, radius: 15, gridDensity: 4 },
    { name: 'Irving', state: 'TX', center: { lat: 32.8140, lng: -96.9488 }, radius: 12, gridDensity: 4 },
    { name: 'Arlington', state: 'TX', center: { lat: 32.7357, lng: -97.1081 }, radius: 15, gridDensity: 4 }
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
    console.log("🤠 STARTING DALLAS SUBURBS DATA COLLECTION\n");
    console.log(`Targets: ${TARGET_SUBURBS.map(c => c.name).join(', ')}`);

    for (const city of TARGET_SUBURBS) {
        const cityBusinesses = [];
        const seenPlaceIds = new Set();
        const gridCells = generateGridCells(city);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🏡 Processing ${city.name} (${gridCells.length} grid points)`);
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

                    const uuid = toUUID(`google-us-suburb-${details.place_id}`);
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

    console.log("\n🎉 ALL SUBURBS COMPLETE");
}

collectData().catch(console.error);
