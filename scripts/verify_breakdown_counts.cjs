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
        'San Francisco', 'Indianapolis', 'Memphis', 'Seattle', 'Denver',
        'Washington, D.C.', 'Boston', 'El Paso', 'Nashville', 'Oklahoma City',
        'Las Vegas', 'Portland', 'Louisville', 'Milwaukee', 'Baltimore',
        'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City',
        'Atlanta', 'Raleigh', 'Colorado Springs', 'Omaha', 'Virginia Beach',
        'Minneapolis', 'Oakland', 'Tulsa',
        'Wichita', 'New Orleans', 'Cleveland', 'Bakersfield', 'Aurora', 'Anaheim',
        'Honolulu', 'Santa Ana', 'Riverside', 'Corpus Christi', 'Lexington',
        'Stockton', 'Henderson', 'Saint Paul', 'Cincinnati', 'Greensboro',
        'Plano', 'Newark', 'Lincoln', 'Orlando', 'Irvine', 'Fort Wayne',
        'Jersey City', 'Durham', 'St. Petersburg', 'Laredo', 'Lubbock',
        'Madison', 'Chandler', 'Buffalo', 'Gilbert',
        'Reno', 'Toledo', 'Chula Vista', 'Winston-Salem', 'North Las Vegas',
        'Irving', 'Chesapeake', 'Scottsdale', 'Glendale', 'Norfolk',
        'Fremont', 'Santa Clarita', 'San Bernardino', 'Hialeah', 'Garland',
        'Richmond', 'Boise', 'Baton Rouge', 'Des Moines', 'Spokane',
        'Tacoma', 'Fontana', 'Modesto', 'Moreno Valley', 'Birmingham',
        'Oxnard', 'Rochester', 'Fayetteville', 'Huntington Beach', 'Yonkers',
        'Aurora IL', 'Montgomery', 'Amarillo', 'Little Rock', 'Akron',
        'Columbus GA', 'Augusta', 'Grand Rapids', 'Shreveport', 'Salt Lake City',
        'Huntsville'
    ];

    console.log('🔍 Verifying Breakdown Recovery Listing Counts:');

    for (const city of cities) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('city', city)
            .eq('trade', 'breakdown')
            .eq('country_code', 'US');

        if (error) {
            console.error(`❌ Error verifying ${city}:`, error.message);
        } else {
            const status = count >= 5 ? '✅' : '❌';
            console.log(`${status} ${city}: ${count} listings`);
        }
    }
}

verifyCounts();
