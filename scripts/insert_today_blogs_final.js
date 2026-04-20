import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use UK env as it has the same DB URL as US
dotenv.config({ path: path.resolve(__dirname, '..', '.env.uk.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
    {
        region: 'UK',
        slug: 'broken-window-door-glass-securing-uk',
        title: 'Broken Window or Door Glass? Securing Your Home Until the Glazier Arrives',
        filePath: 'optimized-blogs/uk-securing-broken-windows.md',
        excerpt: 'A shattered window is a top-tier home emergency. Learn how to manage the situation safely until a professional glazier can arrive.',
        cover_image: '/blog/uk-broken-window-securing.png'
    },
    {
        region: 'US',
        slug: 'smart-lock-key-broken-emergency-us',
        title: 'Smart Lock Dead or Key Broken? How to Get Back In Without Damage',
        filePath: 'optimized-blogs/us-smart-lock-failures.md',
        excerpt: 'Locked out due to a smart lock failure or a snapped key? Here is how to regain access safely without damaging your property.',
        cover_image: '/blog/us-lockout-smart-lock.png'
    }
];

async function insertPosts() {
    for (const post of posts) {
        console.log(`Processing ${post.region} version...`);
        const rootDir = path.resolve(__dirname, '..');
        const absolutePath = path.resolve(rootDir, post.filePath);
        
        if (!fs.existsSync(absolutePath)) {
            console.error(`File NOT found: ${absolutePath}`);
            continue;
        }

        const content = fs.readFileSync(absolutePath, 'utf8');

        // Check if exists
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
