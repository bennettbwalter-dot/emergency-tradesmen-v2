const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Mock of the logic used in businessService.ts after my fix
const mockMasterUSCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

async function testVisibility(citySlug, trade, countryCode) {
    console.log(`Testing visibility for: ${trade} in ${citySlug} (${countryCode})`);
    
    // Logic from businessService.ts
    const normalizedInput = citySlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    let searchCity = citySlug;
    
    const matchingCityList = mockMasterUSCities.find(c => 
        c.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedInput
    );
    
    if (matchingCityList) {
        searchCity = matchingCityList;
        console.log(`  -> Normalized "${citySlug}" to "${searchCity}"`);
    } else {
        console.log(`  -> No master city match found for "${citySlug}"`);
    }

    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('trade', trade)
        .eq('city', searchCity)
        .eq('country_code', countryCode);

    if (error) {
        console.error(`  !! Error: ${error.message}`);
    } else {
        console.log(`  => Results Found: ${count}`);
    }
}

async function run() {
    console.log('--- US REGION VERIFICATION ---');
    await testVisibility('new-york', 'plumber', 'US');
    await testVisibility('los-angeles', 'electrician', 'US');
    await testVisibility('dallas', 'hvac', 'US');
    
    console.log('\n--- UK REGION VERIFICATION ---');
    // Note: 'london' should already be matching because it's in the UK master list
    await testVisibility('london', 'plumber', 'GB');
}

run();
