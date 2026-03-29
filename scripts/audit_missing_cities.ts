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

    const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('country_code', 'US');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const existingCities = new Set(data.map((b: any) => b.city.toLowerCase()));
    const missingCities = usCitiesJson.filter((c: string) => !existingCities.has(c.toLowerCase()));

    console.log('--- MISSING CITIES AUDIT ---');
    console.log(`Total cities in config: ${usCitiesJson.length}`);
    console.log(`Cities with coverage: ${usCitiesJson.length - missingCities.length}`);
    console.log(`Cities with ZERO listings: ${missingCities.length}`);
    console.log('\nMissing Cities:');
    console.log(missingCities.join(', '));
}

main();
