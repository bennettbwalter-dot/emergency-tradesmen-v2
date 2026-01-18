
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { console.error("Missing keys"); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllUkCities() {
    console.log("Fetching all unique city names for GB...");

    let allCities = new Set<string>();
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city')
            .eq('country_code', 'GB')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) { console.error(error); break; }

        if (data && data.length > 0) {
            data.forEach((r: any) => {
                if (r.city) allCities.add(r.city.trim());
            });
            console.log(`Fetched page ${page} (${data.length} records)...`);
            page++;
        } else {
            hasMore = false;
        }
    }

    console.log(`\nFound ${allCities.size} unique city names in GB:`);
    const sorted = Array.from(allCities).sort();
    console.log(JSON.stringify(sorted, null, 2));
}

listAllUkCities();
