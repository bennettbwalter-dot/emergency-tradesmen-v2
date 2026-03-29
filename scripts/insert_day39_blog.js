import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
    {
        region: 'UK',
        slug: 'fuse-box-overloading-signs-uk',
        title: '7 Dangerous Signs Your Fuse Box is Overloading (A Homeowner\'s Guide)',
        filePath: 'scripts/blog_day39_fuse_box_overload_uk.md',
        excerpt: 'Your consumer unit is the safety brain of your home. Frequent tripping, burning smells, or flickering lights are critical fire hazards. Learn how to spot an overloaded circuit before it starts a fire.',
        cover_image: '/blog/day39/fuse_box_overloading_uk.webp'
    },
    {
        region: 'US',
        slug: 'main-sewer-line-clog-causes-us',
        title: '5 Common Causes of Main Sewer Line Clogs and How to Spot Them',
        filePath: 'scripts/blog_day39_main_sewer_clog_us.md',
        excerpt: 'A main sewer line clog is a full-scale plumbing emergency. Multiple drains backing up or gurgling sounds are signs of a catastrophic blockage. Learn the 5 common causes and how to prevent raw sewage backups.',
        cover_image: '/blog/day39/main_sewer_line_clog_us_backup.webp'
    }
];

async function insertPosts() {
    for (const post of posts) {
        console.log(`Processing ${post.region} version...`);
        // Resolve from project root (one level up from scripts/)
        const rootDir = path.resolve(__dirname, '..');
        const absolutePath = path.resolve(rootDir, post.filePath);
        console.log(`Reading from: ${absolutePath}`);
        
        if (!fs.existsSync(absolutePath)) {
            console.error(`File NOT found: ${absolutePath}`);
            continue;
        }

        const content = fs.readFileSync(absolutePath, 'utf8');

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
