
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function check() {
    try {
        const { data, error } = await supabase.from('locations').select('*').limit(5);
        console.log("JSON_RESULT:" + JSON.stringify({ dataLength: data?.length, error, firstItem: data?.[0] }));
    } catch (e: any) {
        console.log("JSON_RESULT:" + JSON.stringify({ error: e.message }));
    }
}
check();
