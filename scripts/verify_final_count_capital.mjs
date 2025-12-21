
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFinalCount() {
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', 'London')
        .eq('trade', 'breakdown');

    if (error) {
        console.error(error);
    } else {
        console.log(`Final count for 'London' (Capital L) breakdown: ${count}`);
    }
}

checkFinalCount();
