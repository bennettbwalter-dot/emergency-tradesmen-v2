
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const US_CITIES = [
    'Dallas', 'Houston', 'San Antonio', 'Phoenix', 'Seattle', 'San Francisco',
    'Los Angeles', 'New York' // Check these too just in case
];

async function checkUSData() {
    console.log("--- Checking US Data in DB ---");

    for (const city of US_CITIES) {
        const { count, error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('city', city);
        // .eq('country_code', 'US'); // Assuming country_code is set, but city is safer primary filter + country check

        if (error) console.error(city, error.message);
        else console.log(`${city}: ${count} listings`);
    }

    // Check for bad phones in US data
    const { count: badPhones, error: phoneError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .in('city', US_CITIES)
        .ilike('phone', '%555-%'); // Check for 555 mock data in these cities

    if (phoneError) console.error("Phone Check Error", phoneError.message);
    else console.log(`\nPotential Mock Data (555-) in US Cities: ${badPhones}`);

    // Check for missing phones
    const { count: noPhones, error: noPhoneError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .in('city', US_CITIES)
        .is('phone', null);

    if (noPhoneError) console.error("No Phone Check Error", noPhoneError.message);
    else console.log(`Listings without phones in US Cities: ${noPhones}`);
}

checkUSData();
