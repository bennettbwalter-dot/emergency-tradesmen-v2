
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl ? supabaseUrl.substring(0, 15) + "..." : "MISSING");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing Insert...");
    const slug = `test-${Date.now()}`;
    const { data, error } = await supabase.from('locations').insert({
        name: 'Test State',
        slug: slug,
        type: 'state',
        state_code: 'TS',
        hierarchy_path: [slug]
    }).select().single();

    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success:", data);
        // Clean up
        await supabase.from('locations').delete().eq('id', data.id);
    }
}

testInsert();
