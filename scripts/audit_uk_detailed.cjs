const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
    const standardTrades = [
        "plumber", "electrician", "locksmith", "hvac", "gas-engineer",
        "drain-specialist", "glazier", "roofer", "builder",
        "water-restoration", "breakdown"
    ];

    console.log('--- Detailed UK Listing Audit ---');

    // 1. Total GB count
    const { count: totalGB, error: err1 } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'GB');

    if (err1) console.error('Error fetching total GB:', err1.message);
    else console.log('Total GB Listings:', totalGB);

    // 2. Count by Trade
    for (const trade of standardTrades) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('trade', trade)
            .eq('country_code', 'GB');
        if (!error) console.log(`${trade}: ${count}`);
    }

    // 3. Find non-standard trades
    const { data: others, error: err2 } = await supabase
        .from('businesses')
        .select('name, trade, city')
        .eq('country_code', 'GB')
        .not('trade', 'in', `(${standardTrades.join(',')})`);

    if (err2) console.error('Error fetching others:', err2.message);
    else {
        console.log('\n--- Non-Standard Trades (Total: ' + others.length + ') ---');
        const tradeCounts = {};
        others.forEach(b => {
            const t = b.trade || 'null';
            tradeCounts[t] = (tradeCounts[t] || 0) + 1;
        });
        Object.entries(tradeCounts).forEach(([t, c]) => console.log(`${t}: ${c}`));
        console.log('\nSample of non-standard listings:', others.slice(0, 5));
    }

    // 4. Check for test data
    const { count: testCount, error: err3 } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'GB')
        .or('name.ilike.%test%,name.ilike.%demo%,name.ilike.%dummy%');

    if (err3) console.error('Error fetching test count:', err3.message);
    else console.log('\nPotential test/demo listings:', testCount);
}

runAudit();
