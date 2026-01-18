const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('trade', 'roofer')
        .eq('country_code', 'US')
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} US roofer listings.`);
    if (data.length > 0) {
        console.log('Sample city:', data[0].city);
    }
}

debug();
