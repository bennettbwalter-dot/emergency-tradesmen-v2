const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const cities = [
        // Batch 1
        'Fort Worth', 'Miami', 'Columbus', 'Tampa', 'Indianapolis', 'Charlotte',
        // Batch 2
        'Houston', 'Dallas', 'San Antonio', 'Phoenix', 'Los Angeles', 'San Diego',
        // Batch 3
        'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Memphis', 'Seattle',
        // Batch 4
        'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville', 'Oklahoma City',
        // Batch 5
        'Las Vegas', 'Portland', 'Louisville', 'Milwaukee', 'Baltimore', 'Albuquerque',
        // Batch 6
        'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta',
        // Batch 7
        'Raleigh', 'Colorado Springs', 'Omaha', 'Virginia Beach', 'Minneapolis', 'Oakland',
        // Batch 8
        'Tulsa', 'Wichita', 'New Orleans', 'Cleveland', 'Bakersfield', 'Arlington',
        // Batch 9
        'Philadelphia', 'Honolulu', 'Aurora', 'Anaheim', 'Santa Ana', 'Corpus Christi',
        // Batch 10
        'Detroit', 'Riverside', 'Lexington', 'Stockton', 'Cincinnati', 'St. Paul',
        // Batch 11
        'Orlando', 'Scottsdale', 'Pittsburgh', 'Buffalo', 'Tacoma', 'Spokane',
        // Batch 12
        'St. Louis', 'Anchorage', 'Greensboro', 'Lincoln', 'Henderson', 'Long Beach',
        // Batch 13
        'Plano', 'Irving', 'Garland', 'Frisco', 'McKinney', 'Lubbock',
        // Batch 14
        'Laredo', 'Amarillo', 'Midland', 'Abilene', 'Denton', 'Waco',
        // Batch 15
        'Carrollton', 'Richardson', 'Lewisville', 'Round Rock', 'College Station', 'Tyler',
        // Batch 16
        'Pearland', 'Sugar Land', 'Allen', 'League City', 'Conroe', 'New Braunfels',
        // Batch 17
        'Atascocita', 'Mission', 'Edinburg', 'Pharr', 'Bryan', 'Baytown',
        // Batch 18
        'Missouri City', 'Temple', 'Flower Mound', 'North Richland Hills', 'Mansfield', 'Victoria',
        // Batch 19
        'Rowlett', 'Harlingen', 'Pflugerville', 'San Marcos', 'Euless', 'Port Arthur',
        // Batch 20
        'Grapevine', 'New York City', 'Chicago'
    ];

    console.log('🔍 Verifying Glass Repair Listing Counts:');

    for (const city of cities) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('trade', 'glazier')
            .eq('city', city);

        if (error) {
            console.error(`❌ Error verifying ${city}: ${error.message}`);
        } else {
            console.log(`✅ ${city}: ${count} listings`);
        }
    }
}

verify();
