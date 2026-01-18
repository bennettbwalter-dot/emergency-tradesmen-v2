const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
    console.log('Starting Thorough US Coverage Audit...');

    const usCities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/us_cities.json'), 'utf-8'));
    const tradesTs = fs.readFileSync(path.join(__dirname, '../src/lib/trades.ts'), 'utf-8');

    // Extract cityToState
    const cityToStateMatch = tradesTs.match(/export const cityToState: Record<string, string> = \{([\s\S]+?)\};/);
    const cityToState = {};
    if (cityToStateMatch) {
        const content = cityToStateMatch[1];
        const pairs = content.split('\n');
        pairs.forEach(line => {
            const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
            if (match) {
                cityToState[match[1]] = match[2];
            }
        });
    }

    // Extract serviceAreaMap
    const serviceAreaMapMatch = tradesTs.match(/const serviceAreaMap: Record<string, string\[\]> = \{([\s\S]+?)\};/);
    const serviceAreaMap = {};
    if (serviceAreaMapMatch) {
        const content = serviceAreaMapMatch[1];
        const lines = content.split('\n');
        let currentCity = null;
        lines.forEach(line => {
            const cityMatch = line.match(/"([^"]+)":\s*\[/);
            if (cityMatch) {
                currentCity = cityMatch[1];
                serviceAreaMap[currentCity] = [];
            } else if (currentCity && line.includes('"')) {
                const suburbs = line.match(/"([^"]+)"/g);
                if (suburbs) {
                    suburbs.forEach(s => serviceAreaMap[currentCity].push(s.replace(/"/g, '')));
                }
            }
            if (line.includes('],')) currentCity = null;
        });
    }

    const dbCityCounts = {};
    let from = 0;
    let hasMore = true;
    console.log('Fetching all US records in batches of 1000...');

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city')
            .eq('country_code', 'US')
            .range(from, from + 999);

        if (error) {
            console.error(error.message);
            break;
        }

        if (data && data.length > 0) {
            data.forEach(row => {
                const city = (row.city || '').trim().toLowerCase();
                dbCityCounts[city] = (dbCityCounts[city] || 0) + 1;
            });
            from += 1000;
            if (data.length < 1000) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    const auditResults = {
        states: {},
        missingCities: [],
        missingSuburbs: {},
        coveredCities: []
    };

    usCities.forEach(city => {
        const state = cityToState[city] || 'unknown';
        if (!auditResults.states[state]) auditResults.states[state] = { total: 0, covered: 0, missing: [] };

        auditResults.states[state].total++;
        const count = dbCityCounts[city.toLowerCase()] || 0;
        if (count > 0) {
            auditResults.states[state].covered++;
            auditResults.coveredCities.push(city);
        } else {
            auditResults.states[state].missing.push(city);
            auditResults.missingCities.push(city);
        }

        if (serviceAreaMap[city]) {
            const missingSub = serviceAreaMap[city].filter(s => (dbCityCounts[s.toLowerCase()] || 0) === 0);
            if (missingSub.length > 0) {
                auditResults.missingSuburbs[city] = missingSub;
            }
        }
    });

    console.log('\n--- US COVERAGE AUDIT REPORT ---');

    console.log('\n[STATE COMPLETION STATS]');
    const states = Object.keys(auditResults.states).sort();
    states.forEach(state => {
        const stats = auditResults.states[state];
        const status = stats.covered === stats.total ? 'COMPLETE' : `INCOMPLETE (${stats.covered}/${stats.total})`;
        console.log(`${state.toUpperCase()}: ${status}`);
        if (stats.missing.length > 0) {
            console.log(`  - Missing Cities: ${stats.missing.join(', ')}`);
        }
    });

    console.log('\n[CITIES SUMMARY]');
    console.log(`Total Target Cities: ${usCities.length}`);
    console.log(`Covered Cities: ${auditResults.coveredCities.length}`);
    console.log(`Missing Cities: ${auditResults.missingCities.length}`);

    console.log('\n[MISSING SUBURBS]');
    const metrosWithMissingSuburbs = Object.keys(auditResults.missingSuburbs);
    if (metrosWithMissingSuburbs.length === 0) {
        console.log('All suburbs in serviceAreaMap have listings.');
    } else {
        metrosWithMissingSuburbs.forEach(metro => {
            console.log(`- ${metro}: Missing [${auditResults.missingSuburbs[metro].join(', ')}]`);
        });
    }

    console.log('\nAudit Finished. No data was modified.');
}

runAudit();
