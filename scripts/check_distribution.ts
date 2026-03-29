import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkDistribution() {
    console.log('📊 Current US Business Distribution:');

    const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('country_code', 'US');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const counts: Record<string, number> = {};
    data.forEach(b => {
        counts[b.city] = (counts[b.city] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    console.log('City | Count');
    console.log('-----|------');
    sorted.slice(0, 15).forEach(([city, count]) => {
        console.log(`${city.padEnd(12)} | ${count}`);
    });

    if (sorted.length > 15) {
        console.log(`... and ${sorted.length - 15} more suburbs.`);
    }
}

checkDistribution();
