
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listTables() {
    console.log("Listing public tables...");
    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    // information_schema access might be restricted. If so, we can try a different approach or just infer from context.
    // Actually, standard PostgREST doesn't expose information_schema by default.
    // Let's try to query 'us_cities' or 'cities' directly if the above fails or returns nothing useful?
    // Or better, let's just try to list a few potential table names.

    if (error) {
        console.error("Error listing tables (likely restricted):", error.message);
        // Fallback: try to select from likely tables
        const tables = ['us_cities', 'cities', 'usa_cities', 'locations_old', 'marketing_locations'];
        for (const t of tables) {
            const { count, error: countErr } = await supabase.from(t).select('*', { count: 'exact', head: true });
            if (!countErr) {
                console.log(`Found table: ${t} (Rows: ${count})`);
            } else {
                // console.log(`Table not accessible: ${t} (${countErr.message})`);
            }
        }
    } else {
        console.log("Tables found:", data);
    }
}

listTables();
