import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function showCurrentState() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, title, cover_image')
        .eq('published', true)
        .order('slug');

    console.log('=== CURRENT BLOG IMAGE STATE (ALL 79 BLOGS) ===\n');

    const usPosts = posts.filter(p => p.slug.endsWith('-us') || p.slug.endsWith('-usa'));
    const ukPosts = posts.filter(p => p.slug.endsWith('-gb') || p.slug.endsWith('-uk'));
    const sharedPosts = posts.filter(p => !p.slug.match(/-(us|usa|gb|uk)$/));

    console.log(`US BLOGS (${usPosts.length}):`);
    usPosts.forEach((p, i) => console.log(`${i+1}. ${p.slug} → ${p.cover_image}`));

    console.log(`\n\nUK BLOGS (${ukPosts.length}):`);
    ukPosts.forEach((p, i) => console.log(`${i+1}. ${p.slug} → ${p.cover_image}`));

    console.log(`\n\nSHARED BLOGS (${sharedPosts.length}):`);
    sharedPosts.forEach((p, i) => console.log(`${i+1}. ${p.slug} → ${p.cover_image}`));
}

showCurrentState().catch(console.error);
