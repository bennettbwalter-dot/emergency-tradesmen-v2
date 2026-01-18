
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpData() {
    console.log("Dumping Location Data...");

    // Get 5 States
    console.log("--- STATES ---");
    const { data: states, error: sErr } = await supabase.from('locations').select('id, name, slug').eq('type', 'state').limit(5);
    if (sErr) console.error("Error:", sErr);
    else console.log(JSON.stringify(states, null, 2));

    if (states && states.length > 0) {
        const testState = states[0];
        console.log(`\n--- METROS for State: ${testState.name} (${testState.id}) ---`);
        const { data: metros, error: mErr } = await supabase.from('locations').select('id, name, slug, parent_id').eq('type', 'metro').eq('parent_id', testState.id);
        if (mErr) console.error("Error:", mErr);
        else console.log(JSON.stringify(metros, null, 2));

        if (metros && metros.length > 0) {
            const testMetro = metros[0];
            console.log(`\n--- CITIES for Metro: ${testMetro.name} (${testMetro.id}) ---`);
            const { data: cities, error: cErr } = await supabase.from('locations').select('id, name, slug, parent_id').eq('type', 'city').eq('parent_id', testMetro.id);
            if (cErr) console.error("Error:", cErr);
            else console.log(JSON.stringify(cities, null, 2));
        }
    }
}

dumpData();
