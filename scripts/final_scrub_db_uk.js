import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalScrubUK() {
    const { data, error } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'roadside-breakdown-safety-rules-uk')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    const keywords = ['white cloth', 'hazard lights', 'mirror check', 'high-vis vest', 'roadside kit', 'webp'];
    keywords.forEach(kw => {
        const count = (data.content.match(new RegExp(kw, 'gi')) || []).length;
        console.log(`Keyword "${kw}" found ${count} times.`);
    });
    
    // Log any markdown image tags specifically
    const images = data.content.match(/!\[.*?\]\(.*?\)/g);
    console.log('Current Image Tags in Database (UK):', JSON.stringify(images, null, 2));
}

finalScrubUK();
