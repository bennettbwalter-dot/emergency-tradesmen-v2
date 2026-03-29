
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImport() {
    const testCases = [
        { name: 'Leetech Gas Engineers Ltd', city: 'Newport' },
        { name: 'PlumbRite Plumbing, Heating & Boilers', city: 'Poole' },
        { name: 'Stockport Plumbers', city: 'Stockport' },
        { name: 'Essex Plumbing & Heating', city: 'Basildon' },
        { name: 'Robinson Heating And Plumbing', city: 'Maidstone' }
    ];

    console.log('Verifying Phase 12 Group A Import...');

    for (const test of testCases) {
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .ilike('name', test.name)
            .eq('city', test.city);

        if (error) {
            console.error(`Error checking ${test.name}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`[PASS] Found ${test.name} in ${test.city} (Verified: ${data[0].verified})`);
        } else {
            console.error(`[FAIL] Could not find ${test.name} in ${test.city}`);
        }
    }
}

checkImport();
