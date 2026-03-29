
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function migrateLondonExtra() {
    console.log("Starting migration of 'london_extra' -> 'London'...");

    // 1. Fetch
    const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name, trade')
        .eq('city', 'london_extra');

    if (fetchError) {
        console.error("Fetch error:", fetchError);
        return;
    }

    console.log(`Found ${businesses?.length || 0} records to migrate.`);

    if (!businesses || businesses.length === 0) return;

    // 2. Update
    // We update matching IDs
    const { error: updateError, count } = await supabase
        .from('businesses')
        .update({ city: 'London', country_code: 'GB' })
        .eq('city', 'london_extra')
        .select();

    if (updateError) {
        console.error("Update error:", updateError);
    } else {
        console.log(`Successfully migrated ${count} records to 'London'.`);
    }

    console.log("Migration complete.");
}

migrateLondonExtra();
