
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function normalizeLondon() {
    console.log("Normalizing city names to 'London' (Capital L)...");

    const { data, error } = await supabase
        .from('businesses')
        .update({ city: 'London' })
        .eq('city', 'london');

    if (error) {
        console.error(error);
    } else {
        console.log("Normalization complete.");
    }

    // Check final counts
    const { data: counts, error: countErr } = await supabase
        .from('businesses')
        .select('city, count()')
        .ilike('city', 'london')
        .group('city');

    console.log("Counts for London variants:", counts);
}

normalizeLondon();
