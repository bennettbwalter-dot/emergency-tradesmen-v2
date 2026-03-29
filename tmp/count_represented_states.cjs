const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xwqvhymkwuasotsgmarn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKus';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countRepresentedStates() {
    // 1. Fetch all unique US cities from database
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('country_code', 'US');

    if (error) {
        console.error('Error fetching cities:', error);
        return;
    }

    const dbCities = new Set(businesses.map(b => b.city.trim().toLowerCase()));
    console.log(`Found ${dbCities.size} unique cities in database.`);

    // 2. Load us_cities.json
    const usCitiesPath = path.join(__dirname, '..', 'src', 'lib', 'us_cities.json');
    const usCitiesData = JSON.parse(fs.readFileSync(usCitiesPath, 'utf8'));

    // 3. Create a mapping of City -> State
    const cityToStateMap = new Map();
    usCitiesData.states.forEach(state => {
        state.metros.forEach(metro => {
            metro.cities.forEach(city => {
                cityToStateMap.set(city.name.toLowerCase(), state.code);
                if (city.suburbs) {
                    city.suburbs.forEach(sub => {
                        cityToStateMap.set(sub.name.toLowerCase(), state.code);
                    });
                }
            });
        });
    });

    // 4. Map DB cities to states
    const representedStates = new Set();
    const unmatchedCities = [];

    dbCities.forEach(city => {
        const stateCode = cityToStateMap.get(city);
        if (stateCode) {
            representedStates.add(stateCode);
        } else {
            unmatchedCities.push(city);
        }
    });

    console.log(`TOTAL_REPRESENTED_STATES: ${representedStates.size}`);
    console.log('Represented States List:', Array.from(representedStates).sort().join(', '));
    
    if (unmatchedCities.length > 0) {
        console.log(`TOTAL_UNMATCHED_CITIES: ${unmatchedCities.length}`);
        console.log('Unmatched Cities (up to 50):', unmatchedCities.slice(0, 50).join(', '));
    } else {
        console.log('No unmatched cities found.');
    }
}

countRepresentedStates();
