
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function findCustomProfiles() {
    console.log('Searching for custom profiles...');

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .neq('name', 'Developer Test Business')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching businesses:', error);
        return;
    }

    console.log(`Found ${data?.length || 0} custom businesses.`);

    if (data) {
        data.forEach((b: any) => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${b.id}`);
            console.log(`Name: "${b.name}"`);
            console.log(`Trade: ${b.trade}`);
            console.log(`City: ${b.city}`);
            console.log(`Verified: ${b.verified}`);
            console.log(`Owner ID: ${b.owner_user_id}`);
        });
    }
}

findCustomProfiles();
