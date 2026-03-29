
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const cities = [
    'Hereford',
    'Shrewsbury',
    'Telford',
    'Canterbury',
    'Carlisle'
];

async function verify() {
    console.log('Verifying Phase 12 Group B Cities...');

    for (const city of cities) {
        const { count, error } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('city', city)
            .eq('country', 'UK');

        if (error) {
            console.error(`Error checking ${city}:`, error);
        } else {
            console.log(`${city}: ${count} listings found`);
        }
    }
}

verify().catch(console.error);
