import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const usCitiesJson = JSON.parse(fs.readFileSync('../src/lib/us_cities.json', 'utf-8'));

    let allData: any[] = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    console.log('Fetching all US business records...');
    while (hasMore) {
        const { data, error } = await supabase
            .from('businesses')
            .select('city')
            .eq('country_code', 'US')
            .range(from, to);

        if (error) {
            console.error('Error:', error.message);
            break;
        }

        if (data && data.length > 0) {
            allData = allData.concat(data);
            from += 1000;
            to += 1000;
            // Safety break for massive datasets if needed, but 26k is fine
        } else {
            hasMore = false;
        }
    }

    const cityCounts: Record<string, number> = {};
    allData.forEach((b: any) => {
        const city = b.city.trim().toLowerCase();
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const belowTarget: any[] = [];
    const aboveTarget: any[] = [];

    usCitiesJson.forEach((city: string) => {
        const count = cityCounts[city.toLowerCase()] || 0;
        if (count < 18) {
            belowTarget.push({ city, count });
        } else {
            aboveTarget.push({ city, count });
        }
    });

    console.log('\n--- CITIES BELOW TARGET (18+) ---');
    belowTarget.sort((a, b) => a.count - b.count).forEach(c => {
        console.log(`${c.city}: ${c.count}`);
    });

    console.log('\n--- CITIES MEETING TARGET ---');
    console.log(`Total cities meeting target: ${aboveTarget.length}`);
    console.log(`Total cities below target: ${belowTarget.length}`);
}

main();
