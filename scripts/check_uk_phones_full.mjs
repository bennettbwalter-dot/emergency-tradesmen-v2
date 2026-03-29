import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAllUKPhones() {
    console.log('🇬🇧 Checking Full UK Body of Contractors (13k+ Expected)...\n');

    // 1. Get True Total Count
    const { count, error: countError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'GB');

    if (countError) {
        console.error('❌ Error getting count:', countError);
        return;
    }

    console.log(`📦 True Total UK Contractors in DB: ${count}`);

    // 2. Scan for missing phones (using pagination)
    let processed = 0;
    let missingPhones = 0;
    let PAGE_SIZE = 1000;
    let from = 0;

    // We'll query until we've seen them all
    while (processed < count) {
        const { data, error } = await supabase
            .from('businesses')
            .select('id, phone')
            .eq('country_code', 'GB')
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error('❌ Error fetching page:', error);
            break;
        }

        if (!data || data.length === 0) break;

        const chunkMissing = data.filter(c => !c.phone || c.phone.trim().length < 5).length;
        missingPhones += chunkMissing;
        processed += data.length;
        from += PAGE_SIZE;

        process.stdout.write(`\r🔍 Scanned ${processed}/${count} records... (Found ${missingPhones} missing so far)`);
    }

    console.log('\n\n📊 **Final Report:**');
    console.log(`   - Total Scanned: ${processed}`);
    console.log(`   - ✅ Valid Phones: ${processed - missingPhones}`);
    console.log(`   - ❌ Missing Phones: ${missingPhones}`);

    if (missingPhones > 0) {
        console.log(`\n⚠️  ACTION REQUIRED: ${missingPhones} listings need to be removed.`);

        // Option to delete? 
        // For now just reporting.
    } else {
        console.log('\n✅ 100% Data Integrity Verified.');
    }
}

checkAllUKPhones();
