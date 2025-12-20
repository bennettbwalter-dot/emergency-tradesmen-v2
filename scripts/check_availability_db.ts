import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function checkAvailability() {
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, is_available_now, last_available_ping')
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`)
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        const business = data[0];
        console.log('Business:', business.name);
        console.log('is_available_now:', business.is_available_now);
        console.log('last_available_ping:', business.last_available_ping);
    } else {
        console.log('No business found for this owner');
    }
}

checkAvailability();
