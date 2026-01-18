const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const cities = [
        'Fort Worth', 'Miami', 'Columbus', 'Tampa', 'Indianapolis', 'Charlotte',
        'Houston', 'Dallas', 'San Antonio', 'Phoenix', 'Los Angeles', 'San Diego',
        'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Memphis', 'Seattle',
        'Denver', 'Washington, D.C.', 'Boston', 'El Paso', 'Nashville', 'Oklahoma City',
        'Las Vegas', 'Portland', 'Louisville', 'Milwaukee', 'Baltimore', 'Albuquerque',
        'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta',
        'Raleigh', 'Colorado Springs', 'Omaha', 'Virginia Beach', 'Minneapolis', 'Oakland',
        'Tulsa', 'Wichita', 'New Orleans', 'Cleveland', 'Bakersfield', 'Arlington',
        'Philadelphia', 'Honolulu', 'Aurora', 'Anaheim', 'Santa Ana', 'Corpus Christi',
        'Riverside', 'Lexington', 'Stockton', 'Henderson', 'Saint Paul', 'Cincinnati',
        'Greensboro', 'Plano', 'Lincoln', 'Orlando', 'New York City', 'Chicago',
        'St. Louis', 'Anchorage', 'Scottsdale', 'Detroit', 'Pittsburgh', 'Buffalo',
        'Lubbock', 'Laredo', 'Amarillo', 'Midland', 'Abilene', 'Denton',
        'Irving', 'Garland', 'Frisco', 'McKinney', 'Waco',
        'Carrollton', 'Richardson', 'Lewisville', 'Round Rock', 'College Station', 'Tyler',
        'Pearland', 'Sugar Land', 'Allen', 'League City', 'Conroe', 'New Braunfels',
        'Edinburg', 'Mission', 'Pharr', 'Bryan', 'Baytown', 'Missouri City',
        'North Las Vegas', 'Fontana', 'Modesto', 'Moreno Valley', 'Santa Clarita', 'Oxnard',
        'Oceanside', 'Rancho Cucamonga', 'Huntington Beach', 'Glendale', 'Santa Rosa', 'Ontario', 'Elk Grove', 'Garden Grove'
    ];

    console.log('🔍 Verifying HVAC Repair Listing Counts:');

    for (const city of cities) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('trade', 'hvac')
            .eq('city', city)
            .eq('country_code', 'US');

        if (error) {
            console.error(`❌ Error verifying ${city}: ${error.message}`);
        } else {
            console.log(`✅ ${city}: ${count} listings`);
        }
    }
}

verify();
