import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// FORCE USE OF ANON KEY to test RLS
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPublicAccess() {
    console.log('Testing public access with Anon Key...');

    // Try to fetch ONE verified business
    const { data, error, count } = await supabase
        .from('businesses')
        .select('id, name, city', { count: 'exact', head: false })
        .eq('verified', true)
        .limit(5);

    if (error) {
        console.error('❌ Public access FAILED:', error.message);
        if (error.code === '42501') {
            console.error('   Reason: RLS Policy Violation (Permission denied)');
        }
        return;
    }

    console.log(`✅ Public access successful! Found ${count} verified businesses accessible publicly.`);
    console.log('Sample data:', data);
}

checkPublicAccess();
