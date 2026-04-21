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
        slug: 'prevent-structural-damage-subsidence-uk',
        title: '7 Best Ways to Prevent Emergency Structural Damage and Subsidence (UK Master Guide)',
        filePath: 'optimized-blogs/uk-structural-damage-prevention.md',
        excerpt: 'As the spring rains of 2026 arrive, the risk of subsidence peaks in the UK. Learn the 7 best ways to prevent structural emergencies and protect your home investment.',
        cover_image: '/blog/uk-structural-subsidence-hero.png'
    },
    {
        region: 'US',
        slug: 'electrical-panel-burning-smell-us',
        title: '5 Things You Should NEVER Do When Your Electrical Panel Smells Like Burning (US Emergency Guide)',
        filePath: 'optimized-blogs/us-electrical-panel-burning-smell.md',
        excerpt: 'If you smell burning near your electrical panel, you are minutes away from a fire. Discover the 5 critical things you must NEVER do during an electrical emergency.',
        cover_image: '/blog/electrical-panel-burning-smell-hero.png'
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
