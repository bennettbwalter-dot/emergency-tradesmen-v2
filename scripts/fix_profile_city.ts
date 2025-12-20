import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function fixCityAndName() {
    console.log('Updating profile...');

    const { error } = await supabase
        .from('businesses')
        .update({
            name: 'My Premium Profile',
            city: 'Luton',
            selected_locations: ['Luton'],
            trade: 'electrician',
            is_premium: true,
            tier: 'paid',
            verified: true,
            priority_score: 2000
        })
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('✅ Successfully updated profile to:');
        console.log('   - Name: My Premium Profile');
        console.log('   - City: Luton');
        console.log('   - Selected Locations: [Luton]');
    }
}

fixCityAndName();
