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

async function search(nameQuery) {
    console.log(`--- Searching for "${nameQuery}" ---`);
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('name', `%${nameQuery}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    if (data.length === 0) {
        console.log("No businesses found.");
        return;
    }

    data.forEach(biz => {
        console.log(`ID: ${biz.id}`);
        console.log(`Name: ${biz.name}`);
        console.log(`Is Premium: ${biz.is_premium}`);
        console.log(`Tier: ${biz.tier}`);
        console.log(`Logo: ${biz.logo_url}`);
        console.log(`Trade: ${biz.trade}`);
        console.log(`City: ${biz.city}`);
        console.log(`Verified: ${biz.verified}`);
        console.log(`Services: ${JSON.stringify(biz.services_offered)}`);
        console.log(`Description: ${biz.premium_description}`);
        console.log("------------------------------");
    });
}

const query = process.argv[2] || "Your Business";
search(query);
