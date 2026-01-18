
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.log("Checking for Lancaster businesses...");
    const { data, error, count } = await supabase
        .from('businesses') // using 'businesses' table
        .select('*', { count: 'exact' })
        .eq('city', 'Lancaster');

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${count} businesses in Lancaster.`);
    if (data.length > 0) {
        console.log("Sample:", data[0].name, data[0].slug);
    }
}

run();
