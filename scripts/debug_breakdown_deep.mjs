
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissing() {
    console.log("Deep search for Breakdown listings in London...");

    // 1. Get ALL breakdown/recovery trades globally (unlimited)
    // We'll do this in batches if needed, but 10k items 'select trade, city' is fine.
    let allMatches = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('name, trade, city, verified, address')
            .or('trade.ilike.%break%, trade.ilike.%recovery%, name.ilike.%recovery%, name.ilike.%mechanic%')
            .range(from, to);

        if (error) {
            console.error(error);
            break;
        }

        if (data.length > 0) {
            allMatches = allMatches.concat(data);
            from += 1000;
            to += 1000;
        } else {
            hasMore = false;
        }
    }

    console.log(`Found ${allMatches.length} total potential matches globally.`);

    // 2. Filter for London (case-insensitive)
    const londonMatches = allMatches.filter(b =>
        b.city?.toLowerCase() === 'london' ||
        b.address?.toLowerCase().includes('london')
    );

    console.log(`Found ${londonMatches.length} potential matches in London.`);

    // 3. Group by trade to see what we have
    const tradeCounts = londonMatches.reduce((acc, b) => {
        acc[b.trade] = (acc[b.trade] || 0) + 1;
        return acc;
    }, {});
    console.log("Trades in London among matches:", tradeCounts);

    // 4. List them to check names and verification status
    londonMatches.forEach((b, i) => {
        console.log(`${i + 1}. ${b.name} | Trade: ${b.trade} | Verified: ${b.verified} | City: ${b.city}`);
    });
}

findMissing();
