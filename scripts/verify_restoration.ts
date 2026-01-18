
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkRestoration() {
    console.log("Checking restoration status...");

    const { data: london, error: lErr } = await supabase
        .from('businesses')
        .select('trade')
        .eq('city', 'London')
        .eq('country_code', 'GB');

    const { data: birmingham, error: bErr } = await supabase
        .from('businesses')
        .select('trade')
        .eq('city', 'Birmingham')
        .eq('country_code', 'GB');

    const count = (data: any[]) => {
        const counts: Record<string, number> = {};
        data.forEach(r => counts[r.trade] = (counts[r.trade] || 0) + 1);
        return counts;
    };

    console.log("\n--- LONDON TRADES ---");
    console.table(count(london || []));

    console.log("\n--- BIRMINGHAM TRADES ---");
    console.table(count(birmingham || []));
}

checkRestoration();
