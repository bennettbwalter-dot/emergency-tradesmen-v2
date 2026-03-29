import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function detailedCheck() {
    console.log('🔍 Detailed US Contractor Analysis\n');

    // Get all US contractors
    const { data: allUS, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('country_code', 'US');

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log(`📊 Total in Database: ${allUS.length}`);

    // Check for specific businesses from the JSON
    const sampleNames = [
        'Precision Emergency Plumber Dallas',
        'Baker Brothers Plumbing, Air & Electric',
        'Metro Flow Plumbing - Dallas Emergency Plumbers'
    ];

    console.log('\n🔍 Checking sample businesses:');
    for (const name of sampleNames) {
        const found = allUS.find(b => b.name === name);
        console.log(`   ${found ? '✅' : '❌'} ${name}`);
    }

    // Check verification status
    const verified = allUS.filter(b => b.verified === true).length;
    const unverified = allUS.filter(b => b.verified === false || b.verified === null).length;

    console.log(`\n📋 Verification Status:`);
    console.log(`   ✅ Verified: ${verified}`);
    console.log(`   ⚠️  Unverified: ${unverified}`);

    // Check for any limits or filters
    console.log(`\n🔧 Trade breakdown:`);
    const trades = {};
    allUS.forEach(b => {
        trades[b.trade] = (trades[b.trade] || 0) + 1;
    });
    Object.entries(trades).forEach(([trade, count]) => {
        console.log(`   ${trade}: ${count}`);
    });
}

detailedCheck();
