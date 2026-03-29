
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUkElectricians() {
    console.log("Checking for UK Electricians in DB...");

    // Check exact match
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('trade', 'electrician')
        .eq('country_code', 'GB');

    if (error) {
        console.error("Error checking electricians:", error);
    } else {
        console.log(`Found ${count} UK Electrician listings in the database.`);
    }

    // Check Aberdeen specifically
    const { count: aberdeenCount, error: aberdeenError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('trade', 'electrician')
        .eq('country_code', 'GB')
    if (aberdeenError) {
        console.error("Error checking Aberdeen:", aberdeenError);
    } else {
        console.log(`Found ${aberdeenCount} UK Electrician listings in Aberdeen.`);
    }

    // List top 20 cities with Electricians
    console.log("\nTop cities with UK Electricians:");
    const { data: cityData, error: cityError } = await supabase
        .from('businesses')
        .select('city')
        .eq('trade', 'electrician')
        .eq('country_code', 'GB');

    if (cityError) {
        console.error("Error fetching cities:", cityError);
    } else {
        const cityCounts: Record<string, number> = {};
        cityData.forEach((b: any) => {
            const c = b.city || "Unknown";
            cityCounts[c] = (cityCounts[c] || 0) + 1;
        });

        const sorted = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
        console.log(sorted);
    }

    // Check unique trade slugs for GB
    console.log("\nChecking available trade slugs for country_code='GB':");
    const { data: trades, error: tradeError } = await supabase
        .from('businesses')
        .select('trade')
        .eq('country_code', 'GB');

    if (tradeError) {
        console.error("Error fetching trades:", tradeError);
    } else {
        const uniqueTrades = [...new Set(trades.map(t => t.trade))];
        console.log("Unique UK Trade Slugs:", uniqueTrades);
    }
}

checkUkElectricians();
