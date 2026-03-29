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
    console.error("❌ Missing VITE_GOOGLE_MAPS_API_KEY");
    process.exit(1);
}

// Generate deterministic UUID
function toUUID(str) {
    const hash = createHash('md5').update(str).digest('hex');
    const chars = hash.split('');
    chars[12] = '4';
    chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);
    return [
        chars.slice(0, 8).join(''),
        chars.slice(8, 12).join(''),
        chars.slice(12, 16).join(''),
        chars.slice(16, 20).join(''),
        chars.slice(20).join('')
    ].join('-');
}

// Load UK cities
const ukCitiesPath = path.join(__dirname, '../src/lib/uk_cities.json');
const UK_CITIES = JSON.parse(fs.readFileSync(ukCitiesPath, 'utf-8'));

// Major cities with known coordinates
const CITY_COORDS = {
    'London': { lat: 51.5074, lng: -0.1278 },
    'Birmingham': { lat: 52.4862, lng: -1.8904 },
    'Manchester': { lat: 53.4808, lng: -2.2426 },
    'Glasgow': { lat: 55.8642, lng: -4.2518 },
    'Leeds': { lat: 53.8008, lng: -1.5491 },
    'Liverpool': { lat: 53.4084, lng: -2.9916 },
    'Sheffield': { lat: 53.3811, lng: -1.4701 },
    'Edinburgh': { lat: 55.9533, lng: -3.1883 },
    'Bristol': { lat: 51.4545, lng: -2.5879 },
    'Cardiff': { lat: 51.4816, lng: -3.1791 },
    'Belfast': { lat: 54.5973, lng: -5.9301 },
    'Newcastle': { lat: 54.9783, lng: -1.6178 },
    'Nottingham': { lat: 52.9548, lng: -1.1581 },
    'Leicester': { lat: 52.6369, lng: -1.1398 },
    'Coventry': { lat: 52.4068, lng: -1.5197 },
    'Bradford': { lat: 53.7960, lng: -1.7594 },
    'Hull': { lat: 53.7457, lng: -0.3367 },
    'Plymouth': { lat: 50.3755, lng: -4.1427 },
    'Southampton': { lat: 50.9097, lng: -1.4044 },
    'Portsmouth': { lat: 50.8198, lng: -1.0880 }
};

// Geocode city name to coordinates
async function geocodeCity(cityName) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName + ', UK')}&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
            return data.results[0].geometry.location;
        }
    } catch (e) {
        console.error(`Geocode error for ${cityName}:`, e.message);
    }
    return null;
}

// Search for roofers/builders near coordinates
async function searchNearby(coords, query) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=15000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
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
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,opening_hours,geometry&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.status === 'OK' ? data.result : null;
    } catch (e) {
        console.error('Details Error:', e.message);
        return null;
    }
}

function isValidUKPhone(phone) {
    if (!phone) return false;
    return /^(\+44|0|\(0\))/.test(phone.replace(/\s/g, ''));
}

async function collectCityData(cityName, targetCount) {
    const businesses = [];
    const seenPlaceIds = new Set();

    // Get coordinates
    let coords = CITY_COORDS[cityName];
    if (!coords) {
        coords = await geocodeCity(cityName);
        await new Promise(r => setTimeout(r, 200));
    }

    if (!coords) {
        console.log(`  ${cityName} - Could not geocode, skipping`);
        return [];
    }

    process.stdout.write(`  ${cityName}... `);

    const queries = ['roofer', 'roofing contractor', 'builder', 'building contractor'];

    for (const query of queries) {
        if (businesses.length >= targetCount) break;

        const places = await searchNearby(coords, query);
        await new Promise(r => setTimeout(r, 200));

        for (const place of places) {
            if (businesses.length >= targetCount) break;
            if (seenPlaceIds.has(place.place_id)) continue;
            seenPlaceIds.add(place.place_id);

            await new Promise(r => setTimeout(r, 150));

            const details = await getPlaceDetails(place.place_id);
            if (!details) continue;

            const phone = details.formatted_phone_number || details.international_phone_number;
            if (!isValidUKPhone(phone)) continue;

            const uuid = toUUID(`google-uk-roofer-${details.place_id}`);
            const slug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${uuid.substring(0, 8)}`;

            businesses.push({
                id: uuid,
                slug,
                name: details.name,
                trade: 'roofer',
                city: cityName,
                country_code: 'GB',
                address: details.formatted_address,
                phone,
                website: details.website || null,
                latitude: details.geometry?.location.lat,
                longitude: details.geometry?.location.lng,
                rating: details.rating || 0,
                review_count: details.user_ratings_total || 0,
                is_open_24_hours: details.opening_hours?.open_now_text?.includes('24') || false,
                google_place_id: details.place_id
            });
        }
    }

    console.log(`Found ${businesses.length}`);
    return businesses;
}

async function main() {
    console.log("🏴󠁧󠁢󠁥󠁮󠁧󠁿 UK ROOFER/BUILDER DATA COLLECTION (FIXED)\n");

    const allBusinesses = [];

    // Test with London first
    console.log("🧪 Testing with London first...");
    const londonData = await collectCityData('London', 5);

    if (londonData.length === 0) {
        console.error("\n❌ API still not working. Please check:");
        console.error("   1. Google Maps API billing is enabled");
        console.error("   2. Places API is enabled in Google Cloud Console");
        console.error("   3. API key has sufficient quota");
        process.exit(1);
    }

    console.log(`\n✅ API working! Found ${londonData.length} London businesses\n`);
    allBusinesses.push(...londonData);

    // Continue with all major cities
    console.log("📍 Collecting from major cities (20 each):");
    const majorCities = Object.keys(CITY_COORDS).filter(c => c !== 'London');

    for (const city of majorCities) {
        const data = await collectCityData(city, 20);
        allBusinesses.push(...data);
    }

    // Save results
    const outputPath = path.join(__dirname, 'uk_roofers_major_cities.json');
    fs.writeFileSync(outputPath, JSON.stringify(allBusinesses, null, 2));

    console.log(`\n✅ Collection complete!`);
    console.log(`   Total businesses: ${allBusinesses.length}`);
    console.log(`   Saved to: uk_roofers_major_cities.json`);
    console.log(`\n📊 Next: Run 'node scripts/import_uk_roofers.mjs' to import to database`);
}

main().catch(console.error);
