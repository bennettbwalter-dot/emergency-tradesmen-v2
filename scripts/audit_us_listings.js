import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkUS() {
    console.log('Fetching USA businesses from Supabase...');
    
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'US');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`\nTotal USA listings: ${count}`);
    
    const trades = [
        'plumber', 'electrician', 'locksmith', 'hvac', 'roofer', 
        'glazier', 'breakdown', 'water-restoration', 'builder', 
        'drain-specialist', 'gas-engineer'
    ];

    console.log('\nTrade Distribution (USA):');
    for (const trade of trades) {
        const { count: tradeCount } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('country_code', 'US')
            .eq('trade', trade);
        console.log(`- ${trade}: ${tradeCount || 0}`);
    }
}

checkUS().catch(console.error);
