
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

async function findLondonTrades() {
    console.log("Searching for all trades in London (unlimited)...");

    let allLondon = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('trade')
            .eq('city', 'London')
            .range(from, to);

        if (error) {
            console.error(error);
            break;
        }

        if (data.length > 0) {
            allLondon = allLondon.concat(data);
            from += 1000;
            to += 1000;
        } else {
            hasMore = false;
        }
    }

    const tradeCounts = allLondon.reduce((acc, b) => {
        acc[b.trade] = (acc[b.trade] || 0) + 1;
        return acc;
    }, {});

    console.log("Total London listings:", allLondon.length);
    console.log("Trade counts in London:", tradeCounts);
}

findLondonTrades();
