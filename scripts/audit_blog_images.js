import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditImages() {
    console.log('Fetching all posts for image audit...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content, cover_image');

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    console.log(`Processing ${posts.length} posts...\n`);
    const postsNeedingImages = [];

    for (const post of posts) {
        if (!post.content) continue;

        const imageRegex = /!\[.*?\]\(.*?\)/g;
        const inlineImages = post.content.match(imageRegex) || [];

        // Count cover image as 1
        const totalImages = inlineImages.length + (post.cover_image ? 1 : 0);

        if (totalImages < 3) {
            postsNeedingImages.push({
                title: post.title,
                slug: post.slug,
                currentImageCount: totalImages,
                neededImages: 3 - totalImages
            });
        }
    }

    console.log(`Found ${postsNeedingImages.length} posts needing additional images:\n`);
    postsNeedingImages.forEach(p => {
        console.log(`- [${p.currentImageCount}/3 Images] ${p.title} (${p.slug})`);
        console.log(`  Needs ${p.neededImages} more images.\n`);
    });
}

auditImages();
