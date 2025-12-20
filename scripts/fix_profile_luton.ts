
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function updateProfileToLuton() {
    console.log(`Updating profile for owner: ${OWNER_ID} to Luton...`);

    const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`)
        .limit(1);

    if (!businesses || businesses.length === 0) {
        console.error('No business found for owner.');
        return;
    }

    const businessId = businesses[0].id;

    const { error } = await supabase
        .from('businesses')
        .update({
            city: 'Luton',
            trade: 'electrician',
            is_premium: true,
            tier: 'paid',
            priority_score: 2000
        })
        .eq('id', businessId);

    if (error) {
        console.error('Error updating profile:', error);
    } else {
        console.log('Successfully updated profile to Luton.');
    }
}

updateProfileToLuton();
