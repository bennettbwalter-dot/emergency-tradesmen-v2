const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listMissingCities(tradeSlug) {
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
            .eq('trade', tradeSlug)
            .in('country_code', ['US', 'us', 'Us', 'uS'])
            .range(from, from + step - 1);

        if (error) {
            console.error(`Error for ${tradeSlug}:`, error.message);
            break;
        }

        allData = allData.concat(data);
        if (data.length < step) {
            finished = true;
        } else {
            from += step;
        }
    }

    const dbCities = new Set(allData.map(d => d.city.trim().toLowerCase().replace(/[^a-z]/g, '')));
    const missing = cityNames.filter(city => {
        const normCity = city.toLowerCase().replace(/[^a-z]/g, '');
        return !dbCities.has(normCity);
    });

    console.log(JSON.stringify(missing));
}

const trade = process.argv[2] || 'breakdown';
listMissingCities(trade);
