const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditTrades() {
    console.log('🔍 Comprehensive Auditing of Trade Coverage across 116 US Cities...');

    const citiesPath = path.join(__dirname, '../src/lib/us_cities.json');
    if (!fs.existsSync(citiesPath)) {
        console.error('❌ us_cities.json not found');
        return;
    }
    const cityNames = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

    // Correct slugs from trades.ts
    const trades = [
        'plumber',
        'electrician',
        'locksmith',
        'gas-engineer',
        'drain-specialist',
        'glazier',
        'roofer',
        'builder',
        'water-restoration',
        'breakdown',
        'hvac'
    ];

    const results = [];

    for (const trade of trades) {
        let allData = [];
        let from = 0;
        let step = 1000;
        let finished = false;

        while (!finished) {
            const { data, error } = await supabase
                .from('businesses')
                .select('city')
                .eq('trade', trade)
                .in('country_code', ['US', 'us', 'Us', 'uS'])
                .range(from, from + step - 1);

            if (error) {
                console.error(`Error for ${trade}:`, error.message);
                break;
            }

            allData = allData.concat(data);
            if (data.length < step) {
                finished = true;
            } else {
                from += step;
            }
        }

        const dbCities = new Set(allData.map(d => d.city.trim()));
        const dbCitiesNormalized = new Set(allData.map(d => d.city.toLowerCase().replace(/[^a-z]/g, '')));

        const missing = [];
        const matches = [];

        for (const city of cityNames) {
            const normCity = city.toLowerCase().replace(/[^a-z]/g, '');
            if (dbCities.has(city) || dbCitiesNormalized.has(normCity)) {
                matches.push(city);
            } else {
                missing.push(city);
            }
        }

        results.push({
            trade: trade,
            listings: allData.length,
            covered: matches.length,
            missing: missing.length,
            missing_sample: missing.length > 0 ? (missing.length > 3 ? missing.slice(0, 3).join(', ') + '...' : missing.join(', ')) : 'N/A'
        });
    }

    console.table(results);
}

auditTrades();
