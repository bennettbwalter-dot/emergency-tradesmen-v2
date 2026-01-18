const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCounts() {
    const cities = [
        'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
        'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
        'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
        'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Washington DC',
        'Boston', 'El Paso', 'Nashville', 'Oklahoma City', 'Las Vegas',
        'Portland', 'Louisville', 'Milwaukee', 'Baltimore', 'Albuquerque',
        'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Long Beach',
        'Mesa', 'Atlanta', 'Colorado Springs', 'Virginia Beach', 'Raleigh',
        'Omaha', 'Miami', 'Oakland', 'Tulsa', 'Minneapolis',
        'Wichita', 'New Orleans', 'Arlington', 'Cleveland', 'Bakersfield',
        'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana', 'Riverside',
        'Corpus Christi', 'Lexington', 'Stockton', 'Henderson', 'Saint Paul',
        'Plano', 'Newark', 'Lincoln', 'Orlando', 'Irvine',
        'Fort Wayne', 'Jersey City', 'Durham', 'St. Petersburg', 'Laredo',
        'Lubbock', 'Madison', 'Chandler', 'Buffalo', 'Gilbert',
        'Reno', 'Glendale', 'North Las Vegas', 'Scottsdale', 'Winston-Salem',
        'Chesapeake', 'Norfolk', 'Fremont', 'Santa Clarita', 'Birmingham',
        'Hialeah', 'Richmond', 'Boise', 'Spokane', 'Garland',
        'Moreno Valley', 'Santa Rosa', 'Amarillo', 'Yonkers', 'Aurora (IL)',
        'Montgomery', 'Akron', 'Little Rock', 'Huntsville', 'Augusta',
        'Grand Rapids', 'Shreveport', 'Salt Lake City', 'Mobile', 'Tallahassee',
        'Grand Prairie', 'Overland Park', 'Knoxville', 'Port St. Lucie', 'Worcester',
        'Brownsville', 'Tempe', 'Providence', 'Cape Coral', 'Chattanooga', 'Jackson'
    ];

    console.log('🔍 Verifying Emergency Plumber Listing Counts (FULL 116 CITY COVERAGE):');

    for (const city of cities) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('trade', 'plumber')
            .eq('city', city);

        if (error) {
            console.error(`❌ Error verifying ${city}:`, error.message);
        } else {
            console.log(`✅ ${city}: ${count} listings`);
        }
    }
}

verifyCounts();
