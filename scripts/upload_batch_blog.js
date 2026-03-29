import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
    {
        blogPath: 'c:/Users/Nick/OneDrive/protection/OneDrive/content-assistant/brain/memory/allmemories/blog_day33_march_winds_prep.md',
        slug: 'march-winds-property-damage-storm-prep-2026',
        title: 'March Winds: Preparing Your Home for Storm Season (2026 Homeowner’s Guide)',
        excerpt: 'High winds cost homeowners £500M last year. Learn how the "Lift Effect" can damage your roof and how to storm-proof your home before the next warning.',
        cover_image: '/blog/march_winds_prep_cover.png',
        published_at: new Date('2026-03-12').toISOString()
    },
    {
        blogPath: 'c:/Users/Nick/OneDrive/protection/OneDrive/content-assistant/brain/memory/allmemories/blog_day34_spring_condensation.md',
        slug: 'spring-condensation-mould-prevention-air-quality-2026',
        title: 'Spring Condensation & Mould Prevention: Protecting Your Home’s Air Quality (2026 Guide)',
        excerpt: 'Spring is the "hidden" season for mould. Learn why day-night temperature swings cause condensation and how to use "Cross-Flow" ventilation to protect your home.',
        cover_image: '/blog/spring_condensation_cover.png',
        published_at: new Date('2026-03-13').toISOString()
    }
];

async function uploadPosts() {
    for (const post of posts) {
        console.log(`Processing ${post.slug}...`);
        const content = fs.readFileSync(post.blogPath, 'utf8');
        
        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', post.slug)
            .single();

        if (existingPost) {
            const { error } = await supabase
                .from('posts')
                .update({
                    title: post.title,
                    content,
                    excerpt: post.excerpt,
                    published_at: post.published_at,
                    cover_image: post.cover_image
                })
                .eq('slug', post.slug);
            if (error) console.error(`Error updating ${post.slug}:`, error);
            else console.log(`Successfully updated ${post.slug}`);
        } else {
            const { error } = await supabase
                .from('posts')
                .insert({
                    title: post.title,
                    slug: post.slug,
                    content,
                    excerpt: post.excerpt,
                    published_at: post.published_at,
                    cover_image: post.cover_image
                });
            if (error) console.error(`Error inserting ${post.slug}:`, error);
            else console.log(`Successfully inserted ${post.slug}`);
        }
    }
}

uploadPosts();
