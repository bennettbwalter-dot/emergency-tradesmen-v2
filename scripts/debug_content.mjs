import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function debugTOC() {
    const slug = 'emergency-ev-charger-repair-gb';
    const { data: p } = await supabase.from('posts').select('content').eq('slug', slug).single();
    
    if (p) {
        console.log('=== Content sample (first 3000 chars) ===\n');
        console.log(p.content.substring(0, 3000));
    }
}

debugTOC();
