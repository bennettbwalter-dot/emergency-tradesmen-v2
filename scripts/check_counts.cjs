const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
    const trades = [
        "plumber",
        "electrician",
        "locksmith",
        "hvac",
        "gas-engineer",
        "drain-specialist",
        "glazier",
        "roofer",
        "builder",
        "water-restoration",
        "breakdown"
    ];

    console.log('--- US Business Counts by Trade ---');
    for (const trade of trades) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('trade', trade)
            .eq('country_code', 'US');

        if (error) {
            console.error(`Error fetching ${trade}:`, error.message);
        } else {
            console.log(`${trade}: ${count}`);
        }
    }
}

checkCounts();
