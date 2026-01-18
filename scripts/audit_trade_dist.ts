import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const cities = ['Seattle', 'Portland', 'Detroit', 'Houston', 'Phoenix'];

    for (const city of cities) {
        console.log(`\n--- ${city} Trade Distribution ---`);
        const { data, error } = await supabase
            .from('businesses')
            .select('trade')
            .eq('city', city)
            .eq('country_code', 'US');

        if (error) {
            console.error('Error:', error.message);
            continue;
        }

        const tradeCounts: Record<string, number> = {};
        data.forEach((b: any) => {
            tradeCounts[b.trade] = (tradeCounts[b.trade] || 0) + 1;
        });

        Object.entries(tradeCounts).forEach(([trade, count]) => {
            console.log(`${trade}: ${count}`);
        });
    }
}

main();
