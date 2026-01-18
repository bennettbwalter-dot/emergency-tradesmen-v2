const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const cities = [
    'Fort Worth', 'Miami', 'Columbus', 'Tampa', 'Indianapolis', 'Charlotte',
    'Houston', 'Dallas', 'San Antonio', 'Phoenix', 'Los Angeles', 'San Diego',
    'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Memphis', 'Seattle',
    'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville', 'Oklahoma City',
    'Las Vegas', 'Portland', 'Louisville', 'Milwaukee', 'Baltimore', 'Albuquerque',
    'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta',
    'Raleigh', 'Colorado Springs', 'Omaha', 'Virginia Beach', 'Minneapolis', 'Oakland',
    'Tulsa', 'Wichita', 'New Orleans', 'Cleveland', 'Bakersfield', 'Arlington',
    'Philadelphia', 'Honolulu', 'Aurora', 'Anaheim', 'Santa Ana', 'Corpus Christi',
    'Detroit', 'Riverside', 'Lexington', 'Stockton', 'Cincinnati', 'St. Paul',
    'Orlando', 'Scottsdale', 'Pittsburgh', 'Buffalo', 'Tacoma', 'Spokane',
    'St. Louis', 'Anchorage', 'Greensboro', 'Lincoln', 'Henderson', 'Long Beach',
    'Plano', 'Irving', 'Garland', 'Frisco', 'McKinney', 'Lubbock',
    'Laredo', 'Amarillo', 'Midland', 'Abilene', 'Denton', 'Waco',
    'Carrollton', 'Richardson', 'Lewisville', 'Round Rock', 'College Station', 'Tyler',
    'Pearland', 'Sugar Land', 'Allen', 'League City', 'Conroe', 'New Braunfels',
    'Atascocita', 'Mission', 'Edinburg', 'Pharr', 'Bryan', 'Baytown',
    'Missouri City', 'Temple', 'Flower Mound', 'North Richland Hills', 'Mansfield', 'Victoria',
    'Rowlett', 'Harlingen', 'Pflugerville', 'San Marcos', 'Euless', 'Port Arthur',
    'Grapevine', 'New York City', 'Chicago'
];

const trades = [
    'plumber',
    'electrician',
    'locksmith',
    'gas-engineer',
    'drain-specialist',
    'glazier',
    'breakdown',
    'roofer',
    'builder',
    'hvac'
];

async function runAudit() {
    console.log('--- US NATIONWIDE TRADE COVERAGE AUDIT ---');
    const results = [];

    for (const city of cities) {
        const cityData = { city };
        for (const trade of trades) {
            const { count, error } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true })
                .eq('city', city)
                .eq('trade', trade)
                .eq('country_code', 'US');

            cityData[trade] = count || 0;
        }
        results.push(cityData);
        process.stdout.write('.');
    }
    console.log('\n');

    // Summary of missing trades
    const missing = trades.map(t => {
        const citiesWithTrade = results.filter(r => r[t] > 0).length;
        return {
            trade: t,
            coverage: `${citiesWithTrade}/${cities.length} cities`,
            missing: cities.length - citiesWithTrade
        };
    });

    console.table(missing);

    // Specific cities with zero HVAC (as it seems to be the biggest gap)
    const zeroHvac = results.filter(r => r.hvac === 0).map(r => r.city);
    console.log(`\nCities with 0 HVAC: ${zeroHvac.length}`);

    const zeroBreakdown = results.filter(r => r.breakdown === 0).map(r => r.city);
    console.log(`Cities with 0 Breakdown Recovery: ${zeroBreakdown.length}`);

    const zeroGlazier = results.filter(r => r.glazier === 0).map(r => r.city);
    console.log(`Cities with 0 Glazier: ${zeroGlazier.length}`);

    fs.writeFileSync('scripts/audit_results_phase8_complete.json', JSON.stringify(results, null, 2));
    console.log('\nAudit results saved to scripts/audit_results_phase8_complete.json');
}

runAudit();
