import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditPlaceholders() {
    console.log("Checking for generic placeholder assets in Supabase...");

    // 1. Check for generic photo URLs
    const { count: genericPhotoCount } = await supabase
        .from('business_photos')
        .select('*', { count: 'exact', head: true })
        .ilike('url', '%/images/trades/%');

    console.log(`\nBusinesses with generic photo URLs (/images/trades/): ${genericPhotoCount}`);

    // 2. Check for hardcoded-style IDs like 'city-trade-index'
    // We can't easily regex in Supabase select without a custom function, but we can search for known prefixes
    const { data: sampleIds } = await supabase
        .from('businesses')
        .select('id')
        .limit(10);

    console.log("\nSample IDs in Supabase:");
    sampleIds.forEach(b => console.log(` - ${b.id}`));

    const { count: hardcodedIdCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .ilike('id', '%-%-%'); // Matches patterns with at least two hyphens

    console.log(`\nBusinesses with hyphenated-style IDs (potential legacy/mock): ${hardcodedIdCount}`);
}

auditPlaceholders();
