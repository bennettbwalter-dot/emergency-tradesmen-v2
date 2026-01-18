
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("--- DEBUGGING SUPABASE ---");

    // 1. Check Connection
    const { data: health, error: healthErr } = await supabase.from('locations').select('count', { count: 'exact', head: true });
    if (healthErr) {
        console.error("Health Check / Locations Access Fail:", healthErr);
    } else {
        console.log("Locations Table Count:", health);
        // Note: count is on the object returned, or distinct? 
        // .select('*', { count: 'exact', head: true }) returns { count: N, data: [] }
    }

    // 2. Try to List Tables (guessing names)
    const tables = ['locations', 'cities', 'us_cities', 'usa_cities', 'districts', 'suburbs', 'marketing_locations'];

    for (const t of tables) {
        try {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`[${t}] ERROR: ${error.message} (${error.code})`);
            } else if (count === null) {
                console.log(`[${t}] SUCCESS: Matches permission, but count is NULL (RLS restriction?)`);
            } else {
                console.log(`[${t}] FOUND: ${count} rows`);
            }
        } catch (e) {
            console.log(`[${t}] EXCEPTION: ${e.message}`);
        }
    }
}

debug();
