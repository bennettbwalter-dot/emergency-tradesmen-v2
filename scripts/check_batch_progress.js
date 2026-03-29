
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBatch(name, city) {
    const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('name', name)
        .eq('city', city);
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(JSON.stringify(data));
    }
}

checkBatch("Roto-Rooter Plumbing & Water Restoration", "Woodbury");
