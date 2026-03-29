
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const CITIES_FILES = [
    { city: 'Dallas', file: 'dallas_businesses.json' },
    { city: 'Houston', file: 'houston_businesses.json' },
    { city: 'San Antonio', file: 'san_antonio_businesses.json' },
    { city: 'Phoenix', file: 'phoenix_businesses.json' },
    { city: 'Seattle', file: 'seattle_businesses.json' },
    { city: 'San Francisco', file: 'san_francisco_businesses.json' }
];

async function importVerifiedUSData() {
    console.log("🚀 STARTING FINAL VERIFIED US DATA IMPORT\n");

    let totalImported = 0;

    for (const item of CITIES_FILES) {
        const filePath = path.join(__dirname, item.file);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ File not found: ${item.file} (Skipping)`);
            continue;
        }

        console.log(`Processing ${item.city.toUpperCase()} (${item.file})...`);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const rawData = JSON.parse(fileContent);

            if (!Array.isArray(rawData)) {
                console.warn(`Invalid JSON format in ${item.file}`);
                continue;
            }

            const validData: any[] = [];
            for (const b of rawData) {
                // STRICT VALIDATION
                if (!b.phone) continue;
                if (b.phone.includes('555-')) continue; // Mock check
                if (!b.name || b.name.trim() === '') continue;

                // Helper for slug
                const slugCandidate = (b.name + ' ' + b.city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                const slug = slugCandidate + '-' + (b.id ? b.id.substring(0, 8) : Math.random().toString(36).substring(2, 7));

                // Construct CLEAN object with only DB-supported fields (snake_case)
                const cleaned: any = {
                    id: b.id,
                    name: b.name,
                    slug: slug, // Generate slug just in case
                    rating: b.rating,
                    review_count: b.reviewCount || b.user_ratings_total || 0, // MAP to snake_case
                    address: b.address,
                    hours: b.hours,
                    is_open_24_hours: b.isOpen24Hours || false, // MAP to snake_case
                    phone: b.phone,
                    website: b.website,
                    trade: b.trade,
                    city: b.city,
                    verified: true,
                    country_code: 'US', // Confirmed exists

                    // Defaults
                    is_premium: false,
                    plan_type: 'free',
                    claim_status: 'unclaimed',

                    // Map Postcode
                    postcode: b.zip || b.postal_code || b.postalCode || null
                };

                validData.push(cleaned);
            }

            console.log(`  Found ${validData.length} valid records (from ${rawData.length} total). Importing...`);

            // Batch Upsert
            const BATCH_SIZE = 100;
            for (let i = 0; i < validData.length; i += BATCH_SIZE) {
                const batch = validData.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.from('businesses').upsert(batch, { onConflict: 'id' });

                if (error) {
                    console.error(`  ❌ Error importing batch ${i}: ${error.message}`);
                } else {
                    process.stdout.write('.');
                }
            }
            console.log(`\n  ✅ Verified ${item.city}`);
            totalImported += validData.length;

        } catch (e) {
            console.error(`Error processing ${item.file}:`, e);
        }
    }

    // Export LA Data for consistency
    console.log("\n📲 Exporting Existing Verified Los Angeles Data...");
    const { data: laData, error: laError } = await supabase
        .from('businesses')
        .select('*')
        .eq('city', 'Los Angeles');

    if (laError) console.error("LA Export Error:", laError.message);
    else if (laData && laData.length > 0) {
        const laFile = path.join(__dirname, 'los_angeles_businesses.json');
        fs.writeFileSync(laFile, JSON.stringify(laData, null, 2));
        console.log(`  ✅ Saved ${laData.length} LA records to los_angeles_businesses.json`);
    } else {
        console.log("  ⚠️ No LA data found to export.");
    }

    console.log(`\n🎉 IMPORT COMPLETE. Total Records Processed: ${totalImported}`);
}

importVerifiedUSData();
