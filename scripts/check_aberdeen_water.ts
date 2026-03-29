
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log("Checking for Aberdeen Water Restoration...");
    const { data, error, count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('city', 'Aberdeen')
        .eq('trade', 'water-restoration');

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${count} water-restoration businesses in Aberdeen.`);
}

run();
