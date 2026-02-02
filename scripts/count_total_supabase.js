import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function countAll() {
    console.log("Supabase URL:", supabaseUrl);

    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error counting businesses:", error);
        return;
    }

    console.log("Total Businesses in Supabase:", count);

    const { data: countryCounts, error: countryError } = await supabase
        .rpc('get_counts_by_country'); // If this function exists, or use a manual query

    if (countryError) {
        // Manual query if RPC fails
        console.log("RPC get_counts_by_country failed, querying manually...");
        const { data: gbData } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('country_code', 'GB');
        const { data: usData } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('country_code', 'US');
        const { data: verifiedData } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('verified', true);

        console.log("GB Count:", gbData?.length || 0);
        console.log("US Count:", usData?.length || 0);
        console.log("Verified Count:", verifiedData?.length || 0);
    }
}

countAll();
