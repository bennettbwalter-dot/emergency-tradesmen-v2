import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseMissing() {
    console.log("🔍 Diagnosing Missing Postcodes...");

    // Fetch businesses with NULL postcode
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('city')
        .is('postcode', null);

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    console.log(`Found ${businesses.length} businesses without postcodes.`);

    // Group by City
    const cityCounts = businesses.reduce((acc, biz) => {
        const city = biz.city ? biz.city.trim() : "UNKNOWN";
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    // Sort by count
    const sortedCities = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50); // Top 50

    console.log("\nTop 50 Missing Cities:");
    sortedCities.forEach(([city, count]) => {
        console.log(`${count}x - "${city}"`);
    });
}

diagnoseMissing();
