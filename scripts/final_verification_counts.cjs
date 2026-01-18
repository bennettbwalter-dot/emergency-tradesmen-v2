const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCount(country, trade) {
    let query = supabase.from('businesses').select('*', { count: 'exact', head: true });
    if (country) query = query.eq('country_code', country);
    if (trade) query = query.eq('trade', trade);

    const { count, error } = await query;
    if (error) return 0;
    return count;
}

async function finalVerification() {
    const trades = [
        'water-restoration',
        'builder',
        'breakdown-recovery',
        'breakdown',
        'roofer',
        'plumber',
        'electrician',
        'locksmith',
        'glazier',
        'drain-specialist',
        'gas-engineer',
        'hvac'
    ];

    console.log('--- FINAL VERIFIED COUNTS ---');
    for (const country of ['GB', 'US']) {
        console.log(`\n${country}:`);
        let subtotal = 0;
        for (const trade of trades) {
            const count = await getCount(country, trade);
            console.log(`- ${trade}: ${count}`);
            subtotal += count;
        }
        const total = await getCount(country);
        console.log(`Total for ${country}: ${total}`);
        console.log(`Unaccounted in this list: ${total - subtotal}`);
    }
}

finalVerification();
