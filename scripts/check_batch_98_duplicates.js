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

const slugsToCheck = [
    'till-s-wrecker-service-breakdown-greenville',
    'servpro-of-greenville-troy-andalusia-water-restoration-greenville',
    'georgiana-heavy-duty-towing-breakdown-georgiana',
    'experts-water-damage-restoration-llc-water-restoration-georgiana',
    'georgiana-heavy-duty-towing-breakdown-mckenzie',
    'experts-water-damage-restoration-llc-water-restoration-mckenzie',
    'till-s-wrecker-service-breakdown-bolling',
    'servpro-of-greenville-troy-andalusia-water-restoration-bolling',
    'georgiana-heavy-duty-towing-breakdown-chapman',
    'experts-water-damage-restoration-llc-water-restoration-chapman',
    'till-s-wrecker-service-breakdown-forest-home',
    'servpro-of-greenville-troy-andalusia-water-restoration-forest-home',
    'till-s-wrecker-service-breakdown-butler-springs',
    'servpro-of-greenville-troy-andalusia-water-restoration-butler-springs',
    'georgiana-heavy-duty-towing-breakdown-manistee',
    'experts-water-damage-restoration-llc-water-restoration-manistee',
    'till-s-wrecker-service-breakdown-monterey',
    'servpro-of-greenville-troy-andalusia-water-restoration-monterey',
    'georgiana-heavy-duty-towing-breakdown-oaky-streak',
    'experts-water-damage-restoration-llc-water-restoration-oaky-streak'
];

async function checkDuplicates() {
    console.log('Checking for duplicate slugs...');
    const { data, error } = await supabase
        .from('businesses')
        .select('slug')
        .in('slug', slugsToCheck);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Found duplicates:', data);
    }
}

checkDuplicates().catch(console.error);
