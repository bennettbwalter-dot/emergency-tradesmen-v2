
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function listOwnerBusinesses() {
    console.log(`Fetching all businesses for owner: ${OWNER_ID}...`);

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching businesses:', error);
        return;
    }

    console.log(`Found ${data?.length || 0} businesses for this owner.`);

    if (data) {
        data.forEach((b: any) => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${b.id}`);
            console.log(`Name: "${b.name}"`);
            console.log(`Trade: ${b.trade}`);
            console.log(`City: ${b.city}`);
            console.log(`Created At: ${b.created_at}`);
            console.log(`Updated At: ${b.updated_at}`); // Check if any have been updated
        });
    }
}

listOwnerBusinesses();
