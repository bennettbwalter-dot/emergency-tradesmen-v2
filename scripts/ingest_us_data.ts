import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);


// US State Codes Validation Map
const US_STATES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
]);

// Trade Mapping from filename keywords
const TRADE_MAP: Record<string, string> = {
    'plumber': 'plumber',
    'roofer': 'roofer',
    'electrician': 'electrician',
    'hvac': 'hvac',
    'lock': 'locksmith',
    'locksmith': 'locksmith',
    'drain': 'drain-specialist',
    'glazier': 'glazier',
    'glass': 'glazier',
    'builder': 'builder',
    'water-restoration': 'water-restoration',
    'breakdown': 'breakdown',
    'recovery': 'breakdown' // 'breakdown' is the trade key for breakdown recovery
};

interface RawBusiness {
    name: string;
    phone: string;
    address: string; // e.g., "Abilene, TX"
    rating?: number;
    review_count?: number;
    hours?: string;
    website?: string;
    trade?: string;
    socials?: any;
}


// Helpers
function getTradeFromFilename(filename: string): string | null {
    const lower = filename.toLowerCase();
    for (const [key, trade] of Object.entries(TRADE_MAP)) {
        if (lower.includes(key)) return trade;
    }
    return null;
}

function parseUSAddress(address: string): { city: string, state: string } | null {
    if (!address) return null;
    // Naive but effective for "City, ST" format
    // Looks for last comma
    const parts = address.split(',').map(s => s.trim());
    if (parts.length < 2) return null;

    const state = parts[parts.length - 1].toUpperCase().split(' ')[0]; // Handle "TX 75001" -> "TX"
    const city = parts[parts.length - 2];

    // STRICT REGION SEPARATION: Must be a valid US State
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

// Recursive file walker
function walkDir(dir: string, callback: (filePath: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (!dirPath.includes('node_modules') && !dirPath.includes('.git')) {
                walkDir(dirPath, callback);
            }
        } else {
            callback(dirPath);
        }
    });
}

// Main Ingestion
async function ingest() {
    console.log('🚀 Starting US Data Ingestion...');
    console.log('🔒 Enforcing Strict Region Separation: ONLY valid US State addresses will be accepted.');

    const files: string[] = [];
    walkDir(path.join(process.cwd(), 'scripts'), (filePath) => {
        const fn = path.basename(filePath);
        if (fn.endsWith('.json') &&
            !fn.includes('package') &&
            !fn.includes('tsconfig') &&
            !fn.includes('lock')) {
            files.push(filePath);
        }
    });

    console.log(`📂 Found ${files.length} candidate files.`);

    let totalProcessed = 0;
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const file of files) {
        const filename = path.basename(file);
        // filename trade is fall back
        const fileTrade = getTradeFromFilename(filename);

        try {
            let content = fs.readFileSync(file, 'utf-8');
            // Remove UTF-8 BOM if present
            content = content.replace(/^\uFEFF/, '');
            const rawData: RawBusiness[] = JSON.parse(content);
            if (!Array.isArray(rawData)) continue;


            const businessesToUpsert = [];

            for (const entry of rawData) {
                // PERMANENT DATA INTEGRITY RULE: No Mock Data.
                // Rule: "Every listing must have a valid phone number"
                if (!entry.phone || entry.phone.trim() === '') {
                    continue;
                }

                // Determine trade: Entry > Filename
                const recordTrade = entry.trade || fileTrade;

                if (!recordTrade) {
                    // If we still can't find a trade, skip this specific record
                    continue;
                }

                // Map to valid trade keys if necessary
                const cleanTrade = TRADE_MAP[recordTrade.toLowerCase()] || recordTrade.toLowerCase();

                const location = parseUSAddress(entry.address);
                if (!location) {
                    // STRICT SEPARATION: If not a valid US state, skip strictly.
                    continue;
                }

                const { city, state } = location;

                // Generate Slugs
                const citySlug = slugify(city);
                const stateSlug = slugify(state);
                // Make business slug unique by appending city/state AND random suffix
                const suffix = Math.random().toString(36).substring(2, 8);
                const businessSlug = `${slugify(entry.name)}-${citySlug}-${stateSlug}-${suffix}`;

                const businessRecord = {
                    name: entry.name,
                    phone: entry.phone,
                    address: entry.address,
                    city: city, // Store clean City
                    trade: cleanTrade,
                    rating: entry.rating || 0,
                    review_count: entry.review_count || 0,
                    hours: entry.hours || 'Open 24 hours',
                    is_open_24_hours: true,
                    website: entry.website || '',
                    country_code: 'US',
                    verified: true,
                    tier: 'free',
                    slug: businessSlug,
                    id: `us-${stateSlug}-${citySlug}-${businessSlug}-${cleanTrade}`,
                    social_links: entry.socials || {}
                };


                businessesToUpsert.push(businessRecord);
            }

            if (businessesToUpsert.length > 0) {
                // Batch Upsert
                const { error } = await supabase
                    .from('businesses')
                    .upsert(businessesToUpsert, { onConflict: 'id' });

                if (error) {
                    console.error(`❌ Error inserting batch from ${filename}:`, error.message);
                } else {
                    totalInserted += businessesToUpsert.length;
                    // console.log(`✅ ${filename}: Inserted ${businessesToUpsert.length} records.`);
                }
            }

            totalProcessed += rawData.length;

        } catch (e) {
            console.error(`❌ Error processing file ${filename}:`, e);
        }
    }

    console.log('\n🎉 INGESTION COMPLETE');
    console.log(`📊 Processed Files: ${files.length}`);
    console.log(`📊 Total Records Found: ${totalProcessed}`);
    console.log(`✅ Total Verified US Records Inserted: ${totalInserted}`);
}

ingest().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});

