
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function boostTestBusiness() {
    // Find the test business
    const { data: businesses, error: findError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('name', 'Developer Test Business')
        .limit(1);

    if (findError || !businesses || businesses.length === 0) {
        console.error('Could not find Developer Test Business');
        return;
    }

    const businessToBoost = businesses[0];
    console.log('Found business:', businessToBoost);

    // Update to premium
    const { error: updateError } = await supabase
        .from('businesses')
        .update({
            tier: 'paid',
            is_premium: true,
            priority_score: 1000 // High score to force to top
        })
        .eq('id', businessToBoost.id);

    if (updateError) {
        console.error('Error boosting business:', updateError);
    } else {
        console.log('Successfully boosted "Developer Test Business" to Premium (Top of list).');
    }
}

boostTestBusiness();
