import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUKPhones() {
    console.log('🇬🇧 Checking UK Contractor Data Quality...\n');

    const { data: contractors, error } = await supabase
        .from('businesses')
        .select('id, name, phone, city, trade')
        .eq('country_code', 'GB');

    if (error) {
        console.error('❌ Error fetching UK data:', error);
        return;
    }

    const total = contractors.length;
    const withPhone = contractors.filter(c => c.phone && c.phone.trim().length > 5).length;
    const withoutPhone = total - withPhone;

    console.log(`📊 **Summary:**`);
    console.log(`   - Total UK Contractors: ${total}`);
    console.log(`   - ✅ With Valid Phone:  ${withPhone} (${((withPhone / total) * 100).toFixed(1)}%)`);
    console.log(`   - ❌ Missing Phone:     ${withoutPhone} (${((withoutPhone / total) * 100).toFixed(1)}%)`);

    if (withoutPhone > 0) {
        console.log(`\n⚠️  Found ${withoutPhone} contractors to remove.`);
        console.log('\nSample of invalid records:');
        console.log(contractors.filter(c => !c.phone || c.phone.trim().length <= 5).slice(0, 5));
    } else {
        console.log('\n✅ UK Data is clean! All contractors have phone numbers.');
    }
}

checkUKPhones();
