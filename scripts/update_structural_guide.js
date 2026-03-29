
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function updateStructuralPost() {
    const gbContent = fs.readFileSync('scripts/expanded_structural_guide_gb.md', 'utf8');

    console.log("Updating UK post...");
    const { error: gbError } = await supabase
        .from('posts')
        .update({
            content: gbContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', 'structural-cracks-subsidence-survey-gb');

    if (gbError) console.error("GB Update Error:", gbError);
    else console.log("GB Update Success!");
}

updateStructuralPost();
