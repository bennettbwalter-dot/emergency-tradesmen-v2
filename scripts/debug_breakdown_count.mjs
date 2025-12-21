
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBreakdown() {
    console.log("Checking breakdown listings in London...");

    // Check for breakdown recovery in London
    const { data, error, count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('city', 'London')
        .eq('trade', 'breakdown');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${count} total breakdown listings in London.`);

    const verifiedCount = data.filter(b => b.verified === true).length;
    const unverifiedCount = data.filter(b => b.verified !== true).length;

    console.log(`Verified: ${verifiedCount}`);
    console.log(`Unverified: ${unverifiedCount}`);

    if (data.length > 0) {
        console.log("Sample listing trade/city:", data[0].trade, "/", data[0].city);
    }
}

checkBreakdown();
