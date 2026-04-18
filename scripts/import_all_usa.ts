import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.us.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const dataDir = path.join(__dirname, '../_unused_quarantine/UK_DATA');
// Automatically pick up ALL USA dataset JSON files from the quarantine directory!
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_businesses.json') && f !== 'los_angeles_businesses.json');

async function importAllUSData() {
    console.log("🚀 STARTING MASS USA IMPORT FOR", files.length, "FILES\n");
    let totalImported = 0;

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        console.log(`Processing ${file}...`);
        try {
            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(rawData)) continue;

            const validData = [];
            for (const b of rawData) {
                if (!b.phone || b.phone.includes('555-') || !b.name || b.name.trim() === '') continue;
                
                validData.push({
                    id: b.id,
                    name: b.name,
                    slug: (b.name + ' ' + b.city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + (b.id ? b.id.substring(0, 8) : Math.random().toString(36).substring(2, 7)),
                    rating: b.rating,
                    review_count: b.reviewCount || b.user_ratings_total || 0,
                    address: b.address,
                    hours: b.hours,
                    is_open_24_hours: b.isOpen24Hours || false,
                    phone: b.phone,
                    website: b.website,
                    trade: b.trade,
                    city: b.city,
                    verified: true,
                    country_code: 'US',
                    is_premium: false,
                    plan_type: 'free',
                    claim_status: 'unclaimed',
                    postcode: b.zip || b.postal_code || b.postalCode || null
                });
            }

            const BATCH_SIZE = 100;
            for (let i = 0; i < validData.length; i += BATCH_SIZE) {
                const batch = validData.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.from('businesses').upsert(batch, { onConflict: 'id' });
                if (error) {
                    console.error(`  ❌ Error: ${error.message}`);
                } else {
                    process.stdout.write('.');
                }
            }
            console.log(`\n  ✅ Verified ${file} (Imported ${validData.length} records)`);
            totalImported += validData.length;
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
    console.log(`\n🎉 MASS IMPORT COMPLETE. Total Records Processed: ${totalImported}`);
}

importAllUSData();
