
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

async function checkCounts() {
    console.log("Checking Location Counts...");

    // Check States
    const { count: stateCount, error: sErr } = await supabase.from('locations').select('*', { count: 'exact', head: true }).eq('type', 'state');
    if (sErr) console.error("Error fetching states:", sErr.message);
    else console.log(`States: ${stateCount}`);

    // Check Metros
    const { count: metroCount, error: mErr } = await supabase.from('locations').select('*', { count: 'exact', head: true }).eq('type', 'metro');
    if (mErr) console.error("Error fetching metros:", mErr.message);
    else console.log(`Metros: ${metroCount}`);

    // Check Cities
    const { count: cityCount, error: cErr } = await supabase.from('locations').select('*', { count: 'exact', head: true }).eq('type', 'city');
    if (cErr) console.error("Error fetching cities:", cErr.message);
    else console.log(`Cities: ${cityCount}`);

    // Check Suburbs
    const { count: subCount, error: subErr } = await supabase.from('locations').select('*', { count: 'exact', head: true }).eq('type', 'suburb');
    if (subErr) console.error("Error fetching suburbs:", subErr.message);
    else console.log(`Suburbs: ${subCount}`);

    // Sample check: Dallas Metro
    const { data: dallasMetro } = await supabase.from('locations').select('*').eq('slug', 'dallas').eq('type', 'metro').single();
    if (dallasMetro) {
        console.log("Found Dallas Metro:", dallasMetro.name);
        // Check cities under Dallas Metro
        const { count: dallasCities } = await supabase.from('locations').select('*', { count: 'exact', head: true }).eq('parent_id', dallasMetro.id);
        console.log(`Cities under Dallas Metro: ${dallasCities}`);
    } else {
        console.log("Dallas Metro NOT found.");
    }
}

checkCounts();
