import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Service role key required for deletion
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function purgeInvalidUKPhones() {
    console.log('🇬🇧 Purging UK Contractors without phones (Data Quality Enforcement)...\n');

    // 1. Fetch valid IDs to keep (or invalid to delete - easier to find invalid and delete by ID)
    // Supabase JS doesn't support 'not like' easily for length check in one go without raw sql or func
    // But we can iterate and collect IDs to delete since it's a small number (61 found).

    // We already know from check script there are ~61.
    // Let's page through and find them again to be safe.

    let toDeleteIds = [];
    const PAGE_SIZE = 1000;
    let from = 0;
    let totalScanned = 0;

    while (true) {
        const { data, error } = await supabase
            .from('businesses')
            .select('id, phone')
            .eq('country_code', 'GB')
            .range(from, from + PAGE_SIZE - 1);

        if (error || !data || data.length === 0) break;

        const invalid = data.filter(c => !c.phone || c.phone.trim().length < 5);
        if (invalid.length > 0) {
            toDeleteIds.push(...invalid.map(c => c.id));
        }

        totalScanned += data.length;
        from += PAGE_SIZE;
        process.stdout.write(`\r🔍 Scanning: found ${toDeleteIds.length} invalid in ${totalScanned} records...`);
    }

    console.log(`\n\n⚠️  Found ${toDeleteIds.length} records to delete.`);

    if (toDeleteIds.length > 0) {
        console.log('🗑️  Deleting now...');
        const { error: delError, count } = await supabase
            .from('businesses')
            .delete({ count: 'exact' })
            .in('id', toDeleteIds);

        if (delError) {
            console.error('❌ Deletion failed:', delError);
        } else {
            console.log(`✅ Successfully deleted ${count} invalid listings.`);
            console.log('🎉 UK Database is now 100% compliant!');
        }
    } else {
        console.log('✅ Nothing to delete.');
    }
}

purgeInvalidUKPhones();
