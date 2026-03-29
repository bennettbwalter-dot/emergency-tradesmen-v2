
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAccess() {
    try {
        const { data, error, count } = await supabase
            .from('locations')
            .select('*', { count: 'exact', head: true });

        console.log("JSON_RESULT:" + JSON.stringify({ count, error }));
    } catch (e: any) {
        console.log("JSON_RESULT:" + JSON.stringify({ error: e.message }));
    }
}

testAccess();
