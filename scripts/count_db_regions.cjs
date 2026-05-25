const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase configuration.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function countRegions() {
    console.log('Counting businesses in database...');
    
    // Total count
    const { count: total, error: errTotal } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
        
    // UK count
    const { count: uk, error: errUk } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .or('country_code.eq.GB,country_code.eq.UK,postcode.not.is.null');

    // US count
    const { count: us, error: errUs } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'US');

    console.log('\n=======================================');
    console.log(`⭐ Total Listings in DB:   ${total || 0}`);
    console.log(`🇬🇧 UK Listings:            ${uk || 0}`);
    console.log(`🇺🇸 US Listings:            ${us || 0}`);
    console.log('=======================================\n');
}

countRegions();
