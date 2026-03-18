import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function globalScrub() {
    const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, content')
        .or('content.ilike.%white cloth%,content.ilike.%hazard lights%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    data.forEach(post => {
        const matches = post.content.match(/!\[.*?\]\(.*?\)/g) || [];
        matches.forEach(m => {
            if (m.toLowerCase().includes('white cloth') || m.toLowerCase().includes('hazard lights')) {
                console.log(`Found broken image tag in slug: ${post.slug}`);
                console.log(`Tag: ${m}`);
            }
        });
    });
}

globalScrub();
