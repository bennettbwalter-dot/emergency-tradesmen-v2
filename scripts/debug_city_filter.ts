import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

const OWNER_ID = '8f23ee60-3d67-4389-a1c6-49c765e2f425';

async function checkProfileCity() {
    // Check user's profile
    const { data: userProfile } = await supabase
        .from('businesses')
        .select('id, name, city, trade, selected_locations')
        .or(`owner_id.eq.${OWNER_ID},owner_user_id.eq.${OWNER_ID}`)
        .limit(1);

    if (userProfile && userProfile.length > 0) {
        console.log('=== USER PROFILE ===');
        console.log('Name:', userProfile[0].name);
        console.log('City (lowercase):', userProfile[0].city);
        console.log('Selected Locations:', userProfile[0].selected_locations);
        console.log('');
    }

    // Test London query (like the app does)
    console.log('=== TESTING LONDON QUERY ===');
    const { data: londonResults } = await supabase
        .from('businesses')
        .select('id, name, city, selected_locations')
        .ilike('trade', 'electrician')
        .or(`city.ilike.london,selected_locations.cs.{London}`)
        .eq('verified', true)
        .limit(5);

    console.log(`Found ${londonResults?.length || 0} results for London`);
    londonResults?.forEach(b => {
        console.log(`- ${b.name} | city: "${b.city}" | locations: ${JSON.stringify(b.selected_locations)}`);
    });
    console.log('');

    // Test Luton query
    console.log('=== TESTING LUTON QUERY ===');
    const { data: lutonResults } = await supabase
        .from('businesses')
        .select('id, name, city, selected_locations')
        .ilike('trade', 'electrician')
        .or(`city.ilike.luton,selected_locations.cs.{Luton}`)
        .eq('verified', true)
        .limit(5);

    console.log(`Found ${lutonResults?.length || 0} results for Luton`);
    lutonResults?.forEach(b => {
        console.log(`- ${b.name} | city: "${b.city}" | locations: ${JSON.stringify(b.selected_locations)}`);
    });
}

checkProfileCity();
