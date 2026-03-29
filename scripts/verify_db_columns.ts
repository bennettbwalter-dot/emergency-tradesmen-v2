import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

// Forced override to match user's dashboard project
const supabaseUrl = 'https://antqstrspkchkoylysqa.supabase.co';
const supabaseServiceKey = 'sb_secret_cU09MJkRP69u1Nrb7C4gsw_h1vI_Y5_'; // From env_check.txt

console.log('Connecting to Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    // Try to select the new columns from one row
    const { data, error } = await supabase
        .from('businesses')
        .select('city_slug, state_slug, country_code')
        .limit(1);

    if (error) {
        console.log('MISSING');
    } else {
        console.log('EXISTS');
    }
}

checkColumns();
