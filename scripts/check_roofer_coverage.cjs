const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const citiesPath = path.join(__dirname, '../src/lib/us_cities.json');
    const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
    const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('trade', 'roofer')
        .in('country_code', ['US', 'us', 'Us', 'uS']);

    if (error) {
        console.error(error);
        return;
    }

    const covered = new Set(data.map(d => d.city.trim()));
    const missing = cities.filter(c => !covered.has(c));
    console.log('Missing cities for roofer:');
    console.log(JSON.stringify(missing, null, 2));
    console.log(`Total missing: ${missing.length}`);
    console.log(`Total covered: ${cities.length - missing.length}`);
}

check();
