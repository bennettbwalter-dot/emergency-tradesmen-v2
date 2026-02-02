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

async function auditIntegrity() {
    console.log("Searching for potential mock data in Supabase...");

    const patterns = ['test', 'demo', 'dummy', 'placeholder', 'example', 'sample'];

    for (const pattern of patterns) {
        const { data, count, error } = await supabase
            .from('businesses')
            .select('name', { count: 'exact', head: false })
            .ilike('name', `%${pattern}%`)
            .limit(10);

        if (error) {
            console.error(`Error searching for ${pattern}:`, error);
            continue;
        }

        if (count > 0) {
            console.log(`\nFound ${count} records matching "${pattern}":`);
            data.forEach(b => console.log(` - ${b.name}`));
        }
    }

    // Count unverified listings again just to be sure
    const { count: unverifiedCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

    console.log(`\nTotal Unverified Listings: ${unverifiedCount}`);
}

auditIntegrity();
