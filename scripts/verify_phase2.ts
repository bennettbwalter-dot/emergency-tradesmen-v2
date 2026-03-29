
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCity(city: string) {
    const { data, error } = await supabase
        .from('businesses')
        .select('trade')
        .eq('city', city)
        .eq('country_code', 'GB');

    if (error) {
        console.error(`Error checking ${city}:`, error.message);
        return;
    }

    const counts: Record<string, number> = {};
    data.forEach(row => {
        counts[row.trade] = (counts[row.trade] || 0) + 1;
    });

    console.log(`\n--- ${city.toUpperCase()} TRADES ---`);
    console.table(counts);
}

async function verify() {
    console.log('Verifying Phase 2 coverage...');
    await checkCity('Glasgow');
    await checkCity('Edinburgh');
    await checkCity('Cardiff');
    await checkCity('Newcastle upon Tyne');
}

verify();
