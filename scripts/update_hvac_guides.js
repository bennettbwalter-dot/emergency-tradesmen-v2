
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function updatePosts() {
    const boilerContent = fs.readFileSync('scripts/expanded_boiler_guide_gb.md', 'utf8');
    const acContent = fs.readFileSync('scripts/expanded_ac_guide_gb.md', 'utf8');

    console.log("Updating Boiler post...");
    const { error: boilerError } = await supabase
        .from('posts')
        .update({
            content: boilerContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', 'boiler-pressure-dropping-filling-loop-gb');

    if (boilerError) console.error("Boiler Update Error:", boilerError);
    else console.log("Boiler Update Success!");

    console.log("Updating AC post...");
    const { error: acError } = await supabase
        .from('posts')
        .update({
            content: acContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', 'ac-heat-pump-not-cooling-troubleshooting-gb');

    if (acError) console.error("AC Update Error:", acError);
    else console.log("AC Update Success!");
}

updatePosts();
