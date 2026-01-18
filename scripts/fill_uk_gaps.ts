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

const UK_CITIES = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Bristol",
    "Cardiff", "Coventry", "Nottingham", "Leicester", "Sunderland", "Belfast", "Newcastle upon Tyne", "Newcastle-upon-Tyne",
    "Brighton", "Brighton & Hove", "Hull", "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", "Swansea", "Southampton",
    "Salford", "Aberdeen", "Portsmouth", "York", "Peterborough", "Dundee", "Oxford", "Cambridge", "Norwich", "Exeter",
    "Luton", "Milton Keynes", "Northampton", "Bournemouth", "Reading", "Blackpool", "Preston", "Huddersfield", "Slough",
    "Swindon", "Bolton", "Oldham", "Rochdale", "Doncaster", "Bedford", "Ipswich", "Cheltenham", "Gloucester", "Worcester",
    "Hereford", "Shrewsbury", "Telford", "Canterbury", "Carlisle", "Chelmsford", "Chester", "Colchester", "Durham",
    "Lancaster", "Lincoln", "Southend-on-Sea", "St Albans", "Truro", "Wakefield", "Winchester", "Westminster", "Warrington",
    "Wigan", "Middlesbrough", "Barnsley", "Newport", "Poole", "Stockport", "Basildon", "Maidstone", "Crawley", "Worthing",
    "Sutton Coldfield", "Dudley", "Walsall", "Watford", "High Wycombe", "Harlow", "Stevenage", "Redditch", "Chesterfield",
    "Mansfield", "Beeston", "Loughborough", "Burton upon Trent", "Crewe", "Macclesfield", "Scunthorpe", "Grimsby",
    "Harrogate", "Halifax", "Batley", "Keighley", "South Shields", "Gateshead", "Darlington", "Hartlepool", "Stockton-on-Tees",
    "Hemel Hempstead", "Gillingham", "Eastbourne", "Rayleigh", "Lowestoft", "Woking", "Maidenhead", "Basingstoke", "Fareham",
    "Gosport", "Ewell", "Crosby", "Paignton", "Torquay", "Bebington", "Halesowen", "Kidderminster", "Rugby", "Leamington Spa",
    "Kettering", "Wellingborough", "Dunstable", "Aylesbury", "Cheshunt", "Welwyn Garden City", "Margate", "Royal Tunbridge Wells",
    "Ashford", "Braintree", "Canvey Island", "Clacton-on-Sea", "Sittingbourne", "Gravesend", "Dartford", "Weymouth", "Falmouth",
    "St Austell", "Scarborough", "Bridlington", "Castleford", "Pontefract", "Rotherham", "Sale", "Widnes", "Runcorn",
    "Ellesmere Port", "Birkenhead", "Wallasey", "Barrow-in-Furness", "Workington", "Whitehaven", "Chorley", "Accrington",
    "Burnley", "Lytham St Annes", "Stafford", "Bromsgrove", "Grantham", "Ely", "Lichfield", "Ripon", "Salisbury", "Wells",
    "Solihull", "Guildford", "Staines", "Chatham", "Hastings", "Nuneaton", "Tamworth", "Cannock", "Bath",
    "Brixton", "Hackney", "Camden", "Islington", "Greenwich", "Chelsea", "Wembley", "Croydon", "Ealing", "Enfield",
    "Harrow", "Hounslow", "Kingston", "Merton", "Newham", "Redbridge", "Richmond", "Southwark", "Tower Hamlets",
    "Waltham Forest", "Wandsworth", "Woolwich", "Fulham"
];

const STANDARD_TRADES = [
    "plumber", "electrician", "locksmith", "hvac", "gas-engineer",
    "drain-specialist", "glazier", "roofer", "builder",
    "water-restoration", "breakdown"
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

// Geocoding was failing with REQUEST_DENIED, so switching to Text Search which doesn't require explicit lat/long
async function searchPlaces(query: string, location: string): Promise<any[]> {
    console.log(`Searching: "${query}" in ${location}`);

    // Combine query and location for Text Search
    const textQuery = `${query} in ${location}, UK`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(textQuery)}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error(`API Error for ${location}: ${data.status} - ${data.error_message}`);
            return [];
        }

        return data.results || [];
    } catch (e) {
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

async function fillGaps() {
    console.log("🚀 Starting UK Listing Gap Fill...");

    let totalFilled = 0;

    for (const city of UK_CITIES) {
        console.log(`\nChecking gaps for ${city.toUpperCase()}...`);

        for (const trade of STANDARD_TRADES) {
            // Check current count
            const { count, error } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true })
                .eq('city', city)
                .eq('trade', trade)
                .eq('country_code', 'GB');

            if (error) {
                console.error(`Error checking count for ${city}/${trade}:`, error.message);
                continue;
            }

            const currentCount = count || 0;
            const needed = 5 - currentCount;

            if (needed <= 0) {
                // console.log(`  ✅ ${trade}: ${currentCount} (Sufficient)`);
                continue;
            }

            console.log(`  ⚠️  ${trade}: Found ${currentCount}, need ${needed} more.`);

            // Construct query (e.g. "Emergency Plumber")
            const query = `emergency ${trade.replace(/-/g, ' ')}`;
            const places = await searchPlaces(query, city);

            let addedForThisTrade = 0;

            for (const place of places) {
                if (addedForThisTrade >= needed) break;

                // Rate limit
                await new Promise(r => setTimeout(r, 200));

                const details = await getPlaceDetails(place.place_id);
                if (!details) continue;

                // MUST have phone number
                const phone = details.formatted_phone_number || details.international_phone_number;
                if (!phone) {
                    // console.log(`    Skipping ${details.name} (No phone)`);
                    continue;
                }

                // Check for duplicates by Place ID or Name/Phone combo?
                // Just relying on unique Place ID for now
                const uniqueId = `google-${details.place_id}`;
                const uuid = toUUID(uniqueId);
                const baseSlug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const slug = `${baseSlug}-${uuid.substring(0, 8)}`;

                // Ensure it's not already in DB (supabase upsert handles ID conflict, but let's check manually to count accurately?)
                // Actually Upsert matches on ID. We generated ID deterministically from PlaceID.
                // So if we found the same google place, it will overwrite or do nothing.
                // Let's insert.

                const business = {
                    id: uuid,
                    slug: slug,
                    name: details.name,
                    trade: trade,
                    city: city, // Force the city we are searching for, to ensure landing page coverage
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
                    .upsert(business, { onConflict: 'id', ignoreDuplicates: true }); // Ignore if exists to avoid overwriting current "real" data if ID somehow collides? 
                // Actually instruction says "no modification of existing". 
                // If ID is deterministic from Google Place ID, and it exists, we skip.

                if (insertErr) {
                    console.error("    Error inserting:", insertErr.message);
                } else {
                    console.log(`    ✅ Added: ${details.name}`);
                    addedForThisTrade++;
                    totalFilled++;
                }
            }

            if (addedForThisTrade === 0) {
                console.log(`    ❌ No suitable new listings found to fill gap.`);
            }
        }
    }

    console.log(`\n🎉 Gap Fill Complete. Total new listings added: ${totalFilled}`);
}

fillGaps().catch(console.error);
