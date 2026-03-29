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

async function analyzeGaps() {
    console.log('Analyzing US Gaps...');
    
    // Check for cities with 0 listings for certain trades
    const trades = ['breakdown', 'water-restoration', 'locksmith', 'glazier'];
    
    const { data: cities, error } = await supabase
        .from('businesses')
        .select('city, state')
        .eq('country_code', 'US')
        .limit(1000); // Sample

    if (error) {
        console.error(error);
        return;
    }

    const uniqueCities = [...new Set(cities.map(c => `${c.city}, ${c.state}`))];
    console.log(`Analyzing ${uniqueCities.length} unique US cities...`);

    for (const cityState of uniqueCities.slice(0, 10)) {
        const [city, state] = cityState.split(', ');
        for (const trade of trades) {
            const { count } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true })
                .eq('country_code', 'US')
                .eq('city', city)
                .eq('state', state)
                .eq('trade', trade);
            
            if (count === 0) {
                console.log(`Gap Found: ${city}, ${state} [${trade}] has 0 listings`);
            }
        }
    }
}

analyzeGaps().catch(console.error);
