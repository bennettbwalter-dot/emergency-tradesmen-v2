import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
    {
        region: 'US',
        slug: 'broken-window-safety-board-up-tips-us',
        title: 'Broken Window? 5 Things You Should NEVER Do Before an Emergency Board-Up Technician Arrives',
        filePath: 'scripts/blog_day37_glazing_safety_us_fixed.md',
        excerpt: 'A shattered window is a top-tier home emergency. Learn the 5 things you should NEVER do to stay safe until a professional board-up tech arrives.',
        cover_image: '/blog/day37/smashed-window-emergency.webp'
    },
    {
        region: 'UK',
        slug: 'broken-window-safety-board-up-tips-gb',
        title: 'Smashed Window? 5 Things You Should NEVER Do Before an Emergency Board-Up Tradesman Arrives',
        filePath: 'scripts/blog_day37_glazing_safety_gb.md',
        excerpt: 'A shattered window is a top-tier home emergency. Learn the 5 things you should NEVER do to stay safe until a professional glazier arrives.',
        cover_image: '/blog/day37/smashed-window-emergency.webp'
    }
];

async function insertPosts() {
    for (const post of posts) {
        console.log(`Processing ${post.region} version...`);
        const content = fs.readFileSync(path.resolve(post.filePath), 'utf8');

        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', post.slug)
            .single();

        const postData = {
            title: post.title,
            slug: post.slug,
            content: content,
            excerpt: post.excerpt,
            published: true,
            published_at: new Date().toISOString(),
            cover_image: post.cover_image
        };

        if (existingPost) {
            console.log(`Updating existing post for ${post.slug}...`);
            const { error } = await supabase
                .from('posts')
                .update(postData)
                .eq('slug', post.slug);

            if (error) console.error(`Error updating ${post.region}:`, error);
            else console.log(`Successfully updated ${post.region} post`);
        } else {
            console.log(`Inserting new post for ${post.slug}...`);
            const { error } = await supabase
                .from('posts')
                .insert(postData);

            if (error) console.error(`Error inserting ${post.region}:`, error);
            else console.log(`Successfully inserted ${post.region} post`);
        }
    }
}

insertPosts().catch(err => {
    console.error('Fatal error:', err);
});
