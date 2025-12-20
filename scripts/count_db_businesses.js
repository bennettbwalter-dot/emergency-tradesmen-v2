import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function countBusinesses() {
    const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log('=== DATABASE STATUS ===');
    console.log(`Total businesses in Supabase: ${count}`);
}

countBusinesses();
