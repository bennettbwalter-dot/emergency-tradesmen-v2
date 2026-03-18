import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
    const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, content, cover_image')
        .in('slug', ['highway-breakdown-safety-protocols-us', 'roadside-breakdown-safety-rules-uk']);

    if (error) {
        console.error('Error:', error);
        return;
    }

    data.forEach(post => {
        console.log(`--- ${post.slug} ---`);
        console.log(`Cover: ${post.cover_image}`);
        const images = post.content.match(/!\[.*?\]\(.*?\)/g) || [];
        console.log(`Body Images:`, images);
    });
}

checkAll();
