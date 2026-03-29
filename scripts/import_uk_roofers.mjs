import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importData() {
    const dataPath = path.join(__dirname, 'uk_roofers_complete.json');

    if (!fs.existsSync(dataPath)) {
        console.error("❌ uk_roofers_complete.json not found!");
        console.error("   Run: node scripts/fetch_uk_roofers.mjs first");
        process.exit(1);
    }

    const businesses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log(`📦 Importing ${businesses.length} UK roofer/builder businesses...`);
    console.log(`   Target database: ${SUPABASE_URL}\n`);

    // Import in batches of 100
    const BATCH_SIZE = 100;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
        const batch = businesses.slice(i, i + BATCH_SIZE);

        const { data, error } = await supabase
            .from('businesses')
            .insert(batch);

        if (error) {
            console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
            errors += batch.length;
        } else {
            imported += batch.length;
            process.stdout.write(`✓ Imported ${imported}/${businesses.length} businesses\r`);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n\n✅ Import complete!`);
    console.log(`   Successfully imported: ${imported}`);
    console.log(`   Errors: ${errors}`);

    // Verify import
    const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('trade', 'roofer')
        .eq('country_code', 'GB');

    console.log(`\n📊 Verification:`);
    console.log(`   Total UK roofers in database: ${count}`);
}

importData().catch(console.error);
