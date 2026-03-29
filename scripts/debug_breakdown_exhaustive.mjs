
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

async function exhaustiveSearch() {
    console.log("Exhaustive search for 'breakdown' listings in London...");

    let allLondonBreakdown = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('city', 'London')
            .eq('trade', 'breakdown')
            .range(from, from + batchSize - 1);

        if (error) {
            console.error("Error at range", from, ":", error);
            break;
        }

        if (data && data.length > 0) {
            allLondonBreakdown = allLondonBreakdown.concat(data);
            from += batchSize;
        } else {
            hasMore = false;
        }
    }

    console.log(`Found ${allLondonBreakdown.length} breakdown listings for London.`);

    if (allLondonBreakdown.length > 0) {
        allLondonBreakdown.forEach((b, i) => {
            console.log(`${i + 1}. ${b.name} (${b.id}) - Verified: ${b.verified}`);
        });
    }

    // Also check for 'london' (lowercase)
    console.log("\nChecking for 'london' (lowercase)...");
    const { data: lowerLondon } = await supabase
        .from('businesses')
        .select('count', { count: 'exact', head: true })
        .eq('city', 'london')
        .eq('trade', 'breakdown');

    console.log(`Found ${lowerLondon || 0} (count only query) for lowercase 'london' breakdown.`);
}

exhaustiveSearch();
