import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('Inspecting businesses table schema...');

    // Try to fetch via RPC or just a wide select
    const { data, error } = await supabase.from('businesses').select('*').limit(1);
    if (error) {
        console.error('Error fetching row:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).sort().join(', '));
    } else {
        console.log('No rows found in businesses table.');
    }
}
inspectSchema();
