import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listCurrentImages() {
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, title, cover_image')
        .eq('published', true)
        .order('slug');

    console.log('=== CURRENT BLOG IMAGE STATE (All 79 blogs) ===\n');

    const usPosts = posts.filter(p => p.slug.endsWith('-us') || p.slug.endsWith('-usa'));
    const ukPosts = posts.filter(p => p.slug.endsWith('-gb') || p.slug.endsWith('-uk'));
    const sharedPosts = posts.filter(p => !p.slug.match(/-(us|usa|gb|uk)$/));

    console.log(`--- US BLOGS (${usPosts.length}) ---`);
    usPosts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.slug}`);
        console.log(`   Image: ${p.cover_image || 'NULL'}\n`);
    });

    console.log(`\n--- UK BLOGS (${ukPosts.length}) ---`);
    ukPosts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.slug}`);
        console.log(`   Image: ${p.cover_image || 'NULL'}\n`);
    });

    console.log(`\n--- SHARED BLOGS (${sharedPosts.length}) ---`);
    sharedPosts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.slug}`);
        console.log(`   Image: ${p.cover_image || 'NULL'}\n`);
    });
}

listCurrentImages().catch(console.error);
