const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listCoveredCities(tradeSlug) {
    const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('trade', tradeSlug)
        .in('country_code', ['US', 'us', 'Us', 'uS']);

    if (error) {
        console.error(error.message);
    } else {
        const cities = [...new Set(data.map(d => d.city))];
        console.log(JSON.stringify(cities, null, 2));
    }
}

const trade = process.argv[2] || 'roofer';
listCoveredCities(trade);
