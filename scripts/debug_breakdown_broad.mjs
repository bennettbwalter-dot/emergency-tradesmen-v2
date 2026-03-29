
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
    console.log("Broad search for Breakdown/Recovery in London...");

    // 1. Check all trades in London
    const { data: tradesInLondon } = await supabase
        .from('businesses')
        .select('trade')
        .eq('city', 'London');

    const uniqueTrades = [...new Set(tradesInLondon?.map(b => b.trade))];
    console.log("Trades found in London:", uniqueTrades);

    // 2. Search for 'recovery' or 'breakdown' in trade or name
    const { data: searchResults, count } = await supabase
        .from('businesses')
        .select('name, trade, city, verified')
        .or('trade.ilike.%breakdown%,name.ilike.%recovery%,trade.ilike.%recovery%')
        .limit(50);

    console.log(`Found ${searchResults?.length} matches for 'breakdown' or 'recovery' globally.`);

    if (searchResults) {
        searchResults.slice(0, 10).forEach(b => {
            console.log(`- ${b.name} | Trade: ${b.trade} | City: ${b.city} | Verified: ${b.verified}`);
        });
    }

    // 3. Specifically look for London again with partial match
    const { count: londonRecoveryCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', 'London')
        .ilike('name', '%Breakdown%');

    console.log(`London listings with 'Breakdown' in name: ${londonRecoveryCount}`);

    // 4. Specifically look for London again with partial match in trade
    const { count: londonRecoveryTradeCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', 'London')
        .ilike('trade', '%breakdown%');

    console.log(`London listings with 'breakdown' in trade: ${londonRecoveryTradeCount}`);
}

debug();
