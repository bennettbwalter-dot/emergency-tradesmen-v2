import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        slug: 'roadside-breakdown-safety-rules-uk',
        title: '7 Critical Safety Rules for an Emergency Roadside Breakdown',
        filePath: 'scripts/blog_day38_breakdown_safety_uk.md',
        excerpt: 'If your vehicle fails on a live UK carriageway, you are in immediate danger. Follow these 7 survival rules to stay safe until a certified recovery technician arrives.',
        cover_image: '/blog/day38/us-highway-breakdown-night-hazards.webp'
    },
    {
        region: 'US',
        slug: 'highway-breakdown-safety-protocols-us',
        title: 'Roadside Emergency: 7 Safety Protocols to Survive a Highway Breakdown',
        filePath: 'scripts/blog_day38_breakdown_safety_us.md',
        excerpt: 'A highway breakdown is a life-safety event. Follow these 7 TRAA and FMCSA-aligned protocols to stay safe until a certified tow truck operator arrives.',
        cover_image: '/blog/day38/us-highway-breakdown-night-hazards.webp'
    }
];

async function insertPosts() {
    for (const post of posts) {
        console.log(`Processing ${post.region} version...`);
        // Resolve from project root (one level up from scripts/)
        const rootDir = path.resolve(__dirname, '..');
        const absolutePath = path.resolve(rootDir, post.filePath);
        console.log(`Reading from: ${absolutePath}`);
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
