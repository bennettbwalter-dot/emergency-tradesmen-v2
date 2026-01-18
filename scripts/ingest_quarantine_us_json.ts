import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client (Hardcoded verified credentials)
const supabaseUrl = 'https://antqstrspkchkoylysqa.supabase.co';
const supabaseServiceKey = 'sb_secret_cU09MJkRP69u1Nrb7C4gsw_h1vI_Y5_';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// US State Codes Validation Map
const US_STATES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
]);

// Trade Mapping: the JSON files seem to have "plumber" etc. already, but we ensure mapping.
// The file viewed used "plumber".
// We reuse the map to be safe.
const TRADE_MAP: Record<string, string> = {
    'plumber': 'plumber',
    'electrician': 'electrician',
    'locksmith': 'locksmith',
    'gas-engineer': 'gas-engineer',
    'drain-specialist': 'drain-specialist',
    'glazier': 'glazier',
    'breakdown': 'breakdown',
    'roofer': 'roofer',
    'builder': 'builder',
    'hvac': 'hvac',
    'water-restoration': 'water-restoration'
};

interface JsonBusiness {
    id: string; // Original ID
    slug: string; // Original Slug
    name: string;
    trade: string;
    city: string;
    state: string;
    country_code: string;
    address: string;
    phone: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    rating?: number;
    user_ratings_total?: number;
}

// Helpers
function parseUSAddress(address: string): { city: string, state: string } | null {
    if (!address) return null;
    const parts = address.split(',').map(s => s.trim());
    if (parts.length < 2) return null;

    let statePart = parts[parts.length - 1];
    if (statePart === 'USA' && parts.length > 2) {
        statePart = parts[parts.length - 2];
    }

    // Extract State Code (e.g., "TX 76013" -> "TX")
    const stateMatch = statePart.match(/([A-Z]{2})/);
    const state = stateMatch ? stateMatch[1] : '';

    let city = '';
    if (parts[parts.length - 1] === 'USA') {
        city = parts[parts.length - 3];
    } else {
        city = parts[parts.length - 2];
    }

    if (!US_STATES.has(state)) {
        return null;
    }
    return { city, state };
}

function slugify(text: string): string {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Main Ingestion
async function ingest() {
    console.log('🚀 Starting Quarantine US JSON Data Ingestion...');

    const sourceDir = path.join(process.cwd(), '_unused_quarantine', 'UK_DATA');
    if (!fs.existsSync(sourceDir)) {
        console.error(`❌ Source directory not found: ${sourceDir}`);
        return;
    }

    // Filter for *_businesses.json
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('_businesses.json'));
    console.log(`📂 Found ${files.length} candidate JSON files.`);

    let totalInserted = 0;
    let totalProcessed = 0;

    for (const file of files) {
        console.log(`Processing ${file}...`);
        try {
            const content = fs.readFileSync(path.join(sourceDir, file), 'utf-8');
            const data: JsonBusiness[] = JSON.parse(content);

            if (!Array.isArray(data)) {
                console.warn(`Skipping ${file}: Not an array`);
                continue;
            }

            const businessesToUpsertMap = new Map();

            for (const entry of data) {
                if (!entry.phone || entry.phone.trim() === '') continue;

                // Validate Trade
                const tradeSlug = TRADE_MAP[entry.trade.toLowerCase()];
                if (!tradeSlug) continue;

                // Validate Region (Strict US)
                const location = parseUSAddress(entry.address);
                if (!location) continue;

                const { city, state } = location;
                const citySlug = slugify(city);
                const stateSlug = slugify(state);
                const businessSlug = `${slugify(entry.name)}-${citySlug}-${stateSlug}`;

                // Deterministic ID override to ensure consistency
                const id = `us-${stateSlug}-${citySlug}-${businessSlug}-${tradeSlug}`;

                businessesToUpsertMap.set(id, {
                    id: id,
                    name: entry.name,
                    phone: entry.phone,
                    address: entry.address,
                    city: city,
                    trade: tradeSlug,
                    // If original has rating, use it.
                    rating: entry.rating || 0,
                    review_count: entry.user_ratings_total || 0,
                    website: entry.website || '',
                    hours: 'Open 24 hours',
                    is_open_24_hours: true,
                    country_code: 'US',
                    verified: true,
                    tier: 'free',
                    city_slug: citySlug,
                    state_slug: stateSlug,
                    slug: businessSlug + '-' + Math.random().toString(36).substring(2, 6)
                });
            }

            const businessesToUpsert = Array.from(businessesToUpsertMap.values());

            // Chunking for massive files (e.g. Dallas 3MB might have many records)
            // Supabase upsert has payload limits. Safest to chunk by 1000.
            const CHUNK_SIZE = 500;
            for (let i = 0; i < businessesToUpsert.length; i += CHUNK_SIZE) {
                const chunk = businessesToUpsert.slice(i, i + CHUNK_SIZE);
                if (chunk.length > 0) {
                    const { error } = await supabase
                        .from('businesses')
                        .upsert(chunk, { onConflict: 'id' });

                    if (error) {
                        console.error(`❌ Error inserting chunk from ${file} (starting index ${i}):`, error.message);
                    } else {
                        totalInserted += chunk.length;
                    }
                }
            }

            totalProcessed += data.length;

        } catch (e) {
            console.error(`❌ Error processing file ${file}:`, e);
        }
    }

    console.log('\n🎉 QUARANTINE INGESTION COMPLETE');
    console.log(`📊 Total Records Processed: ${totalProcessed}`);
    console.log(`✅ Total Verified US Records Inserted: ${totalInserted}`);
}

ingest().catch(console.error);
