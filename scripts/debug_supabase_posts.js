import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCurrentPosts() {
    console.log('Querying Supabase for recent blog posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, published_at')
        .order('published_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log('--- Recent Posts in Database ---');
    posts.forEach(p => {
        console.log(`ID: ${p.id} | Slug: ${p.slug} | Date: ${p.published_at} | Title: ${p.title}`);
    });
    console.log('--------------------------------');

    // Search specifically for the "fastest" ones
    const { data: searchPosts } = await supabase
        .from('posts')
        .select('id, slug')
        .ilike('slug', '%fastest%');

    console.log('Search for "fastest" in slugs:', searchPosts);
}

listCurrentPosts();
