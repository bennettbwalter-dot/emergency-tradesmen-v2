const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const knownTrades = [
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

async function findUnknownTrades() {
    console.log('Finding trade names not in the main list...');

    const { data, error } = await supabase
        .from('businesses')
        .select('trade, country_code')
        .not('trade', 'in', `(${knownTrades.join(',')})`)
        .limit(2000); // 2000 is enough to see the missing ones

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const unknownStats = {};
    data.forEach(row => {
        const key = `${row.country_code || 'MISSING'}:${row.trade || 'MISSING'}`;
        unknownStats[key] = (unknownStats[key] || 0) + 1;
    });

    console.log('--- Unknown Trade Breakdown ---');
    for (const [key, count] of Object.entries(unknownStats)) {
        console.log(`${key}: ${count} (in this sample)`);
    }
}

findUnknownTrades();
