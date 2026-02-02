import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const hereApiKey = process.env.HERE_API_KEY || '';

if (!hereApiKey) {
    console.error("❌ HERE_API_KEY not found in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Trade to HERE category mapping
const TRADE_CATEGORIES = {
    'plumber': 'plumber',
    'electrician': 'electrician',
    'locksmith': 'locksmith',
    'drain-specialist': 'drain cleaning',
    'glazier': 'glass repair',
    'roofer': 'roofing contractor',
    'water-restoration': 'water damage restoration',
    'breakdown': 'towing service',
    'hvac': 'hvac contractor'
};

// State name to abbreviation
const STATE_ABBREVS = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateSlug(name, id) {
    const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    return `${slug}-${id.substring(0, 8)}`;
}

function calculateTrustScore(biz) {
    let score = 1; // Real service business = 1
    if (biz.website) score++;
    if (biz.rating && biz.rating > 0) score++;
    // Email and social will be added during enrichment phase
    return Math.min(score, 5);
}

async function searchHERE(query, city, state) {
    const stateAbbrev = STATE_ABBREVS[state] || state;
    const searchQuery = encodeURIComponent(`${query} in ${city}, ${stateAbbrev}, USA`);

    const url = `https://discover.search.hereapi.com/v1/discover?q=${searchQuery}&in=countryCode:USA&limit=10&apiKey=${hereApiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HERE API error: ${response.status}`);
            return [];
        }
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error(`HERE API fetch error: ${error.message}`);
        return [];
    }
}

function validateBusiness(item, trade, city) {
    // Must have name
    if (!item.title) return null;

    // Must have phone (US format)
    const phone = item.contacts?.[0]?.phone?.[0]?.value;
    if (!phone) return null;

    // Must have address in US
    const address = item.address;
    if (!address || address.countryCode !== 'USA') return null;

    const businessId = uuidv4();

    return {
        id: businessId,
        slug: generateSlug(item.title, businessId),
        name: item.title,
        trade: trade,
        city: city,
        state: address.state || '',
        country_code: 'US',
        address: address.label || '',
        phone: phone,
        website: item.contacts?.[0]?.www?.[0]?.value || null,
        latitude: item.position?.lat || null,
        longitude: item.position?.lng || null,
        rating: null, // HERE doesn't provide ratings
        review_count: 0,
        hours: '24/7 Emergency Service',
        is_open_24_hours: true,
        verified: true,
        tier: 'free',
        priority_score: 0
    };
}

async function getExistingCount(city, trade) {
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'US')
        .ilike('city', `%${city}%`)
        .eq('trade', trade)
        .eq('verified', true);

    if (error) return 0;
    return count || 0;
}

async function insertBusinesses(businesses) {
    if (businesses.length === 0) return 0;

    const { data, error } = await supabase
        .from('businesses')
        .upsert(businesses, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
        console.error(`Insert error: ${error.message}`);
        return 0;
    }

    return businesses.length;
}

async function processGap(gap) {
    const { city, state, trade, currentCount, needed } = gap;

    // Skip if already at target
    if (needed <= 0) return 0;

    // Re-check current count (might have changed)
    const actualCount = await getExistingCount(city, trade);
    const actualNeeded = Math.max(0, 5 - actualCount);

    if (actualNeeded <= 0) {
        return 0;
    }

    // Search for businesses
    const searchTerm = TRADE_CATEGORIES[trade] || trade;
    const results = await searchHERE(searchTerm, city, state);

    // Validate and filter
    const validBusinesses = [];
    for (const item of results) {
        if (validBusinesses.length >= actualNeeded) break;

        const validated = validateBusiness(item, trade, city);
        if (validated) {
            validated.trust_score = calculateTrustScore(validated);
            validBusinesses.push(validated);
        }
    }

    // Insert
    if (validBusinesses.length > 0) {
        const inserted = await insertBusinesses(validBusinesses);
        return inserted;
    }

    return 0;
}

async function main() {
    console.log("🚀 USA Listing Gap-Fill Script Started");
    console.log("=".repeat(60));

    // Load gaps
    const gapsPath = path.join(__dirname, 'us_listing_gaps.json');
    if (!fs.existsSync(gapsPath)) {
        console.error("❌ Gap file not found. Run analyze_us_gaps.js first.");
        process.exit(1);
    }

    const gaps = JSON.parse(fs.readFileSync(gapsPath, 'utf8'));
    console.log(`📊 Loaded ${gaps.length} gaps to process`);

    // Prioritize major cities first
    const majorCities = ['Dallas', 'Houston', 'Austin', 'Los Angeles', 'San Diego', 'San Francisco',
        'New York', 'Phoenix', 'Chicago', 'Miami', 'Orlando', 'Seattle', 'Denver'];

    const prioritizedGaps = gaps.sort((a, b) => {
        const aIsMajor = majorCities.includes(a.city) ? 1 : 0;
        const bIsMajor = majorCities.includes(b.city) ? 1 : 0;
        if (aIsMajor !== bIsMajor) return bIsMajor - aIsMajor;
        return b.needed - a.needed;
    });

    let totalInserted = 0;
    let processed = 0;
    const startTime = Date.now();

    for (const gap of prioritizedGaps) {
        try {
            const inserted = await processGap(gap);
            totalInserted += inserted;
            processed++;

            if (inserted > 0) {
                console.log(`✅ ${gap.city}, ${gap.state} | ${gap.trade} | +${inserted} listings`);
            }

            // Progress update every 100 gaps
            if (processed % 100 === 0) {
                const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
                console.log(`📊 Progress: ${processed}/${gaps.length} gaps | ${totalInserted} total inserted | ${elapsed}min`);
            }

            // Rate limiting - 5 requests/sec for HERE API
            await sleep(220);

        } catch (error) {
            console.error(`❌ Error processing ${gap.city}/${gap.trade}: ${error.message}`);
            await sleep(1000);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log("\n" + "=".repeat(60));
    console.log(`🎉 Gap-Fill Complete!`);
    console.log(`📊 Processed: ${processed} gaps`);
    console.log(`📊 Inserted: ${totalInserted} new listings`);
    console.log(`⏱️ Time: ${totalTime} minutes`);
}

main().catch(console.error);
