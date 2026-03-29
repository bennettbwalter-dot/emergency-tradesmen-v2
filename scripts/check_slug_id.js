import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSlugId() {
    console.log('Checking ID for slug: till-s-wrecker-service-breakdown-greenville');
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug')
        .eq('slug', 'till-s-wrecker-service-breakdown-greenville');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Existing record:', data);
    }
}

checkSlugId().catch(console.error);
