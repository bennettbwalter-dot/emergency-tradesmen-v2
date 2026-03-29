import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function dump() {
    console.log("--- Dumping Businesses ---");
    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, is_premium, tier, logo_url, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(biz => {
        console.log(`ID: ${biz.id}`);
        console.log(`Name: ${biz.name}`);
        console.log(`Is Premium: ${biz.is_premium}`);
        console.log(`Tier: ${biz.tier}`);
        console.log(`Logo: ${biz.logo_url}`);
        console.log(`Created: ${biz.created_at}`);
        console.log("------------------------------");
    });
}

dump();
