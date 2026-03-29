
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function updatePosts() {
    const gbContent = fs.readFileSync('scripts/expanded_plumber_guide_gb.md', 'utf8');
    const usContent = fs.readFileSync('scripts/expanded_plumber_guide_us.md', 'utf8');

    console.log("Updating UK post...");
    const { error: gbError } = await supabase
        .from('posts')
        .update({
            content: gbContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', '5-signs-emergency-plumber-needed-gb');

    if (gbError) console.error("GB Update Error:", gbError);
    else console.log("GB Update Success!");

    console.log("Updating US post...");
    const { error: usError } = await supabase
        .from('posts')
        .update({
            content: usContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', '5-signs-emergency-plumber-needed-us');

    if (usError) console.error("US Update Error:", usError);
    else console.log("US Update Success!");
}

updatePosts();
