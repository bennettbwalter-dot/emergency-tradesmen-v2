import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    // 1. Total Count
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting:', error);
        return;
    }

    console.log(`Total Businesses in DB: ${count}`);

    // 2. Verified Count
    const { count: verifiedCount, error: verifiedError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

    if (verifiedError) console.error('Error counting verified:', verifiedError);
    console.log(`Verified Businesses: ${verifiedCount}`);

    // 3. Sample Data (Check City format)
    const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name, city, trade, verified')
        .limit(5);

    if (fetchError) {
        console.error('Error fetching sample:', fetchError);
    } else {
        console.log('Sample data:', JSON.stringify(data, null, 2));
    }
}

checkData();
