const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const allStates = [
    'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
    'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
    'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
    'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
    'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'
].map(s => s.toUpperCase());

async function auditAllStates() {
    console.log('Auditing all 50 US States...');

    let from = 0;
    let hasMore = true;
    const stateCounts = {};

    while (hasMore) {
        // We select state if available, but cityToState is our primary mapping source.
        // However, the DB might have a 'state' column or we can attempt to map from the DB city/address.
        // Let's see the schema first.
        const { data, error } = await supabase
            .from('businesses')
            .select('city, country_code, address')
            .eq('country_code', 'US')
            .range(from, from + 999);

        if (error) {
            console.error(error.message);
            break;
        }

        if (data && data.length > 0) {
            data.forEach(row => {
                // Many records have state in the address or we can use our cityToState map
                // For this audit, we'll try to extract state from address if possible
                const address = row.address || '';
                const stateMatch = address.match(/,\s*([A-Z]{2})\s*\d{5}/);
                if (stateMatch) {
                    const state = stateMatch[1];
                    stateCounts[state] = (stateCounts[state] || 0) + 1;
                }
            });
            from += 1000;
            if (data.length < 1000) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    console.log('\n--- 50 STATE COVERAGE AUTO-AUDIT ---');
    const missingStates = allStates.filter(s => !stateCounts[s]);
    const coveredStates = allStates.filter(s => stateCounts[s]);

    console.log(`Covered States (${coveredStates.length}):`, coveredStates.join(', '));
    console.log(`Missing States (${missingStates.length}):`, missingStates.join(', '));

    console.log('\nState-by-State Counts (from Address parsing):');
    Object.keys(stateCounts).sort().forEach(s => {
        console.log(`${s}: ${stateCounts[s]} listings`);
    });
}

auditAllStates();
