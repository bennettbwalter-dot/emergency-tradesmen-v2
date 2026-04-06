import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, published, published_at, created_at, cover_image, excerpt')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`\nTOTAL POSTS FOUND: ${data.length}\n`);
    data.forEach((post, i) => {
        console.log(`${i + 1}. [${post.published ? 'PUBLISHED' : 'DRAFT'}] ${post.title}`);
        console.log(`   slug: ${post.slug}`);
        console.log(`   published_at: ${post.published_at || post.created_at}`);
        console.log('');
    });

    fs.writeFileSync('tmp/all_posts_list.json', JSON.stringify(data, null, 2));
    console.log('Full data saved to tmp/all_posts_list.json');
}

main();
