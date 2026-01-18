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

async function getAllTrades() {
    console.log('Fetching all unique trade names...');

    const { data, error } = await supabase
        .from('businesses')
        .select('trade, country_code');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const tradeStats = {};
    data.forEach(row => {
        const key = `${row.country_code || 'MISSING'}:${row.trade || 'MISSING'}`;
        tradeStats[key] = (tradeStats[key] || 0) + 1;
    });

    console.log('--- Trade/Country Breakdown (Full DB) ---');
    const sorted = Object.entries(tradeStats).sort((a, b) => b[1] - a[1]);
    for (const [key, count] of sorted) {
        console.log(`${key}: ${count}`);
    }
}

getAllTrades();
