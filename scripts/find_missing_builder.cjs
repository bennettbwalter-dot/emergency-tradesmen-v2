const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissing(trade) {
    const citiesPath = path.join(__dirname, '../src/lib/us_cities.json');
    const cityNames = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

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
    for (const city of cityNames) {
        const normCity = city.toLowerCase().replace(/[^a-z]/g, '');
        if (!dbCities.has(city) && !dbCitiesNormalized.has(normCity)) {
            missing.push(city);
        }
    }

    console.log(`Missing cities for ${trade}:`, missing);
    // Write missing cities to a file for easier processing
    fs.writeFileSync(path.join(__dirname, 'missing_builder_cities.json'), JSON.stringify(missing, null, 2));
}

findMissing('builder');
