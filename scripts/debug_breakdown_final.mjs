
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

async function debug() {
    console.log("Searching for ANY 'london' matching listings...");

    // Case-insensitive search for city 'london'
    const { data: allLondon, count } = await supabase
        .from('businesses')
        .select('name, trade, city, verified')
        .ilike('city', 'london');

    console.log(`Found ${allLondon?.length} total listings for city matching 'london' (case-insensitive).`);

    const uniqueTrades = [...new Set(allLondon?.map(b => b.trade))];
    console.log("Trades found in 'london':", uniqueTrades);

    const breakdownUnderLondon = allLondon?.filter(b => b.trade === 'breakdown');
    console.log(`Breakdown listings under 'london' search: ${breakdownUnderLondon?.length}`);

    // If still 0, search for ANY breakdown listings and check their city
    const { data: allBreakdown } = await supabase
        .from('businesses')
        .select('name, trade, city, verified')
        .eq('trade', 'breakdown');

    console.log(`Found ${allBreakdown?.length} total 'breakdown' listings globally.`);
    const breakdownCities = [...new Set(allBreakdown?.map(b => b.city))];
    console.log("Cities with breakdown listings:", breakdownCities);
}

debug();
