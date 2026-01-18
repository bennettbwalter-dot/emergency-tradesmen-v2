const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCount(country, trade) {
    let query = supabase.from('businesses').select('*', { count: 'exact', head: true });
    if (country) query = query.eq('country_code', country);
    if (trade) query = query.eq('trade', trade);

    const { count, error } = await query;
    if (error) {
        console.error(`Error fetching count for ${country || 'Total'} / ${trade || 'Total'}:`, error.message);
        return 0;
    }
    return count;
}

async function runReport() {
    console.log('Generating Accurate Listing Report...');

    const total = await getCount();
    const gbTotal = await getCount('GB');
    const usTotal = await getCount('US');
    const otherTotal = total - gbTotal - usTotal;

    const trades = [
        'water-restoration',
        'builder',
        'breakdown-recovery',
        'roofer',
        'plumber',
        'electrician',
        'locksmith',
        'glazier',
        'drain-specialist',
        'gas-engineer',
        'hvac'
    ];

    console.log('\n--- OVERALL SUMMARY ---');
    console.log(`Total Listings: ${total}`);
    console.log(`UK (GB) Listings: ${gbTotal}`);
    console.log(`US Listings: ${usTotal}`);
    console.log(`Other/Uncoded: ${otherTotal}`);

    console.log('\n--- UK BREAKDOWN BY TRADE ---');
    for (const trade of trades) {
        const count = await getCount('GB', trade);
        console.log(`- ${trade}: ${count}`);
    }

    console.log('\n--- US BREAKDOWN BY TRADE ---');
    for (const trade of trades) {
        const count = await getCount('US', trade);
        console.log(`- ${trade}: ${count}`);
    }

    console.log('\nReport Complete.');
}

runReport();
