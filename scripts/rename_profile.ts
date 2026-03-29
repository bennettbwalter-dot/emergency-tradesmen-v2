
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function renameProfile() {
    console.log(`Renaming specific business for owner: ${OWNER_ID}...`);

    // Get the single remaining business
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id')
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`)
        .limit(1);

    if (error || !businesses || businesses.length === 0) {
        console.error('Error finding business:', error);
        return;
    }

    const businessId = businesses[0].id;
    console.log(`Found business ID: ${businessId}`);

    const { error: updateError } = await supabase
        .from('businesses')
        .update({
            name: 'My Premium Profile',
            trade: 'electrician',
            city: 'London',
            verified: true,
            priority_score: 2000 // Ensure it's top
        })
        .eq('id', businessId);

    if (updateError) {
        console.error('Error updating business:', updateError);
    } else {
        console.log('Successfully renamed business to "My Premium Profile" and boosted priority.');
    }
}

renameProfile();
