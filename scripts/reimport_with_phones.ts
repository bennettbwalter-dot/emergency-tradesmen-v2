import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Use SERVICE ROLE key to bypass RLS for deletion/insertion
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function reimportWithPhones() {
    console.log('🚀 Starting Data Cleanup & Re-Import');
    console.log(`🔗 Target: ${supabaseUrl}`);

    // 1. DELETE EXISTING US CONTRACTORS
    console.log('\n🗑️  Step 1: Deleting existing US contractors...');
    // We can identify them by ID prefix 'us-dal-' or country_code 'US'
    const { error: deleteError, count: deletedCount } = await supabase
        .from('businesses')
        .delete({ count: 'exact' })
        .eq('country_code', 'US');

    if (deleteError) {
        console.error('❌ Error deleting data:', deleteError);
        return;
    }
    console.log(`✅ Deleted ${deletedCount || 'all'} existing US records.`);


    // 2. LOAD & FILTER JSON DATA
    console.log('\n📂 Step 2: Loading source data...');
    const dataPath = path.join(__dirname, 'dallas_businesses.json');
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data file not found: ${dataPath}`);
        return;
    }

    const rawBusinesses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📦 Loaded ${rawBusinesses.length} total records`);

    // STRICT FILTER: Must have phone number
    const validBusinesses = rawBusinesses.filter(b => {
        return b.phone && b.phone.trim().length > 5; // Basic validation
    });

    console.log(`🔍 Filtered down to ${validBusinesses.length} records with valid phone numbers`);
    console.log(`⚠️  Dropped ${rawBusinesses.length - validBusinesses.length} records (missing phone)`);


    // 3. RE-IMPORT
    console.log('\n📥 Step 3: Importing valid records...');
    const BATCH_SIZE = 50;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validBusinesses.length; i += BATCH_SIZE) {
        const batch = validBusinesses.slice(i, i + BATCH_SIZE);

        const insertData = batch.map(b => {
            const randomSuffix = Math.random().toString(36).slice(2, 7);
            // Create a cleaner slug
            const safeName = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const slug = `${safeName}-${randomSuffix}`;

            // Format phone: Google usually gives formatted '020 1234 5678' or '(214) ...'
            // We'll store it as is, verification happens at display level or strict formatting here if needed.
            // For now, raw is fine as long as it exists.

            return {
                id: `us-dal-${b.trade.slice(0, 3)}-${randomSuffix}`,
                name: b.name,
                slug: slug,
                trade: b.trade,
                rating: b.rating,
                review_count: b.user_ratings_total || b.review_count || 0,
                address: b.address,
                city: b.city || 'Dallas',
                phone: b.phone, // KEY FIELD
                website: b.website,
                latitude: b.latitude,
                longitude: b.longitude,
                country_code: 'US', // Explicitly set US
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
        } else {
            successCount += batch.length;
            process.stdout.write(`\r✅ Progress: ${successCount}/${validBusinesses.length} imported...`);
        }
    }

    console.log('\n\n🏁 Import Summary:');
    console.log(`- Success: ${successCount}`);
    console.log(`- Failed: ${failCount}`);
    console.log(`- Total Live Listing: ${successCount} (All with phones)`);
}

reimportWithPhones().catch(console.error);
