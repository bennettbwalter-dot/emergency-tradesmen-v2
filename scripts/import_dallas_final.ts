import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load both .env and .env.production to ensure we get the service role key
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('URL:', !!supabaseUrl);
    console.log('Key:', !!serviceRoleKey);
    process.exit(1);
}

// Using a slightly different initialization to see if it helps with cache
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function importData() {
    console.log('🚀 Starting Final Dallas Data Import');
    console.log(`🔗 Target: ${supabaseUrl}`);

    const dataPath = path.join(__dirname, 'dallas_businesses.json');
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data file not found: ${dataPath}`);
        return;
    }

    const businesses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📦 Loaded ${businesses.length} businesses for import`);

    const BATCH_SIZE = 50; // Smaller batches for better error tracking
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
        const batch = businesses.slice(i, i + BATCH_SIZE);

        const insertData = batch.map(b => {
            const randomSuffix = Math.random().toString(36).slice(2, 7);
            const slug = `${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomSuffix}`;

            return {
                id: `us-dal-${b.trade.slice(0, 3)}-${randomSuffix}`,
                name: b.name,
                slug: slug,
                trade: b.trade,
                rating: b.rating,
                review_count: b.user_ratings_total || 0,
                address: b.address,
                city: b.city,
                verified: false,
                created_at: new Date().toISOString()
            };
        });

        const { error } = await supabase
            .from('businesses')
            .insert(insertData);

        if (error) {
            console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
            failCount += batch.length;

            if (error.message.includes('country_code')) {
                console.error('CRITICAL: Column "country_code" still not recognized by PostgREST.');
                console.error('Trying recovery: omitting country_code for this batch...');

                // Fallback: Try inserting without country_code (will use default or null)
                const fallbackData = insertData.map(({ country_code, ...rest }) => rest);
                const { error: fallbackError } = await supabase.from('businesses').insert(fallbackData);
                if (fallbackError) {
                    console.error('❌ Fallback failed too:', fallbackError.message);
                } else {
                    console.log('⚠️ Recovered batch by omitting country_code (will need manual fixup later)');
                    successCount += batch.length;
                }
            }
        } else {
            successCount += batch.length;
            process.stdout.write(`\r✅ Progress: ${successCount}/${businesses.length} imported...`);
        }
    }

    console.log('\n\n🏁 Import Summary:');
    console.log(`- Success: ${successCount}`);
    console.log(`- Failed: ${failCount}`);

    // Verify final count for Dallas
    const { count, error: countError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', 'Dallas');

    if (!countError) {
        console.log(`📊 Total Dallas businesses in DB: ${count}`);
    }
}

importData().catch(console.error);
