
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function findLutonProfile() {
    console.log('Searching for electrician in Luton...');

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('city', 'Luton')
        .ilike('trade', 'electrician');

    if (error) {
        console.error('Error fetching businesses:', error);
        return;
    }

    console.log(`Found ${data?.length || 0} businesses in Luton.`);

    if (data) {
        data.forEach((b: any) => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${b.id}`);
            console.log(`Name: "${b.name}"`);
            console.log(`Trade: ${b.trade}`);
            console.log(`City: ${b.city}`);
            console.log(`Verified: ${b.verified}`);
            console.log(`Premium: ${b.is_premium}`);
            console.log(`Owner ID: ${b.owner_user_id || b.owner_id}`);
        });
    }
}

findLutonProfile();
