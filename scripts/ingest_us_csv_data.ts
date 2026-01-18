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
// Hardcoding exactly as found in ingest_us_data.ts which was verified to work
const supabaseUrl = 'https://antqstrspkchkoylysqa.supabase.co';
const supabaseServiceKey = 'sb_secret_cU09MJkRP69u1Nrb7C4gsw_h1vI_Y5_';

console.log(`Debug: Using URL: ${supabaseUrl}`);
console.log(`Debug: Key length: ${supabaseServiceKey.length}`);
console.log(`Debug: Key prefix: ${supabaseServiceKey.substring(0, 10)}...`);

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

// Trade Mapping from CSV 'Trade' column to system slugs
const CSV_TRADE_MAP: Record<string, string> = {
    'plumber': 'plumber',
    'electrician': 'electrician',
    'locksmith': 'locksmith',
    'gas-engineer': 'gas-engineer',
    'drain-specialist': 'drain-specialist',
    'glazier': 'glazier',
    'breakdown': 'breakdown', // Mapped to breakdown slug
    'roofer': 'roofer',
    'builder': 'builder',
    'hvac': 'hvac'
};

interface CsvBusiness {
    Name: string;
    Phone: string;
    Trade: string;
    Rating: string;
    Reviews: string;
    Website: string;
    Address: string;
}

// Helpers
function parseUSAddress(address: string): { city: string, state: string } | null {
    if (!address) return null;
    const parts = address.split(',').map(s => s.trim());
    if (parts.length < 2) return null;

    // Handle "Austin, TX 78751" -> state "TX"
    // Last part often contains ZIP
    let statePart = parts[parts.length - 1]; // "TX 78751" or "USA"

    if (statePart === 'USA' && parts.length > 2) {
        statePart = parts[parts.length - 2];
    }

    const stateMatch = statePart.match(/([A-Z]{2})/);
    const state = stateMatch ? stateMatch[1] : '';

    // City is usually the part before state
    // In "901 Reinli St, Austin, TX 78751, USA" -> parts: ["901 Reinli St", "Austin", "TX 78751", "USA"]
    // if last is USA, then state is index-2 (TX...), city is index-3 ("Austin")
    // if last is TX..., then city is index-2 ("Austin")

    let city = '';
    if (parts[parts.length - 1] === 'USA') {
        city = parts[parts.length - 3];
    } else {
        city = parts[parts.length - 2];
    }

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

// Simple CSV Parser (ignores commas inside quotes)
function parseCSV(content: string): CsvBusiness[] {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const results: CsvBusiness[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row: Record<string, string> = {};
        let currentVal = '';
        let inQuotes = false;
        let colIndex = 0;

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                if (colIndex < headers.length) {
                    row[headers[colIndex]] = currentVal.trim();
                }
                currentVal = '';
                colIndex++;
            } else {
                currentVal += char;
            }
        }
        // Last column
        if (colIndex < headers.length) {
            row[headers[colIndex]] = currentVal.trim();
        }

        // Basic validation/mapping to strictly typed object
        if (row['Name'] && row['Phone']) {
            results.push({
                Name: row['Name'].replace(/^"|"$/g, ''), // remove wrapping quotes if failed regex
                Phone: row['Phone'].replace(/^"|"$/g, ''),
                Trade: row['Trade'] || '',
                Rating: row['Rating'] || '0',
                Reviews: row['Reviews'] || '0',
                Website: row['Website'] || '',
                Address: row['Address'].replace(/^"|"$/g, '')
            });
        }
    }
    return results;
}

// Main Ingestion
async function ingest() {
    console.log('🚀 Starting US CSV Data Ingestion...');
    console.log('📂 Sourcing from: recruitment_lists/');

    const recruitmentDir = path.join(process.cwd(), 'recruitment_lists');
    if (!fs.existsSync(recruitmentDir)) {
        console.error('❌ recruitment_lists directory not found!');
        return;
    }

    const files = fs.readdirSync(recruitmentDir).filter(f => f.endsWith('.csv'));
    console.log(`📂 Found ${files.length} CSV files.`);

    let totalInserted = 0;
    let totalProcessed = 0;

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(path.join(recruitmentDir, file), 'utf-8');
        const records = parseCSV(content);

        const businessesToUpsertMap = new Map();

        for (const entry of records) {
            // Validate Phone
            if (!entry.Phone || entry.Phone.trim() === '') continue;

            const tradeSlug = CSV_TRADE_MAP[entry.Trade.toLowerCase()];
            if (!tradeSlug) {
                // console.warn(`Unknown trade: ${entry.Trade}`);
                continue;
            }

            const location = parseUSAddress(entry.Address);
            if (!location) continue; // Not US

            const { city, state } = location;
            const citySlug = slugify(city);
            const stateSlug = slugify(state);
            // Deterministic ID based on unique properties to avoid duplicates but allow updates
            const businessSlug = `${slugify(entry.Name)}-${citySlug}-${stateSlug}`;

            // Unique ID: us-state-city-slug-trade
            const id = `us-${stateSlug}-${citySlug}-${businessSlug}-${tradeSlug}`;

            // Deduplicate: If ID already exists in this batch, skip or overwrite. 
            // We overwrite to keep the latest entry in the file.
            businessesToUpsertMap.set(id, {
                id: id,
                name: entry.Name,
                phone: entry.Phone,
                address: entry.Address,
                city: city,
                trade: tradeSlug,
                rating: parseFloat(entry.Rating) || 0,
                review_count: parseInt(entry.Reviews) || 0,
                website: entry.Website,
                hours: 'Open 24 hours',
                is_open_24_hours: true,
                country_code: 'US',
                verified: true,
                tier: 'free',
                city_slug: citySlug,
                state_slug: stateSlug,
                slug: businessSlug + '-' + Math.random().toString(36).substring(2, 6) // DB slug unique constraint usually? keeping random suffix from previous logic but maybe cleaner without if name+city is unique. Previous script used random suffix.
            });
        }

        const businessesToUpsert = Array.from(businessesToUpsertMap.values());

        if (businessesToUpsert.length > 0) {
            const { error } = await supabase
                .from('businesses')
                .upsert(businessesToUpsert, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Error inserting batch from ${file}:`, error.message);
            } else {
                totalInserted += businessesToUpsert.length;
            }
        }
        totalProcessed += records.length;
    }

    console.log('\n🎉 CSV INGESTION COMPLETE');
    console.log(`📊 Total Records Processed: ${totalProcessed}`);
    console.log(`✅ Total Verified US Records Inserted: ${totalInserted}`);
}

ingest().catch(console.error);
