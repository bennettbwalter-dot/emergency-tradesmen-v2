
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkBusinesses() {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error:', JSON.stringify(error, null, 2));
        return;
    }

    console.log('--- LATEST BUSINESSES ---');
    if (data && data.length > 0) {
        data.forEach((b: any) => {
            console.log(`Name: ${b.name}`);
            console.log(`Trade: ${b.trade}`);
            console.log(`City: ${b.city}`);
            console.log(`Verified: ${b.verified}`);
            console.log('-------------------------');
        });
    } else {
        console.log('No businesses found.');
    }
}

checkBusinesses();
