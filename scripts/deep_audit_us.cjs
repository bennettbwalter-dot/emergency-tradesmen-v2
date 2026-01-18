const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAudit() {
    const usCitiesPath = path.join(__dirname, '../src/lib/us_cities.json');
    const usCities = JSON.parse(fs.readFileSync(usCitiesPath, 'utf8'));

    console.log(`🔍 Auditing ${usCities.length} US cities...`);

    const results = [];

    for (const city of usCities) {
        process.stdout.write(`Checking ${city}... `);

        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('country_code', 'US')
            .ilike('city', city);

        if (error) {
            console.error(`Error checking ${city}:`, error);
            results.push({ city, count: 0, error: error.message });
        } else {
            console.log(`${count} listings`);
            results.push({ city, count: count || 0 });
        }
    }

    console.log('\n--- AUDIT RESULTS ---');
    const missing = results.filter(r => r.count === 0);
    const low = results.filter(r => r.count > 0 && r.count < 10);

    console.log(`✅ Total Cities: ${results.length}`);
    console.log(`❌ Cities with 0 listings: ${missing.length}`);
    console.log(`⚠️ Cities with low (<10) listings: ${low.length}`);

    if (missing.length > 0) {
        console.log('\nMissing Cities:');
        missing.forEach(m => console.log(`- ${m.city}`));
    }

    if (low.length > 0) {
        console.log('\nLow Listing Cities:');
        low.forEach(l => console.log(`- ${l.city} (${l.count})`));
    }

    fs.writeFileSync('deep_audit_results.json', JSON.stringify(results, null, 2));
}

deepAudit();
