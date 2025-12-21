
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

async function checkCities() {
    console.log("Global City Distribution (Top 50):");

    let allCities = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    // We only need 10k rows, which is 10 batches.
    while (hasMore && allCities.length < 11000) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city')
            .range(from, to);

        if (error) {
            console.error(error);
            break;
        }

        if (data.length > 0) {
            allCities = allCities.concat(data);
            from += 1000;
            to += 1000;
        } else {
            hasMore = false;
        }
    }

    const counts = allCities.reduce((acc, curr) => {
        const c = curr.city || 'null';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    console.log(sorted.slice(0, 50));
}

checkCities();
