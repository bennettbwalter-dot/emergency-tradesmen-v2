
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_CITIES = ['Lancaster', 'Durham', 'Salisbury', 'Winchester', 'Ely'];
const EXPECTED_TRADES = [
    'Plumber', 'Electrician', 'Locksmith', 'Gas Engineer',
    'Drain Specialist', 'Glazier', 'Roofer', 'Builder',
    'Breakdown Recovery', 'HVAC', 'Water Restoration'
];

async function verifyData() {
    console.log('Verifying Phase 12 Group C Data Import...\n');

    for (const city of TARGET_CITIES) {
        console.log(`Checking coverage for ${city}...`);

        // Get all businesses for this city
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('trade, name')
            .eq('city', city)
            .eq('country_code', 'UK');

        if (error) {
            console.error(`Error fetching data for ${city}:`, error.message);
            continue;
        }

        const foundTrades = new Set(businesses?.map(b => b.trade));
        const missingTrades = EXPECTED_TRADES.filter(t => !foundTrades.has(t));

        if (missingTrades.length === 0) {
            console.log(`  ✅ All 11 trades present. (Total: ${businesses?.length} listings)`);
        } else {
            console.log(`  ❌ Missing trades: ${missingTrades.join(', ')}`);
            console.log(`  Found listings: ${businesses?.map(b => b.trade).join(', ')}`);
        }
    }
}

verifyData();
