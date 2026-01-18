const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCities() {
    console.log('Fetching unique cities for US...');
    const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('country_code', 'US');

    if (error) {
        console.error(error.message);
        return;
    }

    const counts = {};
    data.forEach(r => {
        const city = (r.city || '').trim();
        counts[city] = (counts[city] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    console.log('Top 50 City Names in DB (US):');
    sorted.slice(0, 50).forEach(([city, count]) => {
        console.log(`- "${city}": ${count}`);
    });

    console.log('\nTotal Unique Cities in DB (US):', sorted.length);
}

debugCities();
