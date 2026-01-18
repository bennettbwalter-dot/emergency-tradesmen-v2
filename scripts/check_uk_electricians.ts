
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUkElectricians() {
    console.log("Checking for UK Electricians in DB...");

    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('trade_slug', 'electrician')
        .eq('country_code', 'GB');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${count} UK Electrician listings in the database.`);
    }

    // Also check if any exist with 'UK' country code instead of 'GB' just in case
    const { count: countUK, error: errorUK } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('trade_slug', 'electrician')
        .eq('country_code', 'UK');

    if (!errorUK && countUK > 0) {
        console.log(`Found ${countUK} listings with country_code 'UK' (should be GB).`);
    }
}

checkUkElectricians();
