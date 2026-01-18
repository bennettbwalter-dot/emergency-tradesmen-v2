import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUSContractors() {
    console.log('🔍 Checking for US contractors in database...\n');

    // Check total US contractors
    const { data: usContractors, error: usError, count: usCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('country_code', 'US');

    if (usError) {
        console.error('❌ Error fetching US contractors:', usError);
        return;
    }

    console.log(`📊 Total US Contractors: ${usCount || 0}`);

    if (usCount > 0) {
        // Group by city
        const cityCounts = {};
        usContractors.forEach(business => {
            cityCounts[business.city] = (cityCounts[business.city] || 0) + 1;
        });

        console.log('\n📍 Breakdown by City:');
        Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([city, count]) => {
                console.log(`   ${city}: ${count} contractors`);
            });

        // Group by trade
        const tradeCounts = {};
        usContractors.forEach(business => {
            tradeCounts[business.trade] = (tradeCounts[business.trade] || 0) + 1;
        });

        console.log('\n🔧 Breakdown by Trade:');
        Object.entries(tradeCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([trade, count]) => {
                console.log(`   ${trade}: ${count} contractors`);
            });

        // Show sample contractors
        console.log('\n📋 Sample US Contractors:');
        usContractors.slice(0, 5).forEach(business => {
            console.log(`   • ${business.name} (${business.city}, ${business.state})`);
            console.log(`     Trade: ${business.trade} | Rating: ${business.rating} | Reviews: ${business.review_count}`);
        });
    } else {
        console.log('\n⚠️  No US contractors found in database!');
        console.log('   The dallas_businesses.json file exists but data may not be imported yet.');
    }

    // Check UK contractors for comparison
    const { count: ukCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', 'GB');

    console.log(`\n📊 Total UK Contractors: ${ukCount || 0}`);
    console.log(`\n✅ Database check complete!`);
}

checkUSContractors();
