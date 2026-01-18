
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

async function importBatch() {
    console.log("🚀 Importing Orlando, Jacksonville, Detroit Plumbers (Verified Real Data)\n");

    const files = ['orlando_plumbers.json', 'jacksonville_plumbers.json', 'detroit_plumbers.json'];
    let totalImported = 0;

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) continue;

        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const validData: any[] = [];

        for (const b of rawData) {
            const slugCandidate = (b.name + ' ' + b.city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const slug = slugCandidate + '-' + b.id.substring(b.id.lastIndexOf('-') + 1);

            validData.push({
                id: b.id,
                name: b.name,
                slug: slug,
                rating: b.rating,
                review_count: b.reviewCount || 0,
                address: b.address,
                hours: b.hours,
                is_open_24_hours: b.isOpen24Hours || false,
                phone: b.phone,
                trade: b.trade,
                city: b.city,
                verified: true,
                country_code: 'US',
                is_premium: false,
                plan_type: 'free',
                claim_status: 'unclaimed'
            });
        }

        console.log(`Importing ${validData.length} from ${file}...`);

        const BATCH_SIZE = 100;
        for (let i = 0; i < validData.length; i += BATCH_SIZE) {
            const batch = validData.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('businesses').upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Error importing batch ${i}: ${error.message}`);
            } else {
                process.stdout.write('.');
            }
        }
        console.log(` ✅`);
        totalImported += validData.length;
    }

    console.log(`\n🎉 Batch import complete! Total: ${totalImported}`);
}

importBatch();
