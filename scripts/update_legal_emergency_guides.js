
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function updatePosts() {
    const electricityContent = fs.readFileSync('scripts/expanded_legal_electricity_gb.md', 'utf8');
    const emergencyContent = fs.readFileSync('scripts/expanded_emergency_home_guide.md', 'utf8');

    console.log("Updating Electricity post...");
    const { error: electricityError } = await supabase
        .from('posts')
        .update({
            content: electricityContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', 'can-you-legally-stay-in-home-without-electricity');

    if (electricityError) console.error("Electricity Update Error:", electricityError);
    else console.log("Electricity Update Success!");

    console.log("Updating Emergency post...");
    const { error: emergencyError } = await supabase
        .from('posts')
        .update({
            content: emergencyContent,
            updated_at: new Date().toISOString()
        })
        .eq('slug', 'emergency-at-home-guide');

    if (emergencyError) console.error("Emergency Update Error:", emergencyError);
    else console.log("Emergency Update Success!");
}

updatePosts();
