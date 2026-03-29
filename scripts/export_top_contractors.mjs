import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function exportTopContractors() {
    console.log('🎯 Exporting Top 50 Dallas Contractors for Recruitment\n');

    // Get all US contractors
    const { data: contractors, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('country_code', 'US');

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log(`📦 Total US contractors in DB: ${contractors.length}`);
    console.log(`📞 Contractors with phone: ${contractors.filter(c => c.phone).length}`);
    console.log(`⭐ Contractors with rating >= 4.0: ${contractors.filter(c => c.rating >= 4.0).length}\n`);

    // More lenient filtering
    const ranked = contractors
        .filter(c => c.rating && c.rating >= 4.5) // Only top-rated pros
        .sort((a, b) => {
            // Sort by review count first, then rating
            const reviewDiff = (b.review_count || 0) - (a.review_count || 0);
            if (reviewDiff !== 0) return reviewDiff;
            return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 50); // Top 50

    console.log(`✅ Selected ${ranked.length} top contractors\n`);

    if (ranked.length === 0) {
        console.log('⚠️  No contractors found. Checking sample data...');
        console.log('\nSample contractor:');
        console.log(JSON.stringify(contractors[0], null, 2));
        return;
    }

    // Create CSV
    const csvHeader = 'Rank,Business Name,Trade,Phone,Address,City,Rating,Reviews,Google URL\n';
    const csvRows = ranked.map((c, index) => {
        const phone = c.phone || 'N/A';
        const address = c.address || 'N/A';
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((c.name || '') + ' ' + (c.city || 'Dallas') + ' TX')}`;
        return `${index + 1},"${c.name}","${c.trade}","${phone}","${address}","${c.city || 'Dallas'}",${c.rating || 0},${c.review_count || 0},"${googleUrl}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;
    fs.writeFileSync('top_50_contractors.csv', csv);

    console.log('✅ Exported to: top_50_contractors.csv\n');
    console.log('📋 Top 10 Preview:\n');

    ranked.slice(0, 10).forEach((c, i) => {
        console.log(`${i + 1}. ${c.name}`);
        console.log(`   📞 ${c.phone || 'No phone listed'}`);
        console.log(`   ⭐ ${c.rating} stars (${c.review_count || 0} reviews)`);
        console.log(`   📍 ${c.city || 'Dallas'}, TX\n`);
    });

    console.log('💡 Next Steps:');
    console.log('1. Open top_50_contractors.csv in Excel/Google Sheets');
    console.log('2. Start calling from the top of the list');
    console.log('3. Use the scripts from contractor_recruitment_guide.md');
    console.log('4. Track your progress in a spreadsheet\n');
}

exportTopContractors();
