import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- TABLE SCHEMA ---');
    if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        console.log('No data found to check schema.');
    }
}

main();
