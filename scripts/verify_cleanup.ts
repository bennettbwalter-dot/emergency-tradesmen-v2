import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function verifyClean() {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, city')
        .ilike('name', '%Developer Test Business%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`❌ STILL FOUND ${data.length} test businesses!`);
        data.forEach(b => console.log(`  - ${b.name} in ${b.city}`));
    } else {
        console.log('✅ Database is clean - no test businesses found');
    }

    // Also check London listings
    const { data: londonData } = await supabase
        .from('businesses')
        .select('id, name')
        .ilike('city', 'London')
        .ilike('trade', 'electrician')
        .limit(5);

    console.log(`\nLondon electricians (first 5):`);
    londonData?.forEach(b => console.log(`  - ${b.name}`));
}

verifyClean();
